import pg from 'pg';
import fs from 'fs';

const { Pool } = pg;

async function sync() {
    const pool = new Pool({
        connectionString: 'postgresql://postgres.zdqrraxsefjvopucyysm:minimarket123*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
        ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();
    
    const catRes = await client.query('SELECT id, slug, name FROM categories ORDER BY name');
    const prodRes = await client.query('SELECT p.id, p.category_id, p.sku, p.name, p.price, COALESCE(p.cost_price, 0) as cost_price, p.stock, COALESCE(p.unit, \'pcs\') as unit, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.name');
    const unitRes = await client.query('SELECT id, product_id, barcode, price, conversion_factor, unit_name FROM product_units ORDER BY id');
    
    client.release();
    await pool.end();

    const categoriesJson = JSON.stringify(catRes.rows, null, 2);
    const productsJson = JSON.stringify(prodRes.rows.map(p => ({
        id: p.id,
        category_id: p.category_id,
        category_name: p.category_name || 'Umum',
        sku: p.sku,
        name: p.name,
        price: Number(p.price),
        selling_price: Number(p.price),
        cost_price: Number(p.cost_price),
        base_hpp: Number(p.cost_price),
        stock: Number(p.stock),
        unit: p.unit,
        base_unit: p.unit.toUpperCase(),
        barcode: p.sku,
        is_taxable: false,
        is_active: true
    })), null, 2);

    const unitsJson = JSON.stringify(unitRes.rows.map(u => ({
        id: u.id,
        product_id: u.product_id,
        unit_name: u.unit_name || 'pcs',
        conversion_factor: Number(u.conversion_factor || 1),
        price: Number(u.price),
        barcode: u.barcode
    })), null, 2);

    const fileContent = `export interface SeedCategory {
	id: string;
	slug: string;
	name: string;
}

export interface SeedProduct {
	id: string;
	category_id: string;
	category_name?: string;
	sku: string;
	name: string;
	price: number;
	selling_price: number;
	base_hpp: number;
	cost_price: number;
	stock: number;
	unit: string;
	base_unit: string;
	barcode: string;
	is_taxable: boolean;
	is_active: boolean;
}

export interface SeedProductUnit {
	id: string;
	product_id: string;
	unit_name: string;
	conversion_factor: number;
	price: number;
	barcode: string;
}

export const CATEGORIES: SeedCategory[] = ${categoriesJson};

export const PRODUCTS: SeedProduct[] = ${productsJson};

export const PRODUCT_UNITS: SeedProductUnit[] = ${unitsJson};
`;

    fs.writeFileSync('src/lib/server/seeds/tokoanekarasa99.ts', fileContent, 'utf8');
    console.log('✅ Seeds successfully synced from Supabase!');
}

sync().catch(err => {
    console.error('Error syncing:', err);
    process.exit(1);
});
