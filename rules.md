# Aturan Bisnis & Operasional Sistem (Business Rules)

Dokumen ini berisi sekumpulan aturan mendasar yang mengontrol logika operasional, perhitungan finansial, dan batasan keamanan pada sistem.

---

## 1. Aturan Manajemen Stok & Konversi Satuan

* **Satuan Dasar (Base Unit)**: Setiap produk wajib memiliki 1 satuan dasar terkecil (misalnya: `Pcs`, `Botol`, `Sachet`). Seluruh perhitungan stok di database disimpan dalam satuan dasar ini.
* **Faktor Konversi**:
  * $1 \text{ Pak} = N \text{ Pcs}$
  * $1 \text{ Dus} = M \text{ Pak} = (M \times N) \text{ Pcs}$
* **Validasi Stok Minimum**: Sistem tidak mengizinkan transaksi kasir diproses jika jumlah stok dalam satuan dasar kurang dari jumlah yang dibeli, kecuali fitur *Negative Stock Allowed* diaktifkan oleh Admin.
* **HPP Terkonversi**: HPP per satuan besar dihitung secara proporsional dari satuan dasar:
  $$\text{HPP Satuan Besar} = \text{HPP Satuan Dasar} \times \text{Faktor Konversi}$$

---

## 2. Aturan Transaksi Kasir & Pembayaran

* **Pembayaran Tunai**: Jumlah uang yang dibayarkan pelanggan wajib lebih besar atau sama dengan total belanjaan ($\text{Uang Dibayar} \ge \text{Total Belanja}$).
* **Pembayaran Non-Tunai (QRIS / Debit)**: Nomor referensi atau ID transaksi pembayaran non-tunai wajib dicatat sebelum transaksi diselesaikan.
* **Rollback Transaksi**: Jika transaksi kasir dibatalkan sebelum cetak struk, seluruh alokasi stok yang sempat tertahan harus dikembalikan secara otomatis dalam kurun waktu $1\text{ detik}$.

---

## 3. Aturan Algoritma Machine Learning (Market Basket Analysis)

Pengeksekusian algoritma FP-Growth / Apriori wajib memenuhi batasan ambang batas (*threshold*) berikut agar aturan asosiasi yang dihasilkan valid:

1. **Minimum Support ($S$)**: Persentase minimum kemunculan kombinasi produk dalam total seluruh transaksi.
   $$\text{Support}(A \rightarrow B) = \frac{\text{Jumlah Transaksi Mengandung } A \text{ dan } B}{\text{Total Transaksi}} \ge 0.02 \quad (2\%)$$

2. **Minimum Confidence ($C$)**: Peluang pelanggan membeli produk $B$ jika mereka sudah membeli produk $A$.
   $$\text{Confidence}(A \rightarrow B) = \frac{\text{Jumlah Transaksi Mengandung } A \text{ dan } B}{\text{Jumlah Transaksi Mengandung } A} \ge 0.30 \quad (30\%)$$

3. **Minimum Lift Ratio ($L$)**: Mengukur kekuatan aturan asosiasi dibandingkan dengan kebetulan acak. Aturan asosiasi hanya dianggap valid jika:
   $$\text{Lift}(A \rightarrow B) = \frac{\text{Confidence}(A \rightarrow B)}{\text{Support}(B)} > 1.25$$

---

## 4. Aturan Keuangan & Indikator BI

* **Gross Profit Margin (GPM)**: Calculated per product category:
  $$\text{GPM} = \frac{\text{Total Pendapatan} - \text{Total HPP}}{\text{Total Pendapatan}} \times 100\%$$
* **Average Basket Size**:
  $$\text{Average Basket Size} = \frac{\text{Total Penjualan Nominal}}{\text{Total Jumlah Struk Transaksi}}$$

---

## 5. Hak Akses Sistem (Role-Based Access Control / RBAC)

| Role | Akses Transaksi POS | Kelola Stok & Satuan | Akses Dasbor BI | Jalankan Engine ML |
| :--- | :---: | :---: | :---: | :---: |
| **Kasir** | YA | TIDAK | TIDAK | TIDAK |
| **Manajer Toko** | YA | YA | YA | YA |
| **Pemilik (Owner)** | TIDAK | TIDAK | YA (Full Access) | YA |