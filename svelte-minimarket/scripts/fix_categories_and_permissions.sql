-- ==============================================================================
-- SCRIPT PERBAIKAN PERMISSION & OTOMATISASI KATEGORI 244 PRODUK
-- Toko Aneka Rasa 99
-- Jalankan di VPS: sudo -u postgres psql -d minimarket_db -f scripts/fix_categories_and_permissions.sql
-- ==============================================================================

-- 1. BERIKAN HAK KEPEMILIKAN & AKSES PENUH KE USER minimarket
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' OWNER TO minimarket;';
    EXECUTE 'GRANT ALL PRIVILEGES ON TABLE ' || quote_ident(r.tablename) || ' TO minimarket;';
  END LOOP;
  FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
    EXECUTE 'ALTER SEQUENCE ' || quote_ident(r.sequence_name) || ' OWNER TO minimarket;';
    EXECUTE 'GRANT ALL PRIVILEGES ON SEQUENCE ' || quote_ident(r.sequence_name) || ' TO minimarket;';
  END LOOP;
END $$;

-- 2. PASTIKAN KOLOM base_hpp & barcode TERSEDIA DI TABEL products
ALTER TABLE products ADD COLUMN IF NOT EXISTS base_hpp NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);

-- 3. PASTIKAN SELURUH KATEGORI LENGKAP & TERBARU
INSERT INTO categories (id, slug, name) VALUES
('1e74cb32-59e4-403b-97c6-01665230f5b7', 'bumbu-khas-bangka', 'BUMBU & OLEH-OLEH BANGKA'),
('60c489bd-d317-4d28-8bad-f24e8e732fc2', 'cemilan', 'CEMILAN'),
('0c78d523-1858-48a6-9671-c53a43e5b97e', 'getas-bangka', 'GETAS BANGKA'),
('e4d7a211-9491-49b9-8e47-2bf3e7b1a201', 'kemplang-goreng', 'KEMPLANG GORENG'),
('05fc957b-f0b1-4bb8-b101-a73ebaa1c1aa', 'kemplang-panggang', 'KEMPLANG PANGGANG'),
('7a3cbb9c-080e-42fb-9bb7-f2b14f4e1f93', 'kemplang-pasir', 'KEMPLANG PASIR'),
('7774e144-8dae-4e31-8ae2-6e27a69bcba2', 'kemplang-ring-koin', 'KEMPLANG RING / KOIN'),
('a571ea00-b6f7-418b-ae10-8b093354cb43', 'kerupuk-mentah', 'KERUPUK MENTAH'),
('2c6e6e22-e421-4f93-8686-35ba0633b474', 'kopi-bangka', 'KOPI BANGKA'),
('965f7c22-b529-43c3-ae62-c11dfd9a6566', 'kue-khas-bangka', 'KUE KHAS BANGKA'),
('3448a39a-5f33-4f96-be6a-e64e52b22556', 'non-makanan', 'NON-MAKANAN'),
('55555555-5555-5555-5555-555555555555', 'umum', 'Umum')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug;

-- Update nama kategori kerupuk mentah jika sebelumnya ada embel-embel bangka
UPDATE categories SET name = 'KERUPUK MENTAH', slug = 'kerupuk-mentah' WHERE id = 'a571ea00-b6f7-418b-ae10-8b093354cb43';

-- 4. MIGRASI & PENGELOMPOKKAN OTOMATIS PRODUK DARI KATEGORI UMUM
-- KOPI BANGKA
UPDATE products SET category_id = '2c6e6e22-e421-4f93-8686-35ba0633b474'
WHERE LOWER(name) LIKE '%kopi%';

-- KERUPUK MENTAH
UPDATE products SET category_id = 'a571ea00-b6f7-418b-ae10-8b093354cb43'
WHERE LOWER(name) LIKE '%mentah%';

-- KEMPLANG PASIR
UPDATE products SET category_id = '7a3cbb9c-080e-42fb-9bb7-f2b14f4e1f93'
WHERE LOWER(name) LIKE '%pasir%';

-- KEMPLANG PANGGANG
UPDATE products SET category_id = '05fc957b-f0b1-4bb8-b101-a73ebaa1c1aa'
WHERE (LOWER(name) LIKE '%panggang%' OR LOWER(name) LIKE '%bakar%');

-- KEMPLANG RING / KOIN
UPDATE products SET category_id = '7774e144-8dae-4e31-8ae2-6e27a69bcba2'
WHERE (LOWER(name) LIKE '%ring%' OR LOWER(name) LIKE '%koin%');

-- GETAS BANGKA & AMPLANG
UPDATE products SET category_id = '0c78d523-1858-48a6-9671-c53a43e5b97e'
WHERE (LOWER(name) LIKE '%getas%' OR LOWER(name) LIKE '%amplang%');

-- KEMPLANG GORENG & KERUPUK GORENG LAINNYA
UPDATE products SET category_id = 'e4d7a211-9491-49b9-8e47-2bf3e7b1a201'
WHERE (LOWER(name) LIKE '%kemplang%' OR LOWER(name) LIKE '%kerupuk%')
  AND category_id NOT IN (
    '7a3cbb9c-080e-42fb-9bb7-f2b14f4e1f93', -- KEMPLANG PASIR
    '05fc957b-f0b1-4bb8-b101-a73ebaa1c1aa', -- KEMPLANG PANGGANG
    '7774e144-8dae-4e31-8ae2-6e27a69bcba2', -- KEMPLANG RING / KOIN
    'a571ea00-b6f7-418b-ae10-8b093354cb43'  -- KERUPUK MENTAH
  );

-- BUMBU & OLEH-OLEH BANGKA
UPDATE products SET category_id = '1e74cb32-59e4-403b-97c6-01665230f5b7'
WHERE (
  LOWER(name) LIKE '%terasi%' OR LOWER(name) LIKE '%asam%' OR LOWER(name) LIKE '%asem%' OR 
  LOWER(name) LIKE '%kecap%' OR LOWER(name) LIKE '%rusip%' OR LOWER(name) LIKE '%kecalo%' OR 
  LOWER(name) LIKE '%lada%' OR LOWER(name) LIKE '%bumbu%' OR LOWER(name) LIKE '%sambal%' OR 
  LOWER(name) LIKE '%madu%' OR LOWER(name) LIKE '%kelubi%' OR LOWER(name) LIKE '%gula aren%' OR 
  LOWER(name) LIKE '%gula kabung%' OR LOWER(name) LIKE '%sagu%' OR LOWER(name) LIKE '%tapiok%' OR 
  LOWER(name) LIKE '%tauco%'
);

-- KUE KHAS BANGKA
UPDATE products SET category_id = '965f7c22-b529-43c3-ae62-c11dfd9a6566'
WHERE (
  LOWER(name) LIKE '%kue%' OR LOWER(name) LIKE '%lempok%' OR LOWER(name) LIKE '%rintak%' OR 
  LOWER(name) LIKE '%bangkit%' OR LOWER(name) LIKE '%dodol%' OR LOWER(name) LIKE '%lapis legit%' OR 
  LOWER(name) LIKE '%michang%' OR LOWER(name) LIKE '%bipang%' OR LOWER(name) LIKE '%cha liau%'
);

-- NON-MAKANAN
UPDATE products SET category_id = '3448a39a-5f33-4f96-be6a-e64e52b22556'
WHERE (
  LOWER(name) LIKE '%plastik%' OR LOWER(name) LIKE '%tas%' OR LOWER(name) LIKE '%dus%' OR 
  LOWER(name) LIKE '%sabun%' OR LOWER(name) LIKE '%sikat%'
);

-- CEMILAN (KACANG, KERIPIK, KERICU, MAKARONI DLL)
UPDATE products SET category_id = '60c489bd-d317-4d28-8bad-f24e8e732fc2'
WHERE (
  LOWER(name) LIKE '%keripik%' OR LOWER(name) LIKE '%kacang%' OR LOWER(name) LIKE '%emping%' OR 
  LOWER(name) LIKE '%sukro%' OR LOWER(name) LIKE '%stik%' OR LOWER(name) LIKE '%pilus%' OR 
  LOWER(name) LIKE '%snack%' OR LOWER(name) LIKE '%biskuit%' OR LOWER(name) LIKE '%wafer%' OR 
  LOWER(name) LIKE '%sale%' OR LOWER(name) LIKE '%makaroni%' OR LOWER(name) LIKE '%singkong%' OR 
  LOWER(name) LIKE '%taro%' OR LOWER(name) LIKE '%opak%' OR LOWER(name) LIKE '%pang pang%' OR 
  LOWER(name) LIKE '%permen%' OR LOWER(name) LIKE '%kuping gajah%' OR LOWER(name) LIKE '%kiamboi%' OR 
  LOWER(name) LIKE '%indomie%' OR LOWER(name) LIKE '%kericu%'
);

-- Berikan hak akses kembali untuk memastikan
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO minimarket;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO minimarket;
