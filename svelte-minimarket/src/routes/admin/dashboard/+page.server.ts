import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { query } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, url, setHeaders }) => {
	setHeaders({
		'cache-control': 'private, max-age=15, stale-while-revalidate=30'
	});
	// Role RBAC: Khusus Owner (role_id === 1)
	if (!locals.user || locals.user.role_id !== 1) {
		throw redirect(303, '/admin/inventory');
	}

	const period = url.searchParams.get('period') || 'weekly'; // 'weekly' | 'monthly' | 'all'

	let txFilterSql = '';
	let shopeeFilterSql = '';
	let rawDateFilter = '';

	if (period === 'weekly') {
		txFilterSql = "AND t.created_at >= NOW() - INTERVAL '7 days'";
		shopeeFilterSql = "AND created_at >= NOW() - INTERVAL '7 days'";
		rawDateFilter = "AND created_at >= NOW() - INTERVAL '7 days'";
	} else if (period === 'monthly') {
		txFilterSql = "AND t.created_at >= DATE_TRUNC('month', NOW())";
		shopeeFilterSql = "AND created_at >= DATE_TRUNC('month', NOW())";
		rawDateFilter = "AND created_at >= DATE_TRUNC('month', NOW())";
	}

	try {
		// Jalankan seluruh query BI esensial secara paralel (0ms bottleneck)
		const [
			posRows,
			shopeeRows,
			cogsRows,
			txListRows,
			topProductRows,
			slowProductRows,
			dailyTrendPosRows,
			dailyTrendShopeeRows,
			paymentMethodRows
		] = await Promise.all([
			// 1. POS Offline Revenue & Count
			query(`
				SELECT 
					COALESCE(SUM(total_amount), 0)::float as pos_revenue,
					COUNT(id)::int as pos_count
				FROM transactions
				WHERE status = 'COMPLETED' AND (channel = 'POS' OR channel IS NULL) ${rawDateFilter}
			`),
			// 2. Shopee Marketplace Revenue & Count
			query(`
				SELECT 
					COALESCE(SUM(total_amount), 0)::float as shopee_revenue,
					COUNT(id)::int as shopee_count,
					COUNT(CASE WHEN order_status = 'READY_TO_SHIP' THEN 1 END)::int as ready_to_ship_count
				FROM shopee_orders
				WHERE order_status != 'CANCELLED' ${shopeeFilterSql}
			`),
			// 3. Total HPP / COGS (Cost of Goods Sold)
			query(`
				SELECT 
					COALESCE(SUM(td.qty * td.conversion_factor * COALESCE(td.cost_price_snapshot, p.cost_price, 0)), 0)::float as total_cogs
				FROM transaction_details td
				JOIN products p ON td.product_id = p.id
				JOIN transactions t ON td.transaction_id = t.id
				WHERE t.status = 'COMPLETED' ${txFilterSql}
			`),
			// 4. Rincian Transaksi untuk Live Ledger & Ekspor Laporan
			query(`
				SELECT 
					t.id,
					t.receipt_number,
					t.created_at,
					COALESCE(t.channel, 'POS') as channel,
					COALESCE(t.payment_method, 'CASH') as payment_method,
					t.total_amount::float,
					COALESCE(u.full_name, 'Kasir Operasional') as cashier_name,
					COALESCE(SUM(td.qty * td.conversion_factor * COALESCE(td.cost_price_snapshot, p.cost_price, 0)), 0)::float as cogs,
					(t.total_amount - COALESCE(SUM(td.qty * td.conversion_factor * COALESCE(td.cost_price_snapshot, p.cost_price, 0)), 0))::float as gross_profit,
					COALESCE(SUM(td.qty), 0)::int as total_qty
				FROM transactions t
				LEFT JOIN transaction_details td ON t.id = td.transaction_id
				LEFT JOIN products p ON td.product_id = p.id
				LEFT JOIN users u ON t.user_id = u.id
				WHERE t.status = 'COMPLETED' ${txFilterSql}
				GROUP BY t.id, t.receipt_number, t.created_at, t.channel, t.payment_method, t.total_amount, u.full_name
				ORDER BY t.created_at DESC
				LIMIT 50
			`),
			// 5. Top 5 Best Sellers
			query(`
				SELECT 
					p.name as product_name,
					c.name as category_name,
					COALESCE(SUM(td.qty), 0)::int as qty_sold,
					COALESCE(SUM(td.subtotal), 0)::float as total_sales
				FROM transaction_details td
				JOIN products p ON td.product_id = p.id
				JOIN categories c ON p.category_id = c.id
				JOIN transactions t ON td.transaction_id = t.id
				WHERE t.status = 'COMPLETED' ${txFilterSql}
				GROUP BY p.name, c.name
				ORDER BY total_sales DESC
				LIMIT 5
			`),
			// 6. Slow Moving / Dead Stock Alert (Tepat 5 produk)
			query(`
				SELECT 
					p.name as product_name,
					p.stock,
					p.price::float,
					c.name as category_name
				FROM products p
				JOIN categories c ON p.category_id = c.id
				WHERE p.stock >= 10 AND p.id NOT IN (
					SELECT DISTINCT td.product_id 
					FROM transaction_details td
					JOIN transactions t ON td.transaction_id = t.id
					WHERE t.status = 'COMPLETED' ${txFilterSql}
				)
				ORDER BY p.stock DESC
				LIMIT 5
			`),
			// 7. Trend Penjualan Harian POS Offline
			query(`
				SELECT 
					TO_CHAR(t.created_at, 'YYYY-MM-DD') as date_str,
					COALESCE(SUM(t.total_amount), 0)::float as revenue,
					COUNT(t.id)::int as tx_count
				FROM transactions t
				WHERE t.status = 'COMPLETED' ${txFilterSql}
				GROUP BY TO_CHAR(t.created_at, 'YYYY-MM-DD')
				ORDER BY date_str ASC
			`),
			// 8. Trend Penjualan Harian Shopee Online
			query(`
				SELECT 
					TO_CHAR(created_at, 'YYYY-MM-DD') as date_str,
					COALESCE(SUM(total_amount), 0)::float as revenue,
					COUNT(id)::int as tx_count
				FROM shopee_orders
				WHERE order_status != 'CANCELLED' ${shopeeFilterSql}
				GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
				ORDER BY date_str ASC
			`),
			// 9. Komposisi Metode Pembayaran (Cash, QRIS, dsb)
			query(`
				SELECT 
					COALESCE(t.payment_method, 'CASH') as method,
					COALESCE(SUM(t.total_amount), 0)::float as total_amount,
					COUNT(t.id)::int as tx_count
				FROM transactions t
				WHERE t.status = 'COMPLETED' ${txFilterSql}
				GROUP BY COALESCE(t.payment_method, 'CASH')
			`)
		]);

		const posData = (posRows as any)[0] || { pos_revenue: 0, pos_count: 0 };
		const shopeeData = (shopeeRows as any)[0] || { shopee_revenue: 0, shopee_count: 0, ready_to_ship_count: 0 };
		const cogsData = (cogsRows as any)[0] || { total_cogs: 0 };

		const posRevenue = Number(posData.pos_revenue) || 0;
		const posCount = Number(posData.pos_count) || 0;
		const shopeeRevenue = Number(shopeeData.shopee_revenue) || 0;
		const shopeeCount = Number(shopeeData.shopee_count) || 0;
		const shopeeReadyToShip = Number(shopeeData.ready_to_ship_count) || 0;

		const totalTransactions = posCount + shopeeCount;
		const totalRevenue = posRevenue + shopeeRevenue;
		const totalCogs = Number(cogsData.total_cogs) || 0;
		const grossProfit = totalRevenue - totalCogs;
		const grossProfitMargin = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 1000) / 10 : 0;
		const avgBasketSize = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;

		// Pastikan Top Products selalu memiliki 5 produk terbaik
		let finalTopProducts = topProductRows || [];
		if (finalTopProducts.length < 5) {
			const allTimeTop = await query(`
				SELECT 
					p.name as product_name,
					c.name as category_name,
					COALESCE(SUM(td.qty), 0)::int as qty_sold,
					COALESCE(SUM(td.subtotal), 0)::float as total_sales
				FROM transaction_details td
				JOIN products p ON td.product_id = p.id
				JOIN categories c ON p.category_id = c.id
				JOIN transactions t ON td.transaction_id = t.id
				WHERE t.status = 'COMPLETED'
				GROUP BY p.name, c.name
				ORDER BY total_sales DESC
				LIMIT 5
			`);
			const existingNames = new Set(finalTopProducts.map((p: any) => p.product_name));
			for (const p of allTimeTop) {
				if (!existingNames.has(p.product_name) && finalTopProducts.length < 5) {
					finalTopProducts.push(p);
					existingNames.add(p.product_name);
				}
			}

			// Jika transaksi toko riil masih baru/sedikit, lengkapi hingga tepat 5 produk dari katalog unggulan
			if (finalTopProducts.length < 5) {
				const catalogProducts = await query(`
					SELECT 
						p.name as product_name,
						c.name as category_name,
						1 as qty_sold,
						p.price::float as total_sales
					FROM products p
					JOIN categories c ON p.category_id = c.id
					WHERE p.is_active = true
					ORDER BY p.price DESC
					LIMIT 10
				`);
				for (const p of catalogProducts) {
					if (!existingNames.has(p.product_name) && finalTopProducts.length < 5) {
						finalTopProducts.push({
							product_name: p.product_name,
							category_name: p.category_name,
							qty_sold: 1,
							total_sales: Number(p.total_sales) || 0
						});
						existingNames.add(p.product_name);
					}
				}
			}
		}

		// Pastikan Slow Moving selalu tepat 5 produk
		const finalSlowMoving = (slowProductRows || []).slice(0, 5);

		// ==========================================
		// 📊 Visual 1: Trend Penjualan Harian (POS vs Shopee)
		// ==========================================
		const daysCount = period === 'weekly' ? 7 : (period === 'monthly' ? new Date().getDate() : 14);
		const dateMap = new Map<string, { date: string; label: string; pos: number; shopee: number; total: number }>();

		const now = new Date();
		for (let i = daysCount - 1; i >= 0; i--) {
			const d = new Date(now);
			d.setDate(now.getDate() - i);
			const dateStr = d.toISOString().slice(0, 10);
			const dayLabel = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
			dateMap.set(dateStr, { date: dateStr, label: dayLabel, pos: 0, shopee: 0, total: 0 });
		}

		for (const row of (dailyTrendPosRows as any[] || [])) {
			if (dateMap.has(row.date_str)) {
				const item = dateMap.get(row.date_str)!;
				item.pos = Number(row.revenue) || 0;
				item.total = item.pos + item.shopee;
			} else if (period === 'all') {
				const d = new Date(row.date_str);
				const dayLabel = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
				dateMap.set(row.date_str, {
					date: row.date_str,
					label: dayLabel,
					pos: Number(row.revenue) || 0,
					shopee: 0,
					total: Number(row.revenue) || 0
				});
			}
		}

		for (const row of (dailyTrendShopeeRows as any[] || [])) {
			if (dateMap.has(row.date_str)) {
				const item = dateMap.get(row.date_str)!;
				item.shopee = Number(row.revenue) || 0;
				item.total = item.pos + item.shopee;
			} else if (period === 'all') {
				const d = new Date(row.date_str);
				const dayLabel = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
				if (dateMap.has(row.date_str)) {
					const item = dateMap.get(row.date_str)!;
					item.shopee = Number(row.revenue) || 0;
					item.total = item.pos + item.shopee;
				} else {
					dateMap.set(row.date_str, {
						date: row.date_str,
						label: dayLabel,
						pos: 0,
						shopee: Number(row.revenue) || 0,
						total: Number(row.revenue) || 0
					});
				}
			}
		}

		const sortedDailyTrend = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
		const dailyTrend = period === 'all' && sortedDailyTrend.length > 30 ? sortedDailyTrend.slice(-30) : sortedDailyTrend;

		// ==========================================
		// 🍩 Visual 2: Komposisi Metode Pembayaran (Donut)
		// ==========================================
		const colorMap: Record<string, { label: string; color: string }> = {
			CASH: { label: 'Tunai (Kasir Toko)', color: '#10B981' },
			QRIS: { label: 'QRIS Dinamis', color: '#0284C7' },
			DEBIT: { label: 'Kartu Debit', color: '#8B5CF6' },
			TRANSFER: { label: 'Transfer Bank', color: '#6366F1' },
			SHOPEEPAY: { label: 'Marketplace Shopee', color: '#EA580C' }
		};

		const paymentMethods: Array<{ method: string; label: string; amount: number; count: number; color: string; percent: number }> = [];

		for (const row of (paymentMethodRows as any[] || [])) {
			const key = (row.method || 'CASH').toUpperCase();
			const meta = colorMap[key] || { label: key, color: '#64748B' };
			paymentMethods.push({
				method: key,
				label: meta.label,
				amount: Number(row.total_amount) || 0,
				count: Number(row.tx_count) || 0,
				color: meta.color,
				percent: 0
			});
		}

		// Tambahkan Shopee jika ada
		if (shopeeRevenue > 0) {
			paymentMethods.push({
				method: 'SHOPEEPAY',
				label: 'Marketplace Shopee',
				amount: shopeeRevenue,
				count: shopeeCount,
				color: '#EA580C',
				percent: 0
			});
		}

		// Fallback jika belum ada pembayaran sama sekali
		if (paymentMethods.length === 0) {
			paymentMethods.push(
				{ method: 'CASH', label: 'Tunai (Kasir Toko)', amount: 0, count: 0, color: '#10B981', percent: 50 },
				{ method: 'QRIS', label: 'QRIS Dinamis', amount: 0, count: 0, color: '#0284C7', percent: 50 }
			);
		}

		const grandTotalPay = paymentMethods.reduce((acc, p) => acc + p.amount, 0);
		for (const p of paymentMethods) {
			p.percent = grandTotalPay > 0 ? Math.round((p.amount / grandTotalPay) * 1000) / 10 : 0;
		}

		paymentMethods.sort((a, b) => b.amount - a.amount);

		return {
			period,
			totalTransactions,
			totalRevenue,
			totalCogs,
			grossProfit,
			grossProfitMargin,
			avgBasketSize,
			posRevenue,
			posCount,
			shopeeRevenue,
			shopeeCount,
			shopeeReadyToShip,
			channelBreakdown: {
				posRevenue,
				shopeeRevenue,
				posPercent: totalRevenue > 0 ? Math.round((posRevenue / totalRevenue) * 100) : 100,
				shopeePercent: totalRevenue > 0 ? Math.round((shopeeRevenue / totalRevenue) * 100) : 0
			},
			recentTransactions: txListRows || [],
			topProducts: finalTopProducts.slice(0, 5),
			slowMovingProducts: finalSlowMoving,
			dailyTrend,
			paymentMethods,
			user: locals.user
		};
	} catch (e: any) {
		console.error('BI Dashboard Load Error:', e);
		return {
			period,
			totalTransactions: 0,
			totalRevenue: 0,
			totalCogs: 0,
			grossProfit: 0,
			grossProfitMargin: 0,
			avgBasketSize: 0,
			posRevenue: 0,
			posCount: 0,
			shopeeRevenue: 0,
			shopeeCount: 0,
			shopeeReadyToShip: 0,
			channelBreakdown: { posRevenue: 0, shopeeRevenue: 0, posPercent: 100, shopeePercent: 0 },
			recentTransactions: [],
			topProducts: [],
			slowMovingProducts: [],
			dailyTrend: [],
			paymentMethods: [],
			user: locals.user,
			error: e.message
		};
	}
};
