---

# `design.md`

```markdown
# Desain Sistem & Antarmuka Smart POS

Dokumen ini mendefinisikan desain teknis antarmuka (UI/UX), alur kerja pengguna (workflows), dan spesifikasi API endpoint untuk sistem kasir dan analitik toko.

---

## 1. Layout & UX Terminal Kasir (POS UI Wireframe)

Antarmuka kasir dirancang dengan tata letak tinggi kontras dan ramah *keyboard shortcut* untuk mempercepat *checkout*.

```text
+---------------------------------------------------------------------------------+
| [STORE LOGO]  Kasir: Budi  |  Shift: Pagi  | Member: [ 08123456789 - Andi ]     |
+--------------------------------------------------+------------------------------+
| CARI / SCAN BARCODE (F2)                         | RINGKASAN PEMBAYARAN         |
| [ ||||||||||||||||||||||||||||||| ] [ + TAMBAH ] |                              |
+--------------------------------------------------+ Subtotal : Rp   145.000      |
| ITEM TERPINDAI                                   | Diskon   : Rp    10.000      |
+------------------+-------+--------+--------------+ Total    : Rp   135.000      |
| Nama Produk      | Qty   | Satuan | Subtotal     |                              |
+------------------+-------+--------+--------------+ [ F8 - TUNAI               ] |
| Indomie Goreng   | 1     | Dus    | Rp  110.000  | [ F9 - DEBIT / EDC         ] |
| Susu UHT 1L      | 2     | Pcs    | Rp   35.000  | [ F10 - QRIS               ] |
|                  |       |        |              |                              |
|                  |       |        |              | [ F12 - CETAK STRUK & BAYAR] |
+------------------+-------+--------+--------------+------------------------------+
| NOTIFIKASI BUNDLING:                                                            |
| "Pelanggan membeli Indomie Dus! Rekomendasikan Kecap Manis Pouch (Hemat 10%)"  |
+---------------------------------------------------------------------------------+