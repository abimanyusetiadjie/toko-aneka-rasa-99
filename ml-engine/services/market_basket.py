import pandas as pd
from mlxtend.frequent_patterns import fpgrowth, association_rules
from database import get_db_connection
import json

# Parameter berdasarkan Rules.md
MIN_SUPPORT = 0.02
MIN_CONFIDENCE = 0.30
MIN_LIFT = 1.25

def run_market_basket_analysis():
    conn = get_db_connection()
    if not conn:
        return {"status": "error", "message": "Failed to connect to database"}

    try:
        # 1. Fetch Data
        query = """
            SELECT 
                t.id as transaction_id, 
                td.product_id 
            FROM transactions t
            JOIN transaction_details td ON t.id = td.transaction_id
            WHERE t.status = 'COMPLETED'
        """
        
        df = pd.read_sql_query(query, conn)
        
        # Penanganan jika database masih kosong / transaksi terlalu sedikit
        if df.empty or len(df['transaction_id'].unique()) < 5:
            return {
                "status": "success", 
                "message": "Data transaksi historis belum cukup untuk menjalankan algoritma (butuh minimal 5 transaksi)."
            }

        # 2. Transformasi menjadi One-Hot Encoded Binary Matrix
        # Membuat grouping transaksi vs produk dengan mengisi nilai qty (1 jika ada)
        basket = (df.groupby(['transaction_id', 'product_id'])['product_id']
                  .count().unstack().reset_index().fillna(0)
                  .set_index('transaction_id'))

        # Konversi angka berapapun menjadi 1, dan 0 tetap 0 (binary encoding)
        def encode_units(x):
            if x <= 0: return 0
            if x >= 1: return 1
        
        basket_sets = basket.map(encode_units)
        
        # Konversi nama kolom menjadi tipe data string untuk menghindari FutureWarning
        basket_sets.columns = [str(col) for col in basket_sets.columns]

        # 3. Eksekusi FP-Growth
        frequent_itemsets = fpgrowth(basket_sets, min_support=MIN_SUPPORT, use_colnames=True)
        
        if frequent_itemsets.empty:
            return {
                "status": "success", 
                "message": "Tidak ditemukan frequent itemsets yang memenuhi threshold min_support."
            }

        # Menghasilkan association rules berdasarkan metrik confidence
        rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=MIN_CONFIDENCE)
        
        # Filter rules berdasarkan lift ratio sesuai Rules.md
        valid_rules = rules[rules['lift'] > MIN_LIFT]
        
        if valid_rules.empty:
            return {
                "status": "success",
                "message": "Tidak ditemukan aturan asosiasi yang memenuhi threshold lift ratio > 1.25."
            }

        # 4. Menyimpan Hasil ke Database
        cursor = conn.cursor()
        
        # Bersihkan aturan lama
        cursor.execute("TRUNCATE TABLE ml_association_rules")
        
        # Batch insert
        insert_query = """
            INSERT INTO ml_association_rules (antecedent_product_ids, consequent_product_ids, support, confidence, lift)
            VALUES (%s, %s, %s, %s, %s)
        """
        
        records_to_insert = []
        for index, row in valid_rules.iterrows():
            antecedents = json.dumps(list(row['antecedents']))
            consequents = json.dumps(list(row['consequents']))
            support = float(row['support'])
            confidence = float(row['confidence'])
            lift = float(row['lift'])
            
            records_to_insert.append((antecedents, consequents, support, confidence, lift))
        
        from psycopg2.extras import execute_batch
        execute_batch(cursor, insert_query, records_to_insert)
        
        conn.commit()
        cursor.close()
        
        return {
            "status": "success",
            "message": f"Berhasil menganalisis dan menyimpan {len(valid_rules)} aturan asosiasi."
        }

    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Analysis error: {str(e)}")
        return {"status": "error", "message": str(e)}
    
    finally:
        if conn:
            conn.close()
