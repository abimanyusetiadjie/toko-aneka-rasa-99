import type { PageServerLoad, Actions } from './$types';
import { query } from '$lib/server/db';
import type { User } from '$lib/types';
import * as bcrypt from 'bcryptjs';

export const load: PageServerLoad = async () => {
	try {
		const [users, roles, shifts] = await Promise.all([
			query<User & { is_active: boolean }>(`
				SELECT u.id, u.username, u.full_name, u.role_id, r.name as role_name, u.created_at, COALESCE(u.is_active, true) as is_active
				FROM users u
				LEFT JOIN roles r ON u.role_id = r.id
				ORDER BY u.created_at DESC
			`),
			query(`SELECT id, name FROM roles ORDER BY id ASC`),
			query(`
				SELECT 
					cs.id, cs.user_id, cs.opened_at, cs.closed_at, cs.starting_cash, cs.expected_cash, cs.actual_cash,
					cs.cash_difference, cs.status, u.full_name as cashier_name, u.username as cashier_username
				FROM cashier_shifts cs
				LEFT JOIN users u ON cs.user_id = u.id
				ORDER BY cs.opened_at DESC
				LIMIT 50
			`)
		]);

		return { users: users || [], roles: roles || [], shifts: shifts || [] };
	} catch (e: any) {
		return { users: [], roles: [], shifts: [], error: e.message };
	}
};

export const actions: Actions = {
	// ==========================================
	// 👤 CRUD DATA PEGAWAI
	// ==========================================
	createPegawai: async ({ request }) => {
		const data = await request.formData();
		const username = String(data.get('username') || '').trim().toLowerCase();
		const full_name = String(data.get('full_name') || '').trim();
		const password = String(data.get('password') || '').trim();
		const role_id = Number(data.get('role_id') || 2);

		if (!username || !full_name || !password) {
			return { success: false, message: 'Semua kolom pegawai (Nama, Username, Password) wajib diisi.' };
		}

		try {
			// Cek duplikasi username
			const existing = await query(`SELECT id FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1`, [username]);
			if (existing && existing.length > 0) {
				return { success: false, message: `Username "@${username}" sudah digunakan. Silakan gunakan username lain.` };
			}

			const userId = crypto.randomUUID();
			// Gunakan 10 rounds agar responsif dan aman di Cloudflare Pages Edge
			const password_hash = await bcrypt.hash(password, 10);

			await query(
				`INSERT INTO users (id, store_id, username, full_name, password_hash, role_id, is_active)
				 VALUES ($1, '11111111-1111-1111-1111-111111111111', $2, $3, $4, $5, true)`,
				[userId, username, full_name, password_hash, role_id]
			);
			return { success: true, message: `Pegawai "${full_name}" (@${username}) berhasil ditambahkan.` };
		} catch (err: any) {
			return { success: false, message: 'Gagal menambahkan pegawai: ' + err.message };
		}
	},

	updatePegawai: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id') || '');
		const username = String(data.get('username') || '').trim().toLowerCase();
		const full_name = String(data.get('full_name') || '').trim();
		const password = String(data.get('password') || '').trim();
		const role_id = Number(data.get('role_id') || 2);
		const is_active = data.get('is_active') === 'true' || data.get('is_active') === '1';

		if (!id || !username || !full_name) {
			return { success: false, message: 'Data pegawai tidak lengkap.' };
		}

		try {
			// Cek duplikasi username untuk ID lain
			const duplicate = await query(`SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id != $2 LIMIT 1`, [username, id]);
			if (duplicate && duplicate.length > 0) {
				return { success: false, message: `Username "@${username}" sudah digunakan oleh pegawai lain.` };
			}

			if (password) {
				const password_hash = await bcrypt.hash(password, 10);
				await query(
					`UPDATE users 
					 SET username = $1, full_name = $2, role_id = $3, password_hash = $4, is_active = $5
					 WHERE id = $6`,
					[username, full_name, role_id, password_hash, is_active, id]
				);
			} else {
				await query(
					`UPDATE users 
					 SET username = $1, full_name = $2, role_id = $3, is_active = $4
					 WHERE id = $5`,
					[username, full_name, role_id, is_active, id]
				);
			}

			return { success: true, message: `Data pegawai "${full_name}" berhasil diperbarui.` };
		} catch (err: any) {
			return { success: false, message: 'Gagal memperbarui data pegawai: ' + err.message };
		}
	},

	toggleStatusPegawai: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id') || '');
		if (!id) return { success: false, message: 'ID pegawai tidak valid.' };

		try {
			await query(`UPDATE users SET is_active = NOT COALESCE(is_active, true) WHERE id = $1`, [id]);
			return { success: true, message: 'Status keaktifan pegawai berhasil diubah.' };
		} catch (err: any) {
			return { success: false, message: 'Gagal mengubah status pegawai: ' + err.message };
		}
	},

	deletePegawai: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id') || '');
		if (!id) return { success: false, message: 'ID pegawai tidak valid.' };

		try {
			// Periksa apakah pegawai memiliki relasi data riwayat transaksi atau shift
			const [txCheck, shiftCheck] = await Promise.all([
				query(`SELECT count(*)::int as count FROM transactions WHERE user_id = $1`, [id]),
				query(`SELECT count(*)::int as count FROM cashier_shifts WHERE user_id = $1`, [id])
			]);

			const totalRelasi = (Number(txCheck?.[0]?.count) || 0) + (Number(shiftCheck?.[0]?.count) || 0);

			if (totalRelasi > 0) {
				// Cegah foreign key violation: Nonaktifkan akun
				await query(`UPDATE users SET is_active = false WHERE id = $1`, [id]);
				return { 
					success: true, 
					message: `Pegawai memiliki riwayat transaksi/shift kasir. Akun dinonaktifkan (status Non-Aktif) demi integritas data audit.` 
				};
			}

			// Jika bersih dari riwayat, hapus secara permanen
			await query(`DELETE FROM users WHERE id = $1`, [id]);
			return { success: true, message: 'Pegawai berhasil dihapus secara permanen.' };
		} catch (err: any) {
			return { success: false, message: 'Gagal memproses penghapusan pegawai: ' + err.message };
		}
	},

	// ==========================================
	// ⏰ CRUD REKAP SHIFT KASIR
	// ==========================================
	createShift: async ({ request }) => {
		const data = await request.formData();
		const user_id = String(data.get('user_id') || '').trim();
		const starting_cash = Math.max(0, Number(data.get('starting_cash') || 0));

		if (!user_id) {
			return { success: false, message: 'Kasir yang bertugas wajib dipilih.' };
		}

		try {
			const shiftId = crypto.randomUUID();
			await query(
				`INSERT INTO cashier_shifts (id, store_id, user_id, starting_cash, expected_cash, opened_at, status)
				 VALUES ($1, '11111111-1111-1111-1111-111111111111', $2, $3, $3, NOW(), 'OPEN')`,
				[shiftId, user_id, starting_cash]
			);
			return { success: true, message: 'Shift kasir baru berhasil dibuka.' };
		} catch (err: any) {
			return { success: false, message: 'Gagal membuka shift kasir: ' + err.message };
		}
	},

	closeShift: async ({ request }) => {
		const data = await request.formData();
		const shift_id = String(data.get('shift_id') || '');
		const actual_cash = Number(data.get('actual_cash') || 0);

		if (!shift_id) {
			return { success: false, message: 'ID shift tidak valid.' };
		}

		try {
			// Ambil info shift
			const currentShifts = await query(`SELECT opened_at, starting_cash FROM cashier_shifts WHERE id = $1 LIMIT 1`, [shift_id]);
			if (!currentShifts || currentShifts.length === 0) {
				return { success: false, message: 'Catatan shift tidak ditemukan.' };
			}

			const shift = currentShifts[0];
			const startCash = Number(shift.starting_cash || 0);

			// Hitung total penjualan tunai sejak jam buka shift
			const salesRes = await query(
				`SELECT COALESCE(SUM(total_amount), 0) as cash_sales 
				 FROM transactions 
				 WHERE payment_method = 'CASH' AND created_at >= $1`,
				[shift.opened_at]
			);

			const cashSales = Number(salesRes?.[0]?.cash_sales || 0);
			const expectedCash = startCash + cashSales;
			const cashDifference = actual_cash - expectedCash;

			await query(
				`UPDATE cashier_shifts 
				 SET actual_cash = $1, expected_cash = $2, cash_difference = $3, closed_at = NOW(), status = 'CLOSED'
				 WHERE id = $4`,
				[actual_cash, expectedCash, cashDifference, shift_id]
			);

			return { success: true, message: 'Shift kasir berhasil ditutup dan direkonsiliasi.' };
		} catch (err: any) {
			return { success: false, message: 'Gagal menutup shift kasir: ' + err.message };
		}
	},

	updateShift: async ({ request }) => {
		const data = await request.formData();
		const shift_id = String(data.get('shift_id') || '');
		const starting_cash = Number(data.get('starting_cash') || 0);
		const raw_actual = data.get('actual_cash');
		const status = String(data.get('status') || 'OPEN');

		if (!shift_id) {
			return { success: false, message: 'ID shift tidak valid.' };
		}

		try {
			if (raw_actual !== null && raw_actual !== undefined && raw_actual !== '') {
				const actual_cash = Number(raw_actual);
				await query(
					`UPDATE cashier_shifts 
					 SET starting_cash = $1, actual_cash = $2, cash_difference = ($2 - COALESCE(expected_cash, $1)), status = $3
					 WHERE id = $4`,
					[starting_cash, actual_cash, status, shift_id]
				);
			} else {
				await query(
					`UPDATE cashier_shifts 
					 SET starting_cash = $1, status = $2
					 WHERE id = $3`,
					[starting_cash, status, shift_id]
				);
			}

			return { success: true, message: 'Catatan shift berhasil diperbarui.' };
		} catch (err: any) {
			return { success: false, message: 'Gagal memperbarui shift: ' + err.message };
		}
	},

	deleteShift: async ({ request }) => {
		const data = await request.formData();
		const shift_id = String(data.get('shift_id') || '');
		if (!shift_id) return { success: false, message: 'ID shift tidak valid.' };

		try {
			await query(`DELETE FROM cashier_shifts WHERE id = $1`, [shift_id]);
			return { success: true, message: 'Catatan shift berhasil dihapus.' };
		} catch (err: any) {
			return { success: false, message: 'Gagal menghapus shift: ' + err.message };
		}
	},

	// Alias untuk backward compatibility form lama
	create: async (event) => (actions.createPegawai as any)(event),
	update: async (event) => (actions.updatePegawai as any)(event),
	delete: async (event) => (actions.deletePegawai as any)(event)
};

