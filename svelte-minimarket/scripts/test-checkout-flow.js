import pg from 'pg';
import crypto from 'crypto';

const { Pool } = pg;

async function testTransaction() {
    const pool = new Pool({
        connectionString: 'postgresql://postgres.zdqrraxsefjvopucyysm:minimarket123*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
        ssl: { rejectUnauthorized: false }
    });
    const client = await pool.connect();

    try {
        console.log('🧪 Memulai simulasi transaksi dengan user ID warisan: "u-budi"...');

        // Simulasi resolusi user
        let userId = 'u-budi';
        let storeId = '11111111-1111-1111-1111-111111111111';
        const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        if (!UUID_PATTERN.test(userId)) {
            const uRes = await client.query('SELECT id, store_id FROM users WHERE username = $1 LIMIT 1', ['manager_budi']);
            if (uRes.rows.length > 0) {
                userId = uRes.rows[0].id;
                storeId = uRes.rows[0].store_id || storeId;
            } else {
                userId = '932ba9fe-2627-463b-898a-62a4c2b5ae41';
            }
        }
        console.log('✅ Berhasil dikonversi ke UUID resmi:', userId);

        await client.query('BEGIN');

        const txId = crypto.randomUUID();
        const rcpt = `RCPT-TEST-${Date.now()}`;
        const idem = `idem-test-${Date.now()}`;

        // Cari shift
        const shiftRes = await client.query(
            `SELECT id FROM cashier_shifts WHERE user_id = $1 AND status = 'OPEN' LIMIT 1`,
            [userId]
        );
        const shiftId = shiftRes.rows[0]?.id || null;

        // Ambil salah satu produk Bangka
        const unitRes = await client.query('SELECT id, product_id, price FROM product_units LIMIT 1');
        const unit = unitRes.rows[0];

        // 1. Insert header
        await client.query(`
            INSERT INTO transactions (
                id, store_id, shift_id, user_id, receipt_number, idempotency_key, 
                subtotal_amount, discount_amount, total_amount, points_earned, points_redeemed, status, payment_method, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'COMPLETED', $12, NOW())
        `, [txId, storeId, shiftId, userId, rcpt, idem, unit.price, 0, unit.price, 0, 0, 'CASH']);

        // 2. Insert detail
        await client.query(`
            INSERT INTO transaction_details (
                id, transaction_id, product_id, unit_id, qty, conversion_factor, base_qty, price_per_unit, cost_price_snapshot, subtotal
            ) VALUES ($1, $2, $3, $4, $5, 1, 1, $6, 0, $6)
        `, [crypto.randomUUID(), txId, unit.product_id, unit.id, 1, unit.price]);

        // 3. Insert payment
        await client.query(`
            INSERT INTO transaction_payments (
                id, transaction_id, payment_method, amount, change_given
            ) VALUES ($1, $2, 'CASH', $3, 0)
        `, [crypto.randomUUID(), txId, unit.price]);

        // Rollback agar tidak mengotori data asli transaksi
        await client.query('ROLLBACK');
        console.log('🎉 Transaksi lolos 100% tanpa ada error tipe UUID!');

    } finally {
        client.release();
        await pool.end();
    }
}

testTransaction().catch(err => {
    console.error('❌ Gagal:', err);
    process.exit(1);
});
