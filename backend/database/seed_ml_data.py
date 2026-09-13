import psycopg2
import uuid
import random
from datetime import datetime, timedelta

# Database Connection (Using port 6543 which is the standard pooler port, or 5432)
DB_HOST = "aws-0-ap-southeast-1.pooler.supabase.com"
DB_PORT = "6543"
DB_NAME = "postgres"
DB_USER = "postgres.zdqrraxsefjvopucyysm"
DB_PASSWORD = "minimarket123*"

def get_connection():
    try:
        return psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            sslmode='require'
        )
    except Exception as e:
        # Fallback to 5432 if 6543 fails
        return psycopg2.connect(
            host=DB_HOST,
            port="5432",
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            sslmode='require'
        )

def seed_ml_data():
    conn = get_connection()
    cursor = conn.cursor()

    try:
        print("Mempersiapkan data ML (1000 transaksi)...")
        
        # 1. Pastikan produk baru ada di database
        # Ambil category_id
        cursor.execute("SELECT id FROM categories WHERE name = 'Sembako' LIMIT 1")
        cat_sembako = cursor.fetchone()[0]
        cursor.execute("SELECT id FROM categories WHERE name = 'Minuman' LIMIT 1")
        cat_minuman = cursor.fetchone()[0]

        # Daftar produk baru
        new_products = [
            (str(uuid.uuid4()), cat_sembako, 'SKU-SUSU-001', 'Susu Anak Formula', 'Dus', 1000, 75000),
            (str(uuid.uuid4()), cat_sembako, 'SKU-POPOK-001', 'Popok Bayi M', 'Pack', 1000, 50000),
            (str(uuid.uuid4()), cat_minuman, 'SKU-SIRUP-001', 'Sirup Marjan Melon', 'Botol', 2000, 18000),
        ]
        
        for p in new_products:
            # Insert product
            cursor.execute("""
                INSERT INTO products (id, category_id, sku, name, base_unit, stock, base_hpp)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (sku) DO NOTHING
            """, p)
            # Insert product unit
            cursor.execute("""
                INSERT INTO product_units (product_id, unit_name, conversion_factor, price, barcode)
                VALUES (%s, %s, 1, %s, %s)
            """, (p[0], p[4], p[6] + 5000, "899" + p[2].replace("-", "")))
        
        # Ambil semua produk dan unitnya
        cursor.execute("""
            SELECT p.id, p.name, pu.id as unit_id, pu.price, p.base_hpp 
            FROM products p 
            JOIN product_units pu ON p.id = pu.product_id 
            WHERE pu.conversion_factor = 1
        """)
        products = cursor.fetchall()
        
        # Ekstrak ID untuk produk spesifik
        susu_anak = next(p for p in products if 'Susu Anak' in p[1])
        popok_bayi = next(p for p in products if 'Popok Bayi' in p[1])
        sirup = next(p for p in products if 'Sirup' in p[1])
        other_products = [p for p in products if p[0] not in (susu_anak[0], popok_bayi[0], sirup[0])]

        # Ambil user kasir
        cursor.execute("SELECT id FROM users WHERE username = 'kasir_siti' LIMIT 1")
        kasir_id = cursor.fetchone()[0]

        # 2. Update stok menjadi sangat besar agar tidak minus saat trigger berjalan
        cursor.execute("UPDATE products SET stock = 1000000")
        
        # 3. Hapus transaksi lama agar bersih
        cursor.execute("DELETE FROM transaction_details")
        cursor.execute("DELETE FROM transactions")

        # 4. Generate 1000 Transaksi
        start_date = datetime(2026, 2, 1)
        end_date = datetime(2026, 7, 31)
        total_days = (end_date - start_date).days
        
        # Ramadhan approx (March 10 - April 9)
        ramadan_start = datetime(2026, 3, 10)
        ramadan_end = datetime(2026, 4, 9)

        # Siapkan 100 indeks transaksi untuk injeksi pola Susu + Popok
        association_indices = set(random.sample(range(1000), 100))
        
        transactions_to_insert = []
        details_to_insert = []

        for i in range(1000):
            # Acak tanggal
            random_days = random.randint(0, total_days)
            random_seconds = random.randint(0, 86400) # Jam acak
            tx_date = start_date + timedelta(days=random_days, seconds=random_seconds)
            
            tx_id = str(uuid.uuid4())
            receipt = f"TRX-{tx_date.strftime('%Y%m%d')}-{i:04d}"
            
            items_bought = []
            
            # Pola 1: Association Rule (Susu Anak + Popok Bayi) -> 100 transaksi
            if i in association_indices:
                items_bought.append(susu_anak)
                items_bought.append(popok_bayi)
            
            # Pola 2: Time Series Spike (Sirup Marjan saat Ramadan)
            is_ramadan = ramadan_start <= tx_date <= ramadan_end
            sirup_probability = 0.85 if is_ramadan else 0.05
            
            if random.random() < sirup_probability:
                items_bought.append(sirup)
            
            # Pola 3: Random item lainnya (belanja normal)
            num_random = random.randint(1, 4)
            random_items = random.sample(other_products, min(num_random, len(other_products)))
            
            # Gabungkan dan hilangkan duplikat
            items_bought.extend(random_items)
            items_bought = list(set(items_bought)) # Unique products
            
            # Hitung total
            total_amount = 0
            for item in items_bought:
                qty = random.randint(1, 3)
                subtotal = qty * item[3] # price
                total_amount += subtotal
                
                # schema: (id, transaction_id, product_id, unit_id, qty, conversion_factor, price_per_unit, subtotal)
                details_to_insert.append((
                    str(uuid.uuid4()), tx_id, item[0], item[2], qty, 1, item[3], subtotal
                ))
            
            transactions_to_insert.append((
                tx_id, receipt, kasir_id, total_amount, 'QRIS', f"QRIS-{receipt}", 'COMPLETED', tx_date
            ))

        # 4. Insert Batch
        from psycopg2.extras import execute_batch
        
        # Insert Transactions
        print("Inserting 1000 transactions...")
        execute_batch(cursor, """
            INSERT INTO transactions (id, receipt_number, user_id, total_amount, payment_method, payment_reference, status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, transactions_to_insert)
        
        # Insert Details
        print(f"Inserting {len(details_to_insert)} transaction details...")
        execute_batch(cursor, """
            INSERT INTO transaction_details (id, transaction_id, product_id, unit_id, qty, conversion_factor, price_per_unit, subtotal)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, details_to_insert)

        conn.commit()
        print("1000 Transaksi Dummy Berhasil Disuntikkan!")
        
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    seed_ml_data()
