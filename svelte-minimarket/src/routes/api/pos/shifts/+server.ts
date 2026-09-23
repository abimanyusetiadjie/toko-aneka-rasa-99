import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { saveDbShiftClosing, getDbRecentShifts } from '$lib/server/db';

export const GET: RequestHandler = async () => {
	const shifts = await getDbRecentShifts();
	return json({
		status: 'success',
		shifts
	});
};

export const POST: RequestHandler = async ({ request, locals }) => {
	let body: any;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Format payload JSON tidak valid');
	}

	const cashierName = body.cashier_name || locals.user?.full_name || 'Kasir';
	const startingCash = Number(body.starting_cash) || 0;
	const totalCashSales = Number(body.total_cash_sales) || 0;
	const totalQrisSales = Number(body.total_qris_sales) || 0;
	const totalTransferSales = Number(body.total_transfer_sales) || 0;
	const totalExpenses = Number(body.total_expenses) || 0;
	const expectedDrawerCash = Number(body.expected_drawer_cash) || 0;
	const actualPhysicalCash = body.actual_physical_cash !== null && body.actual_physical_cash !== undefined ? Number(body.actual_physical_cash) : null;
	const cashDifference = body.cash_difference !== null && body.cash_difference !== undefined ? Number(body.cash_difference) : null;

	const shiftRecord = {
		id: body.id || `shift-${Date.now().toString().slice(-8)}`,
		cashier_name: cashierName,
		starting_cash: startingCash,
		total_cash_sales: totalCashSales,
		total_qris_sales: totalQrisSales,
		total_transfer_sales: totalTransferSales,
		total_expenses: totalExpenses,
		expected_drawer_cash: expectedDrawerCash,
		actual_physical_cash: actualPhysicalCash,
		cash_difference: cashDifference,
		status: 'CLOSED',
		notes: (body.notes || '').trim(),
		opened_at: body.opened_at || new Date(Date.now() - 28800000).toISOString(),
		closed_at: new Date().toISOString()
	};

	const saved = await saveDbShiftClosing(shiftRecord);

	return json({
		status: 'success',
		message: 'Laporan Tutup Kasir (Z-Report) berhasil diarsipkan ke database',
		shift: saved
	}, { status: 201 });
};
