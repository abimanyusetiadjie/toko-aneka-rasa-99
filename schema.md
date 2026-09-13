# Skema Database PostgreSQL (Supabase)

Dokumen ini merepresentasikan struktur tabel, relasi, dan indeks pada database PostgreSQL yang digunakan oleh Smart Minimarket System.

---

## 1. Diagram Relasi Entitas (ERD - Plain Text Representation)

```text
[roles] 1 --- N [users] 1 --- N [transactions]
                                      | 1
                                      |
                                      +--- N [transaction_details] M --- 1 [products]
                                                                              | 1
                                                                              +--- N [product_units]
                                                                              | 1
                                                                              +--- N [categories]
[members] 1 ----------------------- N [transactions]