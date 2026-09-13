-- 1. EXTENSIONS & RESET
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

-- 2. TABEL KATEGORI (SESUAI ETALASE TOKO)
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    shopee_category_id BIGINT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABEL PRODUK POS
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT,
    sku VARCHAR(60) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    cost_price NUMERIC(12, 2) DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 100,
    unit VARCHAR(20) DEFAULT 'pcs',
    is_active BOOLEAN DEFAULT TRUE,
    shopee_item_id BIGINT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_name ON public.products(name);

-- 4. INSERT MASTER KATEGORI
INSERT INTO public.categories (slug, name) VALUES
('getas-bangka', 'GETAS BANGKA'),
('kue-khas-bangka', 'KUE KHAS BANGKA'),
('kopi-bangka', 'KOPI BANGKA'),
('cemilan', 'CEMILAN'),
('kemplang-ring-koin', 'KEMPLANG RING / KOIN'),
('kemplang-panggang', 'KEMPLANG PANGGANG'),
('kemplang-pasir', 'KEMPLANG PASIR'),
('kerupuk-mentah-bangka', 'KERUPUK MENTAH BANGKA'),
('bumbu-khas-bangka', 'BUMBU & OLEH-OLEH BANGKA'),
('non-makanan', 'NON-MAKANAN');

-- 5. INSERT SEED DATA PRODUK (DE-DUPLICATED & STANDARDIZED)
WITH cat AS (
    SELECT id, slug FROM public.categories
)
INSERT INTO public.products (sku, category_id, name, price, unit, stock) VALUES
-- ==================== [GETAS BANGKA] ====================
('GTS-BLT-OBOR-MERAH', (SELECT id FROM cat WHERE slug = 'getas-bangka'), 'Getas Bulat Obor Merah Cap Tiga Roda Makanan Khas Bangka', 43500, 'pcs', 100),
('GTS-SUP-PJG-BIRU-250G', (SELECT id FROM cat WHERE slug = 'getas-bangka'), 'Getas Super Cap Obor Tiga Roda Panjang Kantong Biru 250g', 48500, 'pcs', 100),
('GTS-SUP-BLT-BIRU-250G', (SELECT id FROM cat WHERE slug = 'getas-bangka'), 'Getas Super Cap Obor Tiga Roda Bulat Kantong Biru 250g', 49500, 'pcs', 100),
('GTS-LCG-PJG', (SELECT id FROM cat WHERE slug = 'getas-bangka'), 'Getas Cap Lonceng Bentuk Panjang', 75000, 'pcs', 100),
('GTS-SUP-TGR-100G', (SELECT id FROM cat WHERE slug = 'getas-bangka'), 'Getas Super Cap Ikan Tenggiri Khas Bangka 100g', 22000, 'pcs', 100),
('GTS-BLT-CAP-99', (SELECT id FROM cat WHERE slug = 'getas-bangka'), 'Getas Bulat Cap 99 Makanan Khas Bangka', 37500, 'pcs', 100),

-- ==================== [KUE KHAS BANGKA] ====================
('KUE-SMPRT-ED', (SELECT id FROM cat WHERE slug = 'kue-khas-bangka'), 'Kue Sempret Kering Cap ED Khas Bangka', 26000, 'pcs', 50),
('KUE-MCH-BPG-BGK', (SELECT id FROM cat WHERE slug = 'kue-khas-bangka'), 'Michang / Bipang / Cha Liau Bangka', 20000, 'pcs', 50),
('KUE-LPS-LGT-BGK', (SELECT id FROM cat WHERE slug = 'kue-khas-bangka'), 'Kue Lapis Legit Bangka Cap Kue Lapis', 50999, 'pcs', 30),
('KUE-SGN-MR-JO', (SELECT id FROM cat WHERE slug = 'kue-khas-bangka'), 'Kue Sagon Bangka Bulat Kecil Cap Mr. Jo', 19500, 'pcs', 50),
('KUE-BNGKT-RNTA', (SELECT id FROM cat WHERE slug = 'kue-khas-bangka'), 'Kue Bangkit / Kue Rintak Bravery', 25000, 'pcs', 50),
('KUE-BLN-KD-SE', (SELECT id FROM cat WHERE slug = 'kue-khas-bangka'), 'Kue Bulan Bangka Cap KD SE Anugrah', 16000, 'pcs', 60),
('KUE-TNG-TNG-KCG', (SELECT id FROM cat WHERE slug = 'kue-khas-bangka'), 'Teng Teng Bangka Kacang Biasa', 32500, 'pcs', 50),
('KUE-RTI-KRG-GULA', (SELECT id FROM cat WHERE slug = 'kue-khas-bangka'), 'Roti Kering Gula Mr. Jo Rokerz Asli', 25000, 'pcs', 50),
('KUE-RNTK-SAGU-LM', (SELECT id FROM cat WHERE slug = 'kue-khas-bangka'), 'Kue Rintak Sagu LM Kue Tradisional Khas Bangka', 27500, 'pcs', 50),
('TPG-SAGU-TANI-1KG', (SELECT id FROM cat WHERE slug = 'kue-khas-bangka'), 'Tepung Tapioka / Sagu Tani Cap Kampung Tani 1kg', 31500, 'pcs', 100),
('TPG-SAGU-RAKRUT', (SELECT id FROM cat WHERE slug = 'kue-khas-bangka'), 'Sagu Rakrut / Sagu Asli Bangka', 35000, 'pcs', 100),

-- ==================== [KOPI BANGKA] ====================
('KOP-CAP1-BIRU-500G', (SELECT id FROM cat WHERE slug = 'kopi-bangka'), 'Kopi Bubuk Cap 1 Kantong Biru 500g', 60000, 'pcs', 50),
('KOP-CAP1-PRM-250G', (SELECT id FROM cat WHERE slug = 'kopi-bangka'), 'Kopi Bubuk Cap No. 1 Premium 250g Khas Bangka Kemasan Baru', 51000, 'pcs', 50),
('KOP-CAP1-SLV-250G', (SELECT id FROM cat WHERE slug = 'kopi-bangka'), 'Kopi Bubuk Cap 1 Kantong Silver Dari Bangka 250g', 45500, 'pcs', 50),
('KOP-KK-MRH-200G', (SELECT id FROM cat WHERE slug = 'kopi-bangka'), 'Kopi Bubuk Asli Cap Kingkong Kantong Merah 200g', 42500, 'pcs', 50),
('KOP-KK-MRH-70G', (SELECT id FROM cat WHERE slug = 'kopi-bangka'), 'Kopi Bubuk Asli Cap Kingkong Kantong Merah 70g', 17000, 'pcs', 50),
('KOP-CAP1-BIRU-BKG', (SELECT id FROM cat WHERE slug = 'kopi-bangka'), 'Kopi Bubuk Cap 1 Kantong Biru Dari Bangka', 45500, 'pcs', 50),

-- ==================== [CEMILAN] ====================
('CML-KMB-PTH-60G', (SELECT id FROM cat WHERE slug = 'cemilan'), 'Kiamboi Putih Asin Asem Manis 60g', 22500, 'pcs', 80),
('CML-IDM-UDG-BGK', (SELECT id FROM cat WHERE slug = 'cemilan'), 'Indomie Kaldu Udang Edisi Hanya di Bangka', 6200, 'pcs', 200),
('CML-SMP-UDG-500G', (SELECT id FROM cat WHERE slug = 'cemilan'), 'Spring Roll / Sumpia Udang 500g', 43500, 'pcs', 50),
('CML-SMP-UDG-250G', (SELECT id FROM cat WHERE slug = 'cemilan'), 'Spring Roll / Sumpia Udang 250g', 25000, 'pcs', 60),
('CML-KCG-ATM-SAT-250G', (SELECT id FROM cat WHERE slug = 'cemilan'), 'Kacang Atom Satelit Palapa Repack 250g', 16000, 'pcs', 50),
('CML-KCG-TLR-2P-200G', (SELECT id FROM cat WHERE slug = 'cemilan'), 'Kacang Telur 2P 200g Renyah Gurih', 37000, 'pcs', 50),
('CML-EMP-KCL-MNIS-250G', (SELECT id FROM cat WHERE slug = 'cemilan'), 'Emping Kecil Manis Pedas 250g', 22000, 'pcs', 50),
('CML-PRM-HCK-14P', (SELECT id FROM cat WHERE slug = 'cemilan'), 'Permen Hack Isi 14 Pcs', 12000, 'pcs', 100),
('ABN-IKN-TGR-SMB', (SELECT id FROM cat WHERE slug = 'cemilan'), 'Abon Ikan Tenggiri Super Sambalingkung Khas Bangka', 67000, 'pcs', 40),

-- ==================== [KEMPLANG RING / KOIN] ====================
('KMP-KOIN-CMI-SAN', (SELECT id FROM cat WHERE slug = 'kemplang-ring-koin'), 'Kemplang Koin Cumi San Crispy', 19000, 'pcs', 80),

-- ==================== [KEMPLANG PANGGANG] ====================
('KMP-PANG-MM-BLT', (SELECT id FROM cat WHERE slug = 'kemplang-panggang'), 'Kemplang Panggang Cap MM Asli Bangka', 47500, 'pcs', 80),
('KMP-PANG-MM-KTK', (SELECT id FROM cat WHERE slug = 'kemplang-panggang'), 'Kemplang Panggang MM Bentuk Kotak Asli Bangka', 30000, 'pcs', 80),
('KMP-PANG-323-10P', (SELECT id FROM cat WHERE slug = 'kemplang-panggang'), 'Kemplang Panggang 323 Kemasan Besar Isi 10 Pcs', 25000, 'pcs', 80),
('KMP-PANG-323-KCL', (SELECT id FROM cat WHERE slug = 'kemplang-panggang'), 'Kemplang Panggang Bangka Cap 323 Kecil Banten', 17000, 'pcs', 80),
('KMP-OVN-CMI', (SELECT id FROM cat WHERE slug = 'kemplang-panggang'), 'Kemplang Oven Rasa Cumi Khas Bangka', 35000, 'pcs', 80),
('KMP-OVN-IKN-TRSI', (SELECT id FROM cat WHERE slug = 'kemplang-panggang'), 'Kemplang Oven Ikan Sambal Terasi', 30000, 'pcs', 80),

-- ==================== [KEMPLANG PASIR] ====================
('KMP-GRG-PSR-ACH', (SELECT id FROM cat WHERE slug = 'kemplang-pasir'), 'Kemplang Goreng Pasir Mini Cap Achon Enak Crispy', 20000, 'pcs', 80),
('KMP-GRG-PSR-TJKR', (SELECT id FROM cat WHERE slug = 'kemplang-pasir'), 'Kemplang Goreng Pasir Tjokro Enak Gurih', 19500, 'pcs', 80),
('KMP-GRG-PSR-MINI-SNK', (SELECT id FROM cat WHERE slug = 'kemplang-pasir'), 'Kemplang Goreng Pasir Mini Cap Enak Snack', 25000, 'pcs', 80),
('KMP-GRG-IKN-SLN-250G', (SELECT id FROM cat WHERE slug = 'kemplang-pasir'), 'Kemplang Goreng Ikan Selan / Ikan Alu 250g', 45000, 'pcs', 60),
('KMP-GRG-UDG-BGK', (SELECT id FROM cat WHERE slug = 'kemplang-pasir'), 'Kemplang Goreng Udang Khas Bangka', 35000, 'pcs', 60),

-- ==================== [KERUPUK MENTAH BANGKA] ====================
('KRP-MTH-MWR-500G', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Keriting Mawar Warna Warni Mentah 500g', 17500, 'pcs', 100),
('KRP-MTH-MWR-1KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Keriting Mawar Warna Warni 1kg', 30000, 'pcs', 100),
('KRP-MTH-MWR-5KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Keriting Mawar Warna Warni 1 Ball 5kg', 125000, 'pcs', 40),
('KRP-MTH-MWR-PTH-1KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Keriting Mawar Putih 1kg', 32500, 'pcs', 80),
('KRP-MTH-KRT-MINI-500G', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Keriting Mentah Ukuran Mini 500g', 15500, 'pcs', 100),
('KRP-MTH-KRT-MINI-1KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Keriting Mentah Ukuran Mini 1kg', 28000, 'pcs', 80),
('KRP-MTH-BWG-KCG-1KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Mentah Rasa Bawang Bentuk Kancing 1kg', 31000, 'pcs', 100),
('KRP-MTH-BWG-KCG-500G', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Bawang Bentuk Kancing 500g', 17500, 'pcs', 100),
('KRP-MTH-BWG-KCG-5KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Bawang Bentuk Kancing 1 Ball 5kg', 129500, 'pcs', 50),
('KRP-MTH-JGK-BLT-500G', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Jengkol Bulat Renyah 500g', 15500, 'pcs', 100),
('KRP-MTH-JGK-BLT-1KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Jengkol Bulat 1kg', 31000, 'pcs', 100),
('KRP-MTH-JGK-BLT-5KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Jengkol Bulat 1 Ball 5kg', 127000, 'pcs', 30),
('KRP-MTH-JGK-SSR-500G', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Jengkol Sisir 500g', 17500, 'pcs', 100),
('KRP-MTH-JGK-SSR-1KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Jengkol Sisir Renyah 1kg', 33500, 'pcs', 80),
('KRP-MTH-JGK-SSR-5KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Jengkol Sisir 1 Ball 5kg', 132000, 'pcs', 30),
('KRP-MTH-SRI-UDG-5KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Mentah Sari Udang Orange Muda 1 Ball 5kg', 99500, 'pcs', 50),
('KRP-MTH-SRI-UDG-500G', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Sari Udang Orange Tua Repack 500g', 14000, 'pcs', 100),
('KRP-MTH-SRI-UDG-1KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Sari Udang Orange Tua Repack 1kg', 25500, 'pcs', 80),
('KRP-MTH-SRI-UDG-TUA-5KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Mentah Sari Udang Warna Orange Tua 1 Ball 5kg', 108500, 'pcs', 40),
('KRP-MTH-SRI-UDG-AMP-500G', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Sari Udang Ampera 89 Putih 500g', 15000, 'pcs', 100),
('KRP-MTH-SRI-UDG-AMP-1KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Sari Udang Ampera 89 Putih 1kg', 30000, 'pcs', 100),
('KRP-MTH-SRI-UDG-AMP-5KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Sari Udang Ampera 89 Warna Putih 1 Ball 5kg', 125000, 'pcs', 40),
('KRP-MTH-IKN-AMP-500G', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk / Kemplang Ikan Ampera 89 500g', 25000, 'pcs', 80),
('KRP-MTH-IKN-AMP-5KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Mentah Ikan Ampera 89 Ukuran Mini 1 Ball 5kg', 140000, 'pcs', 50),
('KRP-MTH-IKN-TGR-500G', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Mentah Bangka Super Mini Ikan Tenggiri 500g', 57500, 'pcs', 100),
('KRP-MTH-IKN-TGR-1KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Mentah Bangka Super Ukuran Mini Ikan Tenggiri 1kg', 90000, 'pcs', 60),
('KRP-MTH-IKN-TGR-YOYO', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Mentah Bangka Ikan Tenggiri Yoyo 500g', 45000, 'pcs', 60),
('KRP-MTH-IKN-TGR-SNJ-230G', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Keriting Ikan Tenggiri Sanjaya 230g', 47500, 'pcs', 100),
('KRP-MTH-IKN-TGR-SNJ-100G', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Keriting Ikan Tenggiri Sanjaya 100g', 22000, 'pcs', 100),
('KRP-MTH-IKN-TGR-BELINYU', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Ikan Tenggiri Cap YN Belinyu Bangka', 25000, 'pcs', 60),
('KRP-MTH-BWG-PLS-5KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Mentah Bawang Polos 1 Ball 5kg', 108500, 'pcs', 50),
('KRP-MTH-BWG-PLS-3KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Bawang Mentah Polos 1 Ball 3kg', 70000, 'pcs', 40),
('KRP-MTH-BWG-PLS-1KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Bawang Mentah Polos 1kg', 25500, 'pcs', 80),
('KRP-MTH-BWG-PLS-200G', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Bawang Polos 200g', 14500, 'pcs', 100),
('KRP-MTH-BWG-BBR-5KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Mentah Bawang Bibir 1 Ball 5kg', 108500, 'pcs', 50),
('KRP-MTH-BWG-BBR-3KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Bawang Bibir Mentah 3kg', 70000, 'pcs', 50),
('KRP-MTH-BWG-BBR-1KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Bawang Bibir Mentah 1 Ball Berat 5kg / Curah 1kg', 107500, 'pcs', 50),
('KRP-MTH-BWG-BBR-500G', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Bawang Bibir Mentah 500g', 14500, 'pcs', 100),
('KRP-MTH-TMP-250G', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Tempe Mentah 250g', 8500, 'pcs', 100),
('KRP-MTH-MIE-MDG-500G', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Mie Kuning Mentah Ukuran Sedang 500g', 21000, 'pcs', 100),
('KRP-MTH-MIE-MDG-1KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Mie Kuning Mentah Ukuran Sedang 1kg', 35000, 'pcs', 100),
('KRP-MTH-MIE-MINI-500G', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Mie Kuning Mentah Ukuran Mini 500g', 16500, 'pcs', 100),
('KRP-MTH-MIE-MINI-1KG', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Mie Kuning Ukuran Mini Mentah 1kg', 30500, 'pcs', 80),
('KRP-MTH-WRN-KPNG-500G', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Warna Warni Bentuk Kepang / Rantai 500g', 17000, 'pcs', 80),
('KMP-MTH-IKN-BGK-500G', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kemplang Mentah Ikan Bangka 500g', 62000, 'pcs', 60),
('KRP-MTH-TRSJ-500G', (SELECT id FROM cat WHERE slug = 'kerupuk-mentah-bangka'), 'Kerupuk Mentah Tersanjung 500g', 14000, 'pcs', 80),

-- ==================== [BUMBU & OLEH-OLEH BANGKA] ====================
('KCP-ASN-ROSE-300ML', (SELECT id FROM cat WHERE slug = 'bumbu-khas-bangka'), 'Kecap Asin Bangka Cap Rose / Mawar Botol Kecil 300ml', 21000, 'botol', 60),
('KCP-ASN-ROSE-600ML', (SELECT id FROM cat WHERE slug = 'bumbu-khas-bangka'), 'Kecap Asin Bangka Cap Rose Botol Kecil 600ml', 21000, 'botol', 60),
('KCP-ASN-SS-BESAR', (SELECT id FROM cat WHERE slug = 'bumbu-khas-bangka'), 'Kecap Asin Bangka Cap SS Botol Besar', 30500, 'botol', 60),
('KCP-ASN-SS-KECIL', (SELECT id FROM cat WHERE slug = 'bumbu-khas-bangka'), 'Kecap Asin Bangka Cap SS Botol Kecil', 20000, 'botol', 60),
('KCP-ASN-SIONG-620ML', (SELECT id FROM cat WHERE slug = 'bumbu-khas-bangka'), 'Kecap Asin Bangka Cap Siong / Gajah Botol Besar 620ml', 32500, 'botol', 60),
('KCP-ASN-KTB-300ML', (SELECT id FROM cat WHERE slug = 'bumbu-khas-bangka'), 'Kecap Asin Bangka Cap Kuda Terbang Botol Kecil 300ml', 19000, 'botol', 60),
('BMB-TAUCO-BGK-250G', (SELECT id FROM cat WHERE slug = 'bumbu-khas-bangka'), 'Tauco Asli Dari Bangka Kuning Berat 250g', 16000, 'pcs', 40),
('BMB-TRSI-AB-100G', (SELECT id FROM cat WHERE slug = 'bumbu-khas-bangka'), 'Terasi AB No. 1 Pulau Bangka 100g', 15500, 'pcs', 100),
('BMB-TRSI-AB-500G', (SELECT id FROM cat WHERE slug = 'bumbu-khas-bangka'), 'Terasi AB No. 1 Pulau Bangka 500g', 65000, 'pcs', 50),
('BMB-TRSI-BBK-TOBOALI', (SELECT id FROM cat WHERE slug = 'bumbu-khas-bangka'), 'Terasi Bubuk Toboali KM2 100g', 35000, 'pcs', 60),
('BMB-TRSI-UDG-ASLI', (SELECT id FROM cat WHERE slug = 'bumbu-khas-bangka'), 'Terasi Udang Asli Bangka / Terasi Udang Toboali', 31500, 'pcs', 60),
('BMB-TRSI-UDG-KCL', (SELECT id FROM cat WHERE slug = 'bumbu-khas-bangka'), 'Terasi Udang Asli Bangka / Terasi Udang', 17000, 'pcs', 60),
('BMB-TRSI-PGG-PRG', (SELECT id FROM cat WHERE slug = 'bumbu-khas-bangka'), 'Terasi Panggang Piring Khas Bangka Cap Juwita', 36000, 'pcs', 50),
('BMB-RSP-AM3-TERI', (SELECT id FROM cat WHERE slug = 'bumbu-khas-bangka'), 'Rusip AM3 Khas Bangka / Rusip Teri', 26500, 'botol', 40),
('BMB-CALO-UDG-REBON', (SELECT id FROM cat WHERE slug = 'bumbu-khas-bangka'), 'Kecalo Udang Rebon Cap AM3 Asli Bangka', 25000, 'botol', 40),
('BMB-GLA-ARN-BGK-1T', (SELECT id FROM cat WHERE slug = 'bumbu-khas-bangka'), 'Gula Aren / Gula Kabung Bangka 1 Turus Isi 5 Butir', 57000, 'pcs', 30),
('BMB-MDU-BGK-1KG', (SELECT id FROM cat WHERE slug = 'bumbu-khas-bangka'), 'Madu Asli Bangka Madu Manis / Madu Pahit 1kg', 150000, 'botol', 30),

-- ==================== [NON-MAKANAN] ====================
('NFD-SKT-IJK-HTM', (SELECT id FROM cat WHERE slug = 'non-makanan'), 'Sikat Hitam Khas Bangka Dari Ijuk Pilihan', 10000, 'pcs', 30),
('NFD-SKT-CKL-BGK', (SELECT id FROM cat WHERE slug = 'non-makanan'), 'Sikat Coklat Khas Bangka', 10000, 'pcs', 30)

ON CONFLICT (sku) DO UPDATE 
SET price = EXCLUDED.price,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    stock = EXCLUDED.stock,
    updated_at = TIMEZONE('utc'::text, NOW());
