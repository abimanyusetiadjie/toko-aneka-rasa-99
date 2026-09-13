import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ fetch }) => {
	const mlBaseUrl = env.ML_ENGINE_URL || 'http://localhost:8000';

	try {
		const response = await fetch(`${mlBaseUrl}/api/v1/ml/market-basket-analysis`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({})
		});

		if (!response.ok) {
			const errData = await response.json().catch(() => ({}));
			throw error(response.status, errData.detail || 'Gagal berkomunikasi dengan Python ML Engine');
		}

		const data = await response.json();
		return json(data);
	} catch (err: any) {
		if (err.status) throw err;
		throw error(500, 'Koneksi ke ML Engine gagal: ' + err.message);
	}
};
