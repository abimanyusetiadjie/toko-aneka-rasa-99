# Arsitektur Sistem Smart Minimarket & Point of Sale System

Dokumen ini menjelaskan arsitektur teknis, komponen, aliran data, dan integrasi antar-sistem untuk Smart Minimarket & Point of Sale System. Sistem ini mengadopsi pendekatan *Decoupled System Architecture* untuk memisahkan beban kerja transaksi *real-time* kasir, pemrosesan analitik bisnis, dan eksekusi komputasi algoritma Machine Learning.

---

## 1. Stack Teknologi (Tech Stack)

| Lapis / Komponen | Teknologi | Alasan Pemilihan |
| :--- | :--- | :--- |
| **Core Application (Backend/CMS)** | PHP 8.3+ & CodeIgniter 4 | Performa eksekusi query yang cepat, arsitektur MVC efisien untuk manajemen stok, supplier, dan transaksi. |
| **Front-End Kasir (POS UI)** | Alpine.js, HTML5/CSS3, TailwindCSS | Ringan dan responsif, memungkinkan interaksi Single Page Application (SPA) tanpa *page refresh* saat memindai barcode. |
| **Database Utama** | Supabase (PostgreSQL) | Memiliki fitur *Row Level Security* (RLS), *trigger* otomatis, skalabilitas cloud, dan koneksi langsung ke tools BI. |
| **Machine Learning Engine** | Python 3.11+, FastAPI, Pandas, Mlxtend | Ekosistem data science terlengkap untuk mengeksekusi algoritma Apriori / FP-Growth via REST API endpoint. |
| **Business Intelligence (BI)** | Apache Superset / Google Looker Studio | Visualisasi data interaktif terhubung langsung ke read-replica PostgreSQL tanpa mengganggu performa server transaksi. |
| **Caching & Message Queue** | Redis | Digunakan untuk caching harga produk, sesi kasir, dan antrean data transaksi saat lalu lintas kasir sangat tinggi. |

---

## 2. Diagram Arsitektur Sistem

```text
+-----------------------------------------------------------------------------------+
|                              LAPISAN PENGGUNA (CLIENT)                            |
|                                                                                   |
|  +---------------------------+                 +-------------------------------+  |
|  |    Kasir / POS Terminal   |                 |      Manajer / Owner CMS      |  |
|  |   (CI4 + Alpine.js + PWA) |                 |    (CI4 Admin + ApexCharts)   |  |
|  +-------------+-------------+                 +---------------+---------------+  |
+----------------│-----------------------------------------------│-------------------+
                 │                                               │
                 │ (REST API / HTTPS)                            │ (Query SQL / ORM)
                 ▼                                               ▼
+-----------------------------------------------------------------------------------+
|                            LAPISAN APLIKASI & LOGIKA                              |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                          CodeIgniter 4 Core Engine                          |  |
|  |     (Autentikasi, Logika Stok, Konversi Satuan, Supplier, Keuangan)         |  |
|  +-------------------------------------+---------------------------------------+  |
+----------------------------------------│------------------------------------------+
                                         │
                                         ▼ (Koneksi Database / Port 6543)
+-----------------------------------------------------------------------------------+
|                             LAPISAN DATA (CLOUD STORAGE)                          |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                                  SUPABASE                                   |  |
|  |  - PostgreSQL (Penyimpanan Data Transaksi, Produk, User, & Hasil ML)       |  |
|  |  - Row Level Security (Isolasi data finansial sensitif)                     |  |
|  +--------------------+------------------------------------+-------------------+  |
+-----------------------│------------------------------------│----------------------+
                        │                                    │
                        ▼ (Akses Data Historis via SQL)       ▼ (Koneksi Postgres Langsung)
+-----------------------------------------------+    +------------------------------+
|             LAPISAN KECERDASAN (ML)           |    |     LAPISAN ANALISIS (BI)    |
|                                               |    |                              |
|  +-----------------------------------------+  |    |  +------------------------+  |
|  |            Python ML Engine             |  |    |  |    Apache Superset     |  |
|  | - Market Basket Analysis (FP-Growth)    |  |    |  |          ATAU          |  |
|  | - Rekomendasi Bundling & Shelf Placement|  |    |  |  Google Looker Studio  |  |
|  +--------------------+--------------------+  |    |  +-----------+------------+  |
|                       │                       |    |              │               |
|                       ▼ (Tulis Hasil Prediksi)|    |              ▼               |
|            [Tabel: ml_association_rules]      |    |     [Dasbor Eksekutif HP]    |
+-----------------------------------------------+    +------------------------------+