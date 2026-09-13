import pg from 'pg';
const { Client } = pg;

const DB_URL = "postgresql://postgres.zdqrraxsefjvopucyysm:minimarket123*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

async function main() {
    console.log("Connecting with pg.Client...");
    const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
    try {
        await client.connect();
        console.log("✅ Successfully connected to Supabase!");
        
        const testRes = await client.query("SELECT COUNT(*) FROM products");
        console.log(`Current products in DB: ${testRes.rows[0].count}`);

        const schemaSql = `
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS stores (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            code VARCHAR(20) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            address TEXT,
            phone VARCHAR(30),
            point_spend_per_point INT DEFAULT 10000,
            point_value_per_point NUMERIC(15,2) DEFAULT 10.00,
            allow_negative_stock BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        INSERT INTO stores (id, code, name, address, phone)
        VALUES ('11111111-1111-1111-1111-111111111111', 'STORE-001', 'SmartPOS Minimarket Pusat', 'Jl. Pemuda No. 45, Jakarta', '0812-3456-7890')
        ON CONFLICT (code) DO NOTHING;

        CREATE TABLE IF NOT EXISTS roles (
            id SERIAL PRIMARY KEY,
            name VARCHAR(30) UNIQUE NOT NULL,
            description TEXT
        );

        INSERT INTO roles (id, name, description) VALUES
        (1, 'owner', 'Pemilik Toko'),
        (2, 'manager', 'Manajer Toko'),
        (3, 'kasir', 'Kasir Operasional')
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

        CREATE TABLE IF NOT EXISTS stock_movements (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
            product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            reference_type VARCHAR(30) NOT NULL,
            reference_id UUID,
            qty_base_change INT NOT NULL,
            balance_after INT NOT NULL,
            unit_cost_snapshot NUMERIC(15,2) NOT NULL,
            created_by UUID,
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS members (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
            phone VARCHAR(30) NOT NULL,
            name VARCHAR(100) NOT NULL,
            points_balance INT DEFAULT 0,
            total_spend NUMERIC(15,2) DEFAULT 0.00,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT uq_store_member_phone UNIQUE (store_id, phone)
        );

        INSERT INTO members (id, store_id, phone, name, points_balance, total_spend)
        VALUES 
        ('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', '081299887766', 'Andi Pratama (Member VIP)', 150, 1500000.00),
        ('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', '085711223344', 'Dewi Lestari (Member Reguler)', 50, 500000.00)
        ON CONFLICT (store_id, phone) DO NOTHING;

        CREATE TABLE IF NOT EXISTS cashier_shifts (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES users(id),
            opened_at TIMESTAMPTZ DEFAULT NOW(),
            closed_at TIMESTAMPTZ,
            starting_cash NUMERIC(15,2) NOT NULL,
            expected_cash NUMERIC(15,2),
            actual_cash NUMERIC(15,2),
            cash_difference NUMERIC(15,2),
            status VARCHAR(20) DEFAULT 'OPEN'
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

        CREATE TABLE IF NOT EXISTS ml_bundle_promos (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
            title VARCHAR(150) NOT NULL,
            primary_product_id UUID REFERENCES products(id),
            bundled_product_id UUID REFERENCES products(id),
            discount_percentage INT NOT NULL DEFAULT 10,
            is_approved BOOLEAN DEFAULT FALSE,
            approved_by UUID,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
            user_id UUID,
            action VARCHAR(50) NOT NULL,
            entity_name VARCHAR(50) NOT NULL,
            entity_id VARCHAR(100),
            old_data JSONB,
            new_data JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_units_barcode ON product_units(barcode);
        CREATE INDEX IF NOT EXISTS idx_products_sku ON products(store_id, sku);
        CREATE INDEX IF NOT EXISTS idx_tx_store_created ON transactions(store_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_stock_product ON stock_movements(product_id, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_members_phone ON members(store_id, phone);
        `;

        await client.query(schemaSql);
        console.log("✅ Production tables and indexes successfully created in Supabase!");
        await client.end();
    } catch (err) {
        console.error("Connection Error:", err);
    }
}

main();
