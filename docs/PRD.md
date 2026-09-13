# Product Requirement Document (PRD)

## 1. Ringkasan Produk
Smart Minimarket & Point of Sale System adalah solusi manajemen toko terintegrasi yang menggabungkan kecepatan transaksi kasir depan (*checkout*), otomatisasi pengelolaan stok multi-satuan, analisis performa bisnis melalui Business Intelligence (BI), serta rekomendasi berbasis Machine Learning untuk optimalisasi *layout* rak dan paket *bundling* produk.

---

## 2. Pengguna Target & Persona

* **Kasir (Front-line Staff)**: Membutuhkan antarmuka transaksi yang sangat cepat, bebas *lag*, mendukung *keyboard shortcut*, serta dapat menangani pemindaian barcode massal dan multi-metode pembayaran.
* **Manajer Toko**: Bertanggung jawab atas pengelolaan stok, pembuatan paket promo bundling, serta penataan tata letak rak barang berdasarkan pola belanja pelanggan.
* **Pemilik Toko (Business Owner)**: Membutuhkan laporan analitik finansial secara *real-time* via dasbor BI untuk memantau profitabilitas toko, tren penjualan, dan efisiensi jam kerja karyawan.

---

## 3. Persyaratan Fungsional (Functional Requirements)

### A. Fitur Kasir & Point of Sale (POS)
* **Pemindaian Barcode Massal**: Mendukung *barcode scanner* USB/Bluetooth untuk entri barang secara beruntun tanpa jeda.
* **Multi-Satuan Otomatis**: Mendukung konversi satuan secara langsung saat transaksi (contoh: membeli 1 Dus Indomie secara otomatis mengonversi dan memotong stok sebanyak 40 Pcs).
* **Multi-Metode Pembayaran**: Mengakomodasi pembayaran Tunai (beserta kalkulasi kembalian), Kartu Debit/Kredit, dan QRIS Dinamis/Statis.
* **Manajemen Member**: Integrasi data member melalui nomor telepon/ID member untuk pencatatan poin dan diskon khusus.

### B. Manajemen Stok & Produk
* **Sistem Konversi Satuan Bertingkat**: Pengisian master produk mendukung pemetaan hirarki unit (Dus → Pak → Pcs) beserta nilai pengali (*multiplier*).
* **Pencatatan HPP & Margin**: Pencatatan Harga Pokok Penjualan (HPP) berpatokan pada unit dasar untuk menghitung keuntungan kotor secara akurat.

### C. Dasbor Business Intelligence (BI)
* **Peak Hours & Busy Days Analysis**: Visualisasi grafik jam dan hari tersibuk untuk mengoptimalkan penjadwalan *shift* karyawan.
* **Gross Profit Margin (GPM) Analysis**: Perhitungan otomatis rasio margin keuntungan kotor per kategori produk secara *real-time*.
* **Customer Purchasing Power**: Menampilkan indikator Rata-Rata Nilai Belanja per Keranjang (*Average Basket Size*) dan tingkat retensi pembelian berulang dari member toko.

### D. Engine Machine Learning (Market Basket Analysis)
* **Pola Asosiasi Produk**: Menggunakan algoritma FP-Growth / Apriori untuk mengidentifikasi kombinasi produk yang sering dibeli bersamaan.
* **Rekomendasi Bundling & Shelf Placement**: Memberikan masukan otomatis pada CMS berupa:
  1. Paket Promo Bundling (misal: "Beli Kopi A + Biskuit B Hemat Rp 2.000").
  2. Rekomendasi Tata Letak Rak (misal: "Letakkan Roti Tawar di dekat Mentega").

---

## 4. Persyaratan Non-Fungsional (Non-Functional Requirements)

* **Kecepatan Respons (Latency)**: Proses pemindaian barcode hingga masuk ke daftar belanja kasir harus berdurasi **< 200 ms**.
* **Ketersediaan Sistem (Uptime)**: Sistem kasir harus memiliki ketersediaan minimum **99.9%**.
* **Keamanan Data**: Menggunakan HTTPS/TLS untuk komunikasi API serta penerapan *Row Level Security* (RLS) pada Supabase untuk melindungi data transaksi finansial.

---

## 5. Indikator Keberhasilan (KPIs)

* **Kecepatan Transaksi Kasir**: Menurunkan waktu tunggu antrean kasir sebesar **30%**.
* **Peningkatan Average Basket Size**: Meningkatkan rata-rata nilai transaksi keranjang sebesar **15%** melalui efektivitas paket promo bundling hasil ML.
* **Efisiensi Stok**: Menghilangkan selisih perhitungan stok akibat konversi manual hingga **0%**.