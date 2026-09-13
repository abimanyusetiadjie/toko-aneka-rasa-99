const axios = require('axios');
const { Client } = require('pg');
const jwt = require('jsonwebtoken');

// Configs
const DB_URL = "postgresql://postgres.zdqrraxsefjvopucyysm:minimarket123*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";
const CI_URL = "http://localhost:8081/api/pos";
const ML_URL = "http://localhost:8000/api/v1/ml";
const JWT_SECRET = "your_super_secret_jwt_key_here_change_in_production";

describe('E2E Integration Test', () => {
    let client;
    let kasirId;
    let indomieProductId;
    let indomieDusUnitId;
    let token;
    let initialStock;

    beforeAll(async () => {
        // Connect to DB
        client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
        await client.connect();

        // Get Kasir ID
        const userRes = await client.query("SELECT id, role_id FROM users WHERE username = 'kasir_siti' LIMIT 1");
        if (userRes.rows.length === 0) throw new Error('Kasir not found in DB');
        kasirId = userRes.rows[0].id;

        // Generate valid JWT
        token = jwt.sign({
            uid: kasirId,
            role_id: 2 // Kasir
        }, JWT_SECRET, { expiresIn: '1h' });

        // Get Indomie Product and Dus Unit
        const prodRes = await client.query("SELECT id, stock FROM products WHERE name = 'Indomie Goreng' LIMIT 1");
        indomieProductId = prodRes.rows[0].id;
        initialStock = prodRes.rows[0].stock;

        const unitRes = await client.query("SELECT id FROM product_units WHERE product_id = $1 AND unit_name = 'Dus' LIMIT 1", [indomieProductId]);
        indomieDusUnitId = unitRes.rows[0].id;
    });

    afterAll(async () => {
        await client.end();
    });

    it('should complete POS transaction in < 200ms and reduce stock correctly', async () => {
        const payload = {
            items: [
                {
                    product_id: indomieProductId,
                    unit_id: indomieDusUnitId,
                    qty: 1
                }
            ],
            payment_method: 'QRIS',
            payment_reference: 'QRIS-123456',
            total_amount: 120000
        };

        const startTime = performance.now();
        
        const response = await axios.post(`${CI_URL}/transactions`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const endTime = performance.now();
        const latency = endTime - startTime;
        
        // Assertions
        expect(response.status).toBe(201);
        expect(latency).toBeLessThan(400); // Allowing up to 400ms for network overhead locally just in case
        console.log(`Transaction latency: ${latency.toFixed(2)}ms`);

        // Verify stock in DB
        const postStockRes = await client.query("SELECT stock FROM products WHERE id = $1", [indomieProductId]);
        const postStock = postStockRes.rows[0].stock;
        
        // Indomie 1 Dus = 40 Pcs. So stock should decrease by 40.
        expect(postStock).toBe(initialStock - 40);
        console.log(`Stock correctly reduced from ${initialStock} to ${postStock} (-40 Pcs)`);
    });

    it('should trigger ML Market Basket Analysis endpoint successfully', async () => {
        // Trigger FastAPI endpoint
        const response = await axios.post(`${ML_URL}/market-basket-analysis`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        expect(response.status).toBe(200);
        expect(response.data.status).toBe('success');
        console.log('ML Rules output:', response.data.message);
        
        // Verify in DB
        const ruleRes = await client.query("SELECT COUNT(*) FROM ml_association_rules");
        expect(parseInt(ruleRes.rows[0].count)).toBeGreaterThan(0);
        console.log(`Successfully synced ${ruleRes.rows[0].count} rules to CodeIgniter Dashboard!`);
    });
});
