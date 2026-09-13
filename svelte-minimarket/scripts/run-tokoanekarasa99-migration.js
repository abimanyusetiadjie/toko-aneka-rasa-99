import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_URL = "postgresql://postgres.zdqrraxsefjvopucyysm:minimarket123*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

async function runMigration() {
    console.log("🔌 Menghubungkan ke Database Supabase Cloud...");
    const client = new Client({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("✅ Berhasil terhubung ke Supabase PostgreSQL!");

        const sqlFilePath = path.join(__dirname, 'tokoanekarasa99.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        console.log("🚀 Menjalankan migrasi database Toko Aneka Rasa 99...");
        await client.query(sql);
        console.log("✅ Eksekusi skema & data produk berhasil!");

        // Verifikasi hasil
        const catRes = await client.query("SELECT COUNT(*) FROM categories");
        const prodRes = await client.query("SELECT COUNT(*) FROM products");

        console.log(`\n📊 Hasil Verifikasi di Supabase:`);
        console.log(`- Total Kategori: ${catRes.rows[0].count} kategori`);
        console.log(`- Total Produk  : ${prodRes.rows[0].count} produk`);

        const sample = await client.query("SELECT sku, name, price, stock FROM products LIMIT 5");
        console.log("\nContoh 5 produk di Supabase:");
        console.table(sample.rows);

    } catch (err) {
        console.error("❌ Gagal migrasi ke Supabase:", err.message);
    } finally {
        await client.end();
        console.log("\n🔒 Koneksi database ditutup.");
    }
}

runMigration();
