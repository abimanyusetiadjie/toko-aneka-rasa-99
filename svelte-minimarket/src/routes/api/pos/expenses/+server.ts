import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { memoryExpenses, recordMemoryExpense, deleteMemoryExpense } from '$lib/server/db';

export const GET: RequestHandler = async () => {
	return json({
		status: 'success',
		expenses: memoryExpenses
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
	const cashier = body.cashier || locals.user?.full_name || 'Siti Aminah';

	const newExpense = {
		id: `exp-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
		category,
		amount,
		notes,
		cashier,
		created_at: new Date().toISOString()
	};

	recordMemoryExpense(newExpense);

	return json({
		status: 'success',
		message: 'Pengeluaran berhasil dicatat',
		expense: newExpense
	}, { status: 201 });
};

export const DELETE: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');
	if (!id) {
		throw error(400, 'ID pengeluaran diperlukan');
	}

	deleteMemoryExpense(id);

	return json({
		status: 'success',
		message: 'Pengeluaran berhasil dihapus'
	});
};
