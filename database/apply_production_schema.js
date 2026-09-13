import pg from 'pg';

const connectionString = "postgresql://postgres.zdqrraxsefjvopucyysm:minimarket123*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

const schemaSql = `
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STORES
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(30),
    point_spend_per_point INT DEFAULT 10000, -- Rp 10.000 = 1 poin
    point_value_per_point NUMERIC(15,2) DEFAULT 10.00, -- 1 poin = Rp 10 (10 poin = Rp 100)
    allow_negative_stock BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default Store
INSERT INTO stores (id, code, name, address, phone)
VALUES ('11111111-1111-1111-1111-111111111111', 'STORE-001', 'SmartPOS Minimarket Pusat', 'Jl. Pemuda No. 45, Jakarta', '0812-3456-7890')
ON CONFLICT (code) DO NOTHING;

-- 2. ROLES & USERS
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL,
    description TEXT
);

INSERT INTO roles (id, name, description) VALUES
(1, 'owner', 'Pemilik Toko (Akses Penuh Seluruh Cabang & Keuangan)'),
(2, 'manager', 'Manajer Toko (Kelola Produk, Stok, Promo, & Laporan)'),
(3, 'kasir', 'Kasir Operasional (Transaksi & Tutup Shift)')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(id),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default Users
INSERT INTO users (id, store_id, role_id, username, password_hash, full_name)
VALUES 
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 3, 'kasir_siti', '$2y$10$wT8KzQ8iM1xH3fC0u7PDeuVqO3fNq4yCj0K3e0h0Z0X3n0X3n0X3n', 'Siti Aminah (Kasir)'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 2, 'manager_budi', '$2y$10$wT8KzQ8iM1xH3fC0u7PDeuVqO3fNq4yCj0K3e0h0Z0X3n0X3n0X3n', 'Budi Santoso (Manajer)'),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 1, 'owner_hendra', '$2y$10$wT8KzQ8iM1xH3fC0u7PDeuVqO3fNq4yCj0K3e0h0Z0X3n0X3n0X3n', 'Hendra Wijaya (Owner)')
ON CONFLICT (username) DO NOTHING;

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    base_unit VARCHAR(20) NOT NULL DEFAULT 'Pcs',
    base_hpp NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    min_stock_alert INT DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_store_sku UNIQUE (store_id, sku)
);

-- 5. PRODUCT UNITS (Hierarchy & Barcode)
CREATE TABLE IF NOT EXISTS product_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    unit_name VARCHAR(30) NOT NULL,
    conversion_factor INT NOT NULL CHECK (conversion_factor >= 1),
    unit_level INT NOT NULL DEFAULT 1,
    selling_price NUMERIC(15,2) NOT NULL CHECK (selling_price >= 0),
    barcode VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_product_unit UNIQUE (product_id, unit_name),
    CONSTRAINT uq_unit_barcode UNIQUE (barcode)
);

-- 6. STOCK MOVEMENTS LEDGER (Audit Trail)
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    reference_type VARCHAR(30) NOT NULL, -- 'SALE', 'RESTOCK', 'ADJUSTMENT', 'RETURN'
    reference_id UUID,
    qty_base_change INT NOT NULL,
    balance_after INT NOT NULL,
    unit_cost_snapshot NUMERIC(15,2) NOT NULL,
    created_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MEMBERS
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

-- Default Members
INSERT INTO members (id, store_id, phone, name, points_balance, total_spend)
VALUES 
('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', '081299887766', 'Andi Pratama (Member VIP)', 150, 1500000.00),
('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', '085711223344', 'Dewi Lestari (Member Reguler)', 50, 500000.00)
ON CONFLICT (store_id, phone) DO NOTHING;

-- 8. CASHIER SHIFTS
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

-- 9. TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES cashier_shifts(id),
    user_id UUID NOT NULL REFERENCES users(id),
    member_id UUID REFERENCES members(id),
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    subtotal_amount NUMERIC(15,2) NOT NULL,
    discount_amount NUMERIC(15,2) DEFAULT 0.00,
    tax_amount NUMERIC(15,2) DEFAULT 0.00,
    total_amount NUMERIC(15,2) NOT NULL,
    points_earned INT DEFAULT 0,
    points_redeemed INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TRANSACTION DETAILS
CREATE TABLE IF NOT EXISTS transaction_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    unit_id UUID NOT NULL REFERENCES product_units(id),
    qty INT NOT NULL CHECK (qty > 0),
    conversion_factor INT NOT NULL,
    base_qty INT NOT NULL,
    price_per_unit NUMERIC(15,2) NOT NULL,
    cost_price_snapshot NUMERIC(15,2) NOT NULL,
    subtotal NUMERIC(15,2) NOT NULL,
    discount_item NUMERIC(15,2) DEFAULT 0.00
);

-- 11. TRANSACTION PAYMENTS (Split Payment)
CREATE TABLE IF NOT EXISTS transaction_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    payment_method VARCHAR(30) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    payment_reference VARCHAR(100),
    change_given NUMERIC(15,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. MACHINE LEARNING BUNDLE PROMOS & RULES
CREATE TABLE IF NOT EXISTS ml_association_rules (
    id SERIAL PRIMARY KEY,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    antecedent_product_ids JSONB NOT NULL,
    consequent_product_ids JSONB NOT NULL,
    support NUMERIC(8,4) NOT NULL,
    confidence NUMERIC(8,4) NOT NULL,
    lift NUMERIC(8,4) NOT NULL,
    computed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ml_bundle_promos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    primary_product_id UUID REFERENCES products(id),
    bundled_product_id UUID REFERENCES products(id),
    discount_percentage INT NOT NULL DEFAULT 10,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ultra performance
CREATE INDEX IF NOT EXISTS idx_units_barcode ON product_units(barcode);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(store_id, sku);
CREATE INDEX IF NOT EXISTS idx_tx_store_created ON transactions(store_id, created_at);
CREATE INDEX IF NOT EXISTS idx_tx_idempotency ON transactions(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_stock_product ON stock_movements(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_members_phone ON members(store_id, phone);
`;

async function main() {
    const client = await pool.connect();
    try {
        console.log("Applying Production PostgreSQL Schema to Supabase...");
        await client.query(schemaSql);
        console.log("✅ Production PostgreSQL Schema successfully applied!");
    } catch (err) {
        console.error("❌ Schema Migration Error:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
