-- ==============================================================================
-- SCRIPT PENYELARASAN MENYELURUH STOK & SATUAN (PRODUCTS & PRODUCT_UNITS)
-- Toko Aneka Rasa 99
-- Jalankan di VPS: sudo -u postgres psql -d minimarket_db -f scripts/fix_stock_and_units_sync.sql
-- ==============================================================================

BEGIN;

-- 1. Pastikan kolom pendukung tersedia di tabel products
ALTER TABLE products ADD COLUMN IF NOT EXISTS base_hpp NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);

-- 2. Sinkronkan barcode pada tabel products jika masih kosong tapi ada di product_units
UPDATE products p
SET barcode = pu.barcode
FROM product_units pu
WHERE p.id = pu.product_id 
  AND (p.barcode IS NULL OR p.barcode = '')
  AND pu.barcode IS NOT NULL 
  AND pu.barcode != '';

-- 3. Sinkronkan barcode pada product_units jika masih kosong tapi ada di products
UPDATE product_units pu
SET barcode = p.barcode
FROM products p
WHERE pu.product_id = p.id 
  AND (pu.barcode IS NULL OR pu.barcode = '')
  AND p.barcode IS NOT NULL 
  AND p.barcode != '';

-- 4. Pastikan SETIAP produk aktif memiliki minimal satu unit utama (conversion_factor = 1)
INSERT INTO product_units (id, product_id, unit_name, conversion_factor, price, barcode, created_at)
SELECT 
    gen_random_uuid(),
    p.id,
    COALESCE(p.unit, 'Pcs'),
    1,
    COALESCE(p.price, 0),
    COALESCE(p.barcode, p.sku),
    NOW()
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM product_units pu WHERE pu.product_id = p.id
)
AND (p.is_active = TRUE OR p.is_active IS NULL);

-- 5. Khusus 'Kemplang Panggang 33 Besar' (Barcode 100751)
-- Pastikan barcode 100751 terhubung ke produk dengan stok tertinggi (17 pcs)
UPDATE products 
SET barcode = '100751',
    stock = GREATEST(stock, 17),
    is_active = TRUE,
    updated_at = NOW()
WHERE name ILIKE '%33 Besar%' OR sku = 'SKU-KEM-751';

UPDATE product_units pu
SET barcode = '100751',
    price = 30000
FROM products p
WHERE pu.product_id = p.id
  AND (p.name ILIKE '%33 Besar%' OR p.sku = 'SKU-KEM-751')
  AND (pu.conversion_factor = 1 OR pu.conversion_factor IS NULL);

-- 6. Khusus 'Kemplang Panggang 33 Kecil' (Barcode 100805)
UPDATE products 
SET barcode = '100805',
    stock = GREATEST(stock, 15),
    is_active = TRUE,
    updated_at = NOW()
WHERE name ILIKE '%33 Kecil%' OR sku = 'SKU-KEM-805';

UPDATE product_units pu
SET barcode = '100805',
    price = 15000
FROM products p
WHERE pu.product_id = p.id
  AND (p.name ILIKE '%33 Kecil%' OR p.sku = 'SKU-KEM-805')
  AND (pu.conversion_factor = 1 OR pu.conversion_factor IS NULL);

-- 7. Bersihkan barcode duplikat pada produk non-aktif jika ada
UPDATE product_units pu
SET barcode = NULL
FROM products p
WHERE pu.product_id = p.id
  AND p.is_active = FALSE
  AND EXISTS (
      SELECT 1 FROM product_units pu2 
      JOIN products p2 ON pu2.product_id = p2.id
      WHERE pu2.barcode = pu.barcode 
        AND p2.is_active = TRUE 
        AND p2.id != p.id
  );

COMMIT;

-- Tampilkan status verifikasi Kemplang 33 Besar
SELECT p.id, p.sku, p.name, p.barcode as prod_barcode, pu.barcode as unit_barcode, p.stock, pu.price 
FROM products p
JOIN product_units pu ON p.id = pu.product_id
WHERE p.name ILIKE '%33 Besar%' OR pu.barcode = '100751';
