import type { PageServerLoad, Actions } from './$types';
import { query } from '$lib/server/db';
import type { User } from '$lib/types';
import crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

export const load: PageServerLoad = async () => {
	try {
		const [users, roles, shifts] = await Promise.all([
			query<User>(`
				SELECT u.id, u.username, u.full_name, u.role_id, r.name as role_name, u.created_at
				FROM users u
				LEFT JOIN roles r ON u.role_id = r.id
				ORDER BY u.created_at DESC
			`),
			query(`SELECT id, name FROM roles ORDER BY id ASC`),
			query(`
				SELECT 
					cs.id, cs.opened_at, cs.closed_at, cs.starting_cash, cs.expected_cash, cs.actual_cash,
					cs.cash_difference, cs.status, u.full_name as cashier_name
				FROM cashier_shifts cs
				JOIN users u ON cs.user_id = u.id
				ORDER BY cs.opened_at DESC
				LIMIT 8
			`)
		]);

		return { users: users || [], roles: roles || [], shifts: shifts || [] };
	} catch (e: any) {
		return { users: [], roles: [], shifts: [], error: e.message };
	}
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const username = String(data.get('username') || '').trim();
		const full_name = String(data.get('full_name') || '').trim();
		const password = String(data.get('password') || '').trim();
		const role_id = Number(data.get('role_id') || 3);

		if (!username || !full_name || !password) {
			return { success: false, message: 'Semua kolom pegawai wajib diisi.' };
		}

		const userId = crypto.randomUUID();
		const password_hash = await bcrypt.hash(password, 12);

		try {
			await query(
				`INSERT INTO users (id, store_id, username, full_name, password_hash, role_id)
				 VALUES ($1, '11111111-1111-1111-1111-111111111111', $2, $3, $4, $5)`,
				[userId, username, full_name, password_hash, role_id]
			);
			return { success: true, message: `Pegawai "${full_name}" berhasil ditambahkan.` };
		} catch (err: any) {
			return { success: false, message: 'Gagal menambahkan pegawai: ' + err.message };
		}
	},

	update: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id'));
		const username = String(data.get('username') || '').trim();
		const full_name = String(data.get('full_name') || '').trim();
		const password = String(data.get('password') || '').trim();
		const role_id = Number(data.get('role_id') || 3);

		if (!id || !username || !full_name) {
			return { success: false, message: 'Data pegawai tidak lengkap.' };
		}

		try {
			if (password) {
				const password_hash = await bcrypt.hash(password, 12);
				await query(
					`UPDATE users 
					 SET username = $1, full_name = $2, role_id = $3, password_hash = $4, updated_at = NOW()
					 WHERE id = $5`,
					[username, full_name, role_id, password_hash, id]
				);
			} else {
				await query(
					`UPDATE users 
					 SET username = $1, full_name = $2, role_id = $3, updated_at = NOW()
					 WHERE id = $4`,
					[username, full_name, role_id, id]
				);
			}

			return { success: true, message: `Data pegawai "${full_name}" berhasil diperbarui.` };
		} catch (err: any) {
			return { success: false, message: 'Gagal memperbarui data pegawai: ' + err.message };
		}
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id'));
		if (!id) return { success: false, message: 'ID pegawai tidak valid.' };

		try {
			await query(`DELETE FROM users WHERE id = $1`, [id]);
			return { success: true, message: 'Pegawai berhasil dihapus.' };
		} catch (err: any) {
			return { success: false, message: 'Gagal menghapus pegawai: ' + err.message };
		}
	}
};
