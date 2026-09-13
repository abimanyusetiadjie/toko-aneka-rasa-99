# 🏪 Toko Aneka Rasa 99 — Modern Omnichannel POS & Executive BI Dashboard

Sistem Point-of-Sale (POS) kasir modern, manajemen inventori ritel, dan analitik bisnis eksekutif (*Business Intelligence*) yang dirancang khusus untuk **Toko Aneka Rasa 99 Pangkalpinang** (Pusat Oleh-Oleh Khas Bangka & Minimarket Modern) dengan integrasi penjualan kasir toko fisik dan marketplace online Shopee secara real-time.

---

## 🌟 Fitur Utama Sistem

### 1. 📊 Executive BI Dashboard (Khusus Role Owner)
* **Kinerja Finansial Riil**: Memantau Total Omset Kotor (*Gross Sales*), Modal Pokok Barang HPP (*COGS*), Laba Bersih Kotor (*Gross Profit* & Margin GPM %), serta Rata-rata Nilai Keranjang (*Average Basket Size*).
* **Komparasi Saluran Omnichannel**: Perbandingan omset dan jumlah transaksi antara Kasir Toko Fisik (POS Offline) vs Penjualan Marketplace Shopee Online.
* **2 Visualisasi Interaktif Modern (ApexCharts)**:
  * **Trend Penjualan Harian**: *Smooth spline area chart* untuk memantau fluktuasi omset dan lonjakan wisatawan akhir pekan (*weekend seasonality*).
  * **Komposisi Metode Pembayaran**: *Modern donut chart* (68% cutout) memetakan 100% perputaran kas: Uang Tunai di laci kasir (*Cash*), penerimaan digital (*QRIS Dinamis*), dan saldo *Shopee/Online*.
* **Analisis Pareto 80/20**:
  * **Top 5 Best Seller**: 5 produk terlaris penyumbang perputaran omset tertinggi.
  * **Peringatan Slow Moving (Dead Stock)**: 5 produk yang stoknya tertahan di gudang untuk evaluasi promo bundling.
* **Live Ledger & Ekspor Laporan Resmi**:
  * **Unduh Excel (.xls)**: Format rapi siap pakai tanpa perlu edit.
  * **Ekspor PDF Resmi**: Format cetak standar A4 dengan Kop Resmi Toko, tabel rincian transaksi, dan lembar pengesahan tanda tangan Owner.

### 2. 🛒 Terminal Kasir POS (Point of Sale)
* **Pembacaan Barcode Super Cepat (< 45ms)**: Driver USB HID wedge yang mendeteksi pancaran laser scanner fisik dan membedakannya dari ketikan manual.
* **Scanner Kamera HP Universal (html5-qrcode)**: Memungkinkan smartphone atau tablet kasir digunakan langsung sebagai scanner barcode kemasan makanan/snack melalui kamera.
* **Fitur Simulasi Katalog Cepat**: Pemilihan barang 1-klik untuk presentasi tanpa barcode fisik.
* **Pembayaran Fleksibel**: Tunai (Cash) dengan kalkulator kembalian otomatis, QRIS Dinamis, Kartu Debit, dan Split Payment.
* **Cetak Struk Kasir Termal 58mm**: Format struk kasir rapi siap cetak via printer thermal Bluetooth/USB.

### 3. 📦 Manajemen Inventori & Gudang
* Katalog produk oleh-oleh khas Bangka (Getas, Kemplang, Terasi, Kerupuk, Madu).
* Pencatatan riwayat mutasi stok masuk, keluar, dan stock opname.
* **Generator Label Barcode Otomatis**: Siap cetak untuk ditempel pada kemasan produk baru.

### 4. 🛍️ Integrasi Omnichannel Shopee
* Sinkronisasi pesanan Shopee secara otomatis.
* Pemotongan stok inventori toko otomatis saat order Shopee masuk.
* Status pesanan siap kirim (*Ready to Ship*) dan nomor resi kurir.

### 5. 🔐 Sistem Hak Akses (2 Role RBAC)
* **Role 1: Owner (Pemilik Toko)**: Akses penuh 100% ke seluruh sistem termasuk analitik keuangan, BI Dashboard, dan ekspor laporan.
* **Role 2: Kasir (Operasional)**: Akses terminal kasir POS, katalog stok, operasional harian, dan **diblokir total dari BI Dashboard**.

---

## 🛠️ Tech Stack & Arsitektur

* **Frontend Framework**: [Svelte 5](https://svelte.dev/) (Runes reactivity) & [SvelteKit 2](https://kit.svelte.dev/) (Fullstack SSR/CSR).
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Lucide Svelte](https://lucide.dev/).
* **Database & Cloud**: [PostgreSQL Supabase Cloud](https://supabase.com/) dengan Connection Pooler & In-Memory Zero-Latency Circuit Breaker.
* **Data Visualization**: [ApexCharts](https://apexcharts.com/).
* **Barcode Engine**: [html5-qrcode](https://github.com/mebjas/html5-qrcode) & Native USB HID listener.
* **Authentication**: JWT Cookie Session (jose & cryptjs).

---

## 🚀 Panduan Menjalankan di Lokal (Local Development)

1. **Masuk ke folder aplikasi**:
   \\\ash
   cd svelte-minimarket
   \\\

2. **Pasang Dependensi**:
   \\\ash
   npm install
   \\\

3. **Jalankan Server Development**:
   \\\ash
   npm run dev -- --host 0.0.0.0 --port 3000
   \\\

4. **Buka di Browser**:
   * Akses lokal: \http://localhost:3000\
   * Akses dari HP (jaringan Wi-Fi yang sama): \http://<IP-KOMPUTER>:3000\

### Akun Login Demo:
* **Owner (Akses Penuh + BI Dashboard)**:
  * Username: \owner_hendra\
  * Password: \password123\
* **Kasir (Akses POS & Stok)**:
  * Username: \kasir_siti\
  * Password: \password123\

---

## ☁️ Panduan Hosting di Cloudflare Pages (HTTPS)

1. Masuk ke [Cloudflare Dashboard](https://dash.cloudflare.com/) $\rightarrow$ **Workers & Pages** $\rightarrow$ **Create application** $\rightarrow$ **Pages** $\rightarrow$ **Connect to Git**.
2. Pilih repository: **\bimanyusetiadjie/toko-aneka-rasa-99\**.
3. Atur konfigurasi build:
   * **Framework preset**: \SvelteKit\
   * **Root directory**: \svelte-minimarket\
   * **Build command**: \
pm run build\
   * **Build output directory**: \.svelte-kit/cloudflare\
4. Masukkan **Environment Variables**:
   * \DATABASE_URL\ = \postgresql://postgres.zdqrraxsefjvopucyysm:minimarket123*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres\
   * \JWT_SECRET\ = \super_secret_minimarket_key_2026_xyz\
5. Klik **Save and Deploy**. Selesai! Aplikasi akan aktif pada domain resmi berprotokol HTTPS, sehingga fitur kamera scanner HP langsung aktif 100%.
