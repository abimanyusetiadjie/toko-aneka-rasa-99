import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

async function updateUsers() {
    const pool = new Pool({
        connectionString: 'postgresql://postgres.zdqrraxsefjvopucyysm:minimarket123*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
        ssl: { rejectUnauthorized: false }
    });
    const client = await pool.connect();

    try {
        console.log('1. Menambahkan kolom store_id dan is_active ke users...');
        await client.query(`
            ALTER TABLE public.users 
                ADD COLUMN IF NOT EXISTS store_id UUID DEFAULT '11111111-1111-1111-1111-111111111111',
                ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
        `);

        const hash = await bcrypt.hash('minimarket123*', 10);

        console.log('2. Memastikan user memiliki UUID valid dan password hash...');
        await client.query(`
            INSERT INTO public.users (id, username, password_hash, role_id, full_name, store_id, is_active)
            VALUES 
                ('932ba9fe-2627-463b-898a-62a4c2b5ae41', 'kasir_siti', $1, 3, 'Siti Aminah (Kasir)', '11111111-1111-1111-1111-111111111111', TRUE),
                ('e91ed3f2-284f-4db8-a0a3-f0da106d0a33', 'manager_budi', $1, 2, 'Budi Santoso (Manajer)', '11111111-1111-1111-1111-111111111111', TRUE),
                ('11111111-2222-3333-4444-555555555555', 'owner_hendra', $1, 1, 'Hendra Wijaya (Owner)', '11111111-1111-1111-1111-111111111111', TRUE)
            ON CONFLICT (id) DO UPDATE SET 
                username = EXCLUDED.username,
                password_hash = EXCLUDED.password_hash,
                store_id = EXCLUDED.store_id,
                is_active = EXCLUDED.is_active;
        `, [hash]);

        await client.query(`
            UPDATE public.users 
            SET store_id = '11111111-1111-1111-1111-111111111111', is_active = TRUE
            WHERE store_id IS NULL;
        `);

        console.log('3. Data users di Supabase:');
        const res = await client.query('SELECT id, username, role_id, store_id, is_active FROM public.users');
        console.table(res.rows);

    } finally {
        client.release();
        await pool.end();
    }
}

updateUsers().catch(err => {
    console.error('Update users failed:', err);
    process.exit(1);
});
