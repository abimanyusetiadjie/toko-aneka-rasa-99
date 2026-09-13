import pg from 'pg';
const { Client } = pg;

const DB_URL = "postgresql://postgres.zdqrraxsefjvopucyysm:minimarket123*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

async function fixTables() {
    console.log("🔌 Menghubungkan ke Supabase Cloud...");
    const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
    await client.connect();

    try {
        console.log("🛠️ Memperbaiki dan melengkapi tabel di Supabase...");

        await client.query(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

            CREATE TABLE IF NOT EXISTS stores (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                code VARCHAR(20) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                address TEXT,
                phone VARCHAR(30),
                point_spend_per_point INT DEFAULT 10000,
                point_value_per_point NUMERIC(15,2) DEFAULT 10.00,
                allow_negative_stock BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );

            INSERT INTO stores (id, code, name, address, phone)
            VALUES ('11111111-1111-1111-1111-111111111111', 'STORE-001', 'Toko Aneka Rasa 99 Pusat', 'Poris Indah Blok B 11 No.1', '0812-3456-7890')
            ON CONFLICT (code) DO NOTHING;

            CREATE TABLE IF NOT EXISTS cashier_shifts (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
                user_id UUID NOT NULL,
                opened_at TIMESTAMPTZ DEFAULT NOW(),
                closed_at TIMESTAMPTZ,
                starting_cash NUMERIC(15,2) NOT NULL DEFAULT 200000,
                expected_cash NUMERIC(15,2),
                actual_cash NUMERIC(15,2),
                cash_difference NUMERIC(15,2),
                status VARCHAR(20) DEFAULT 'OPEN'
            );

            CREATE TABLE IF NOT EXISTS stock_movements (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
                product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                reference_type VARCHAR(30) NOT NULL,
                reference_id UUID,
                qty_base_change INT NOT NULL,
                balance_after INT NOT NULL,
                unit_cost_snapshot NUMERIC(15,2) NOT NULL DEFAULT 0,
                created_by UUID,
                notes TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS transaction_payments (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
                payment_method VARCHAR(30) NOT NULL,
                amount NUMERIC(15,2) NOT NULL,
                payment_reference VARCHAR(100),
                change_given NUMERIC(15,2) DEFAULT 0.00,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            -- Pastikan kolom di transactions lengkap
            ALTER TABLE transactions 
                ADD COLUMN IF NOT EXISTS store_id UUID,
                ADD COLUMN IF NOT EXISTS shift_id UUID,
                ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(100),
                ADD COLUMN IF NOT EXISTS subtotal_amount NUMERIC(15,2) DEFAULT 0,
                ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(15,2) DEFAULT 0,
                ADD COLUMN IF NOT EXISTS points_earned INT DEFAULT 0,
                ADD COLUMN IF NOT EXISTS points_redeemed INT DEFAULT 0,
                ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) DEFAULT 'CASH',
                ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100);

            -- Pastikan kolom di transaction_details lengkap
            ALTER TABLE transaction_details
                ADD COLUMN IF NOT EXISTS base_qty INT,
                ADD COLUMN IF NOT EXISTS cost_price_snapshot NUMERIC(15,2) DEFAULT 0;
        `);

        console.log("✅ Semua tabel dan kolom di Supabase sudah 100% lengkap!");

        // Buat shift open default jika belum ada
        const userRes = await client.query("SELECT id FROM users WHERE username = 'kasir_siti' LIMIT 1");
        if (userRes.rows.length > 0) {
            const userId = userRes.rows[0].id;
            const shiftCheck = await client.query("SELECT id FROM cashier_shifts WHERE user_id = $1 AND status = 'OPEN'", [userId]);
            if (shiftCheck.rows.length === 0) {
                await client.query(`
                    INSERT INTO cashier_shifts (store_id, user_id, starting_cash, status)
                    VALUES ('11111111-1111-1111-1111-111111111111', $1, 200000, 'OPEN')
                `, [userId]);
                console.log("✅ Shift kasir aktif (OPEN) berhasil dibuat untuk kasir_siti!");
            }
        }

    } catch (err) {
        console.error("❌ Error fixing tables:", err);
    } finally {
        await client.end();
    }
}

fixTables();
