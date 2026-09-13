-- database/seed.sql

-- Insert Roles
INSERT INTO roles (name) VALUES 
('Admin'), 
('Kasir'), 
('Manager'), 
('Owner');

-- Insert Users (Password hash using dummy bcrypt for sample data)
INSERT INTO users (role_id, username, password_hash, full_name) 
VALUES 
    ((SELECT id FROM roles WHERE name = 'Admin'), 'admin_budi', '$2y$10$samplehashadmin', 'Budi Santoso (Admin)'),
    ((SELECT id FROM roles WHERE name = 'Kasir'), 'kasir_siti', '$2y$10$samplehashkasir', 'Siti Aminah (Kasir)');

-- Insert Categories
INSERT INTO categories (name) VALUES 
('Makanan Ringan'), 
('Minuman'), 
('Sembako');

-- Seed Products and Product Units
-- Using DO block to handle UUID variables smoothly for relational inserts
DO $$
DECLARE
    cat_makanan INT;
    cat_minuman INT;
    cat_sembako INT;
    
    p_indomie UUID := gen_random_uuid();
    p_susu UUID := gen_random_uuid();
    p_kopi UUID := gen_random_uuid();
    p_biskuit UUID := gen_random_uuid();
    p_beras UUID := gen_random_uuid();
BEGIN
    SELECT id INTO cat_makanan FROM categories WHERE name = 'Makanan Ringan';
    SELECT id INTO cat_minuman FROM categories WHERE name = 'Minuman';
    SELECT id INTO cat_sembako FROM categories WHERE name = 'Sembako';

    -- 1. Insert Products (base_unit and stock in base_unit)
    INSERT INTO products (id, category_id, sku, name, base_unit, stock, base_hpp) VALUES
    (p_indomie, cat_makanan, 'SKU-IND-001', 'Indomie Goreng', 'Pcs', 200, 2500),
    (p_susu, cat_minuman, 'SKU-SUS-001', 'Susu UHT 1L', 'Pcs', 50, 15000),
    (p_kopi, cat_minuman, 'SKU-KOP-001', 'Kopi Sachet ABC', 'Sachet', 300, 1000),
    (p_biskuit, cat_makanan, 'SKU-BIS-001', 'Biskuit Roma Kelapa', 'Pcs', 100, 8000),
    (p_beras, cat_sembako, 'SKU-BER-001', 'Beras Maknyus', 'Kg', 500, 11000);

    -- 2. Insert Product Units (Multi-satuan)
    
    -- Indomie: 1 Dus = 40 Pcs, 1 Pcs = 1 Pcs
    INSERT INTO product_units (product_id, unit_name, conversion_factor, price, barcode) VALUES
    (p_indomie, 'Dus', 40, 115000, '89999990001D'),
    (p_indomie, 'Pcs', 1, 3000, '89999990001P');

    -- Susu UHT: 1 Dus = 12 Pcs, 1 Pcs = 1 Pcs
    INSERT INTO product_units (product_id, unit_name, conversion_factor, price, barcode) VALUES
    (p_susu, 'Dus', 12, 205000, '89999990002D'),
    (p_susu, 'Pcs', 1, 18000, '89999990002P');

    -- Kopi Sachet: 1 Dus = 100 Sachet, 1 Renteng = 10 Sachet, 1 Sachet = 1 Sachet
    INSERT INTO product_units (product_id, unit_name, conversion_factor, price, barcode) VALUES
    (p_kopi, 'Dus', 100, 130000, '89999990003D'),
    (p_kopi, 'Renteng', 10, 14000, '89999990003R'),
    (p_kopi, 'Sachet', 1, 1500, '89999990003S');

    -- Biskuit: 1 Dus = 24 Pcs, 1 Pcs = 1 Pcs
    INSERT INTO product_units (product_id, unit_name, conversion_factor, price, barcode) VALUES
    (p_biskuit, 'Dus', 24, 210000, '89999990004D'),
    (p_biskuit, 'Pcs', 1, 9500, '89999990004P');

    -- Beras: 1 Karung = 5 Kg, 1 Kg = 1 Kg
    INSERT INTO product_units (product_id, unit_name, conversion_factor, price, barcode) VALUES
    (p_beras, 'Karung 5Kg', 5, 62000, '89999990005K'),
    (p_beras, 'Kg', 1, 13000, '89999990005G');
END $$;
