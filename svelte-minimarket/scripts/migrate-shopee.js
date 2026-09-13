import pg from 'pg';
const { Client } = pg;

const DB_URL = "postgresql://postgres.zdqrraxsefjvopucyysm:minimarket123*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

async function main() {
    console.log("Menghubungkan ke Supabase Cloud PostgreSQL...");
    const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
    try {
        await client.connect();
        console.log("✅ Terhubung ke Supabase!");

        // 1. Buat Tabel shopee_orders dan tambah kolom channel ke transactions
        const migrationSql = `
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS shopee_orders (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            order_sn VARCHAR(50) UNIQUE NOT NULL,
            store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
            buyer_username VARCHAR(100) NOT NULL,
            order_status VARCHAR(30) NOT NULL DEFAULT 'READY_TO_SHIP',
            shipping_carrier VARCHAR(50) DEFAULT 'SPX Express',
            tracking_number VARCHAR(100),
            total_amount NUMERIC(15,2) NOT NULL,
            shopee_escrow_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
            items JSONB NOT NULL DEFAULT '[]'::jsonb,
            stock_deducted BOOLEAN DEFAULT TRUE,
            shopee_created_at TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS channel VARCHAR(20) DEFAULT 'POS';
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS external_order_sn VARCHAR(50);

        CREATE INDEX IF NOT EXISTS idx_shopee_orders_status ON shopee_orders(order_status);
        CREATE INDEX IF NOT EXISTS idx_shopee_orders_sn ON shopee_orders(order_sn);
        CREATE INDEX IF NOT EXISTS idx_transactions_channel ON transactions(channel);
        `;

        await client.query(migrationSql);
        console.log("✅ Tabel shopee_orders & kolom channel berhasil dibuat!");

        // 2. Cek apakah sudah ada sampel pesanan Shopee
        const existingCount = await client.query("SELECT COUNT(*) FROM shopee_orders");
        if (Number(existingCount.rows[0].count) === 0) {
            console.log("Menambahkan sampel pesanan Shopee untuk demo...");
            const sampleItems1 = JSON.stringify([
                {
                    name: 'Getas Bulat Cap 99 Makanan Khas Bangka',
                    sku: 'GTS-BLT-CAP-99',
                    qty: 2,
                    price: 37500,
                    subtotal: 75000
                },
                {
                    name: 'Kecap Asin Bangka Cap SS Botol Besar',
                    sku: 'KCP-ASN-SS-BESAR',
                    qty: 1,
                    price: 30500,
                    subtotal: 30500
                }
            ]);

            const sampleItems2 = JSON.stringify([
                {
                    name: 'Kemplang Panggang Cap MM Asli Bangka',
                    sku: 'KMP-PANG-MM-BLT',
                    qty: 3,
                    price: 47500,
                    subtotal: 142500
                }
            ]);

            const sampleItems3 = JSON.stringify([
                {
                    name: 'Kopi Bubuk Cap No. 1 Premium 250g Khas Bangka',
                    sku: 'KOP-CAP1-PRM-250G',
                    qty: 2,
                    price: 51000,
                    subtotal: 102000
                },
                {
                    name: 'Kue Lapis Legit Bangka Cap Kue Lapis',
                    sku: 'KUE-LPS-LGT-BGK',
                    qty: 1,
                    price: 50999,
                    subtotal: 50999
                }
            ]);

            await client.query(`
                INSERT INTO shopee_orders (
                    order_sn, store_id, buyer_username, order_status, shipping_carrier, 
                    tracking_number, total_amount, shopee_escrow_amount, items, stock_deducted, shopee_created_at
                ) VALUES 
                ('240913SP88219A', '11111111-1111-1111-1111-111111111111', 'hendra_wijaya88', 'READY_TO_SHIP', 'SPX Express', 'SPXID04829102910', 105500, 99500, $1, true, NOW() - INTERVAL '1 hour'),
                ('240913SP77321B', '11111111-1111-1111-1111-111111111111', 'ratna_sari_jkt', 'SHIPPED', 'J&T Express', 'JT99281729102', 142500, 135000, $2, true, NOW() - INTERVAL '6 hours'),
                ('240912SP66102C', '11111111-1111-1111-1111-111111111111', 'budi_santoso_bdg', 'COMPLETED', 'SiCepat REG', '004128910298', 152999, 145000, $3, true, NOW() - INTERVAL '1 day')
            `, [sampleItems1, sampleItems2, sampleItems3]);

            console.log("✅ 3 Sampel pesanan Shopee berhasil dimasukkan!");
        }

        await client.end();
        console.log("Migrasi Shopee selesai sukses!");
    } catch (err) {
        console.error("Migration Error:", err);
        process.exit(1);
    }
}

main();
