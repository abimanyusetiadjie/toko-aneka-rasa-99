-- database/schema.sql

-- Enable UUID extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id INT NOT NULL REFERENCES roles(id),
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: members
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    points INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: products
-- Note: Base unit stock is directly managed here based on Rules.md
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id INT NOT NULL REFERENCES categories(id),
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    base_unit VARCHAR(20) NOT NULL, -- e.g., 'Pcs', 'Sachet'
    stock INT NOT NULL DEFAULT 0, -- Stock tracked in base_unit
    base_hpp NUMERIC(12, 2) NOT NULL DEFAULT 0, -- HPP for 1 base_unit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: product_units
-- Note: Defines hierarchical conversion units (Dus, Pak) mapping to base_unit
CREATE TABLE product_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    unit_name VARCHAR(20) NOT NULL, -- e.g., 'Dus', 'Pcs'
    conversion_factor INT NOT NULL, -- e.g., 40 (meaning 1 Dus = 40 base_units)
    price NUMERIC(12, 2) NOT NULL, -- Selling price for this specific unit
    barcode VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (product_id, unit_name)
);

-- Table: transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    member_id UUID REFERENCES members(id),
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    total_amount NUMERIC(15, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL, -- 'CASH', 'DEBIT', 'QRIS'
    payment_reference VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED', -- 'PENDING', 'COMPLETED', 'CANCELED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: transaction_details
CREATE TABLE transaction_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    unit_id UUID NOT NULL REFERENCES product_units(id),
    qty INT NOT NULL,
    conversion_factor INT NOT NULL, -- Snapshot of conversion factor at transaction time
    price_per_unit NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(15, 2) NOT NULL
);

-- Table: ml_association_rules
CREATE TABLE ml_association_rules (
    id SERIAL PRIMARY KEY,
    antecedent_product_ids JSONB NOT NULL,
    consequent_product_ids JSONB NOT NULL,
    support NUMERIC(5, 4) NOT NULL,
    confidence NUMERIC(5, 4) NOT NULL,
    lift NUMERIC(10, 4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger Function: update_product_stock_after_sale
CREATE OR REPLACE FUNCTION update_product_stock_after_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- Deduct stock in products table based on qty and conversion_factor
    UPDATE products
    SET stock = stock - (NEW.qty * NEW.conversion_factor),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_id;
    
    -- Validasi Stok Minimum: Raise exception if stock goes below zero
    IF (SELECT stock FROM products WHERE id = NEW.product_id) < 0 THEN
        RAISE EXCEPTION 'Stok tidak mencukupi untuk produk ID % (Terkena limit negatif)', NEW.product_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger definition on transaction_details
CREATE TRIGGER trg_update_stock_after_sale
AFTER INSERT ON transaction_details
FOR EACH ROW
EXECUTE FUNCTION update_product_stock_after_sale();
