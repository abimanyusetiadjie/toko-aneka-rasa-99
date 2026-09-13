import pg from 'pg';
const { Client } = pg;

const DB_URL = "postgresql://postgres.zdqrraxsefjvopucyysm:minimarket123*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

async function test() {
    const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
    await client.connect();
    
    console.log("🔍 Mengetes Query Produk di Supabase Cloud...");
    const res = await client.query(`
        SELECT pu.id, pu.barcode, p.name, p.price, p.stock, c.name as category_name 
        FROM product_units pu 
        JOIN products p ON pu.product_id = p.id 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE pu.barcode = $1
    `, ['GTS-BLT-OBOR-MERAH']);

    console.log("Hasil Query:");
    console.table(res.rows);

    const totalProd = await client.query('SELECT count(*) FROM products');
    const totalCat = await client.query('SELECT count(*) FROM categories');
    const totalUnits = await client.query('SELECT count(*) FROM product_units');

    console.log(`\nStatistik Supabase Cloud:`);
    console.log(`- Kategori     : ${totalCat.rows[0].count}`);
    console.log(`- Produk       : ${totalProd.rows[0].count}`);
    console.log(`- Product Units: ${totalUnits.rows[0].count}`);

    await client.end();
}

test();
