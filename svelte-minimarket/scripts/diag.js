import pg from 'pg';
const { Client } = pg;

const hosts = [
    { host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 6543, user: 'postgres.zdqrraxsefjvopucyysm' },
    { host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 5432, user: 'postgres.zdqrraxsefjvopucyysm' },
    { host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 6543, user: 'postgres' },
    { host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 5432, user: 'postgres' },
    { host: 'db.zdqrraxsefjvopucyysm.supabase.co', port: 5432, user: 'postgres' },
    { host: 'db.zdqrraxsefjvopucyysm.supabase.co', port: 6543, user: 'postgres' }
];

for (const h of hosts) {
    const client = new Client({
        host: h.host,
        port: h.port,
        user: h.user,
        password: 'minimarket123*',
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });
    try {
        console.log(`Connecting to ${h.host}:${h.port} as ${h.user}...`);
        await client.connect();
        console.log(`>>> SUCCESS on ${h.host}:${h.port} as ${h.user}!`);
        await client.end();
        break;
    } catch (e) {
        console.log(`Failed: ${e.message}`);
    }
}
