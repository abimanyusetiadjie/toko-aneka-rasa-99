import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDbExpenses, createDbExpense, deleteDbExpense } from '$lib/server/db';

export const GET: RequestHandler = async () => {
	const expenses = await getDbExpenses();
	return json({
		status: 'success',
		expenses
	});
};

export const POST: RequestHandler = async ({ request, locals }) => {
	let body: any;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Format payload JSON tidak valid');
	}

	const amount = Number(body.amount);
	if (!amount || isNaN(amount) || amount <= 0) {
		throw error(400, 'Nominal pengeluaran harus lebih besar dari 0');
	}

	const category = (body.category || 'Lain-lain').trim();
	const notes = (body.notes || '').trim();
	const cashier = body.cashier || locals.user?.full_name || 'Kasir';

	const newExpense = {
		id: body.id || `exp-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
		category,
		amount,
		notes,
		cashier,
		created_at: body.created_at || new Date().toISOString()
	};

	const saved = await createDbExpense(newExpense);

	return json({
		status: 'success',
		message: 'Pengeluaran kas berhasil dicatat',
		expense: saved
	}, { status: 201 });
};

export const DELETE: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');
	if (!id) {
		throw error(400, 'ID pengeluaran diperlukan');
	}

	await deleteDbExpense(id);

	return json({
		status: 'success',
		message: 'Pengeluaran kas berhasil dihapus'
	});
};
