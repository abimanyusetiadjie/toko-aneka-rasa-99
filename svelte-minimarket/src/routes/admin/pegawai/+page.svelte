<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Users, Clock, DollarSign, Lock } from 'lucide-svelte';
	import type { User } from '$lib/types';

	let { data, form } = $props();

	let showAddModal = $state(false);
	let showEditModal = $state(false);
	let editItem = $state<User | null>(null);

	function formatCurrency(val: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(val || 0);
	}

	function openEdit(user: User) {
		editItem = user;
		showEditModal = true;
	}
</script>

<div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto w-full">
	<!-- Header -->
	<header class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
		<div>
			<div class="flex items-center gap-2 mb-1 flex-wrap">
				<span class="text-[10px] sm:text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">PENGGUNA & HAK AKSES</span>
				<span class="text-[10px] sm:text-xs text-slate-500 font-mono">Store Staff & Cash Drawer</span>
			</div>
			<h2 class="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
				<Users class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
				<span>Data Pegawai & Rekap Shift Kasir</span>
			</h2>
			<p class="text-xs text-slate-600">Kelola akun pengguna, hak akses peran, dan rekonsiliasi kas laci toko</p>
		</div>

		<button
			onclick={() => (showAddModal = true)}
			class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 w-full sm:w-auto shrink-0"
		>
			<Plus class="w-4 h-4" />
			<span>Tambah Pegawai Baru</span>
		</button>
	</header>

	<!-- Flash Message -->
	{#if form?.message}
		<div class="p-3.5 rounded-lg text-xs font-semibold flex items-center gap-2 {form.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}">
			{#if form.success}
				<CheckCircle2 class="w-4 h-4 text-emerald-600" />
			{:else}
				<AlertCircle class="w-4 h-4 text-red-600" />
			{/if}
			<span>{form.message}</span>
		</div>
	{/if}

	<!-- Employees Table -->
	<div class="pos-panel bg-white overflow-hidden">
		<div class="p-3.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
			<h3 class="font-bold text-slate-900">Daftar Pegawai & Hak Akses</h3>
			<span class="text-slate-500">Total: {data.users.length} Akun</span>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs border-collapse">
				<thead>
					<tr class="text-slate-500 border-b border-slate-200 bg-white text-[11px] font-mono">
						<th class="py-3 px-4">NAMA LENGKAP</th>
						<th class="py-3 px-4">USERNAME</th>
						<th class="py-3 px-4">ROLE / JABATAN</th>
						<th class="py-3 px-4">TERDAFTAR SEJAK</th>
						<th class="py-3 px-4 text-center w-24">AKSI</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each data.users as u}
						<tr class="hover:bg-slate-50 transition-colors">
							<td class="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
								<div class="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-700 text-xs">
									{u.full_name.charAt(0).toUpperCase()}
								</div>
								<span>{u.full_name}</span>
							</td>
							<td class="py-3 px-4 font-mono text-slate-600">@{u.username}</td>
							<td class="py-3 px-4">
								<span class="px-2.5 py-0.5 rounded-full font-bold text-[11px] {u.role_id === 1 ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}">
									{u.role_name || (u.role_id === 1 ? 'Owner' : u.role_id === 2 ? 'Manager' : 'Kasir')}
								</span>
							</td>
							<td class="py-3 px-4 text-slate-500 font-mono">
								{u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
							</td>
							<td class="py-3 px-4 text-center">
								<div class="flex items-center justify-center gap-1.5">
									<button
										onclick={() => openEdit(u)}
										class="p-1 text-blue-600 hover:text-blue-800 transition-colors"
										title="Edit"
									>
										<Edit2 class="w-3.5 h-3.5" />
									</button>
									<form
										method="POST"
										action="?/delete"
										use:enhance
										onsubmit={(e) => {
											if (!confirm(`Hapus pegawai "${u.full_name}"?`)) e.preventDefault();
										}}
									>
										<input type="hidden" name="id" value={u.id} />
										<button type="submit" class="p-1 text-red-500 hover:text-red-700 transition-colors" title="Hapus">
											<Trash2 class="w-3.5 h-3.5" />
										</button>
									</form>
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="5" class="py-12 text-center text-slate-400">
								Belum ada data pegawai terdaftar.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Cashier Shifts & Cash Drawer Reconciliation -->
	<div class="pos-panel bg-white overflow-hidden space-y-3">
		<div class="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
			<div class="flex items-center gap-2">
				<Clock class="w-4 h-4 text-emerald-600" />
				<h3 class="font-bold text-slate-900">Rekapitulasi Shift & Kas Laci (Cash Drawer Audit)</h3>
			</div>
			<span class="text-slate-500 font-mono">8 Shift Terakhir</span>
		</div>

		<div class="overflow-x-auto p-2">
			<table class="w-full text-left text-xs border-collapse">
				<thead>
					<tr class="text-slate-500 border-b border-slate-200 text-[11px] font-mono">
						<th class="pb-2 px-3">KASIR BERTUGAS</th>
						<th class="pb-2 px-3">BUKA SHIFT</th>
						<th class="pb-2 px-3">TUTUP SHIFT</th>
						<th class="pb-2 px-3 text-right">MODAL AWAL</th>
						<th class="pb-2 px-3 text-right">KAS DIHARAPKAN</th>
						<th class="pb-2 px-3 text-center">STATUS</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each data.shifts as s}
						<tr class="hover:bg-slate-50 transition-colors text-[11px]">
							<td class="py-2.5 px-3 font-bold text-slate-900">{s.cashier_name}</td>
							<td class="py-2.5 px-3 text-slate-500 font-mono">
								{new Date(s.opened_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
							</td>
							<td class="py-2.5 px-3 text-slate-500 font-mono">
								{s.closed_at ? new Date(s.closed_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
							</td>
							<td class="py-2.5 px-3 text-right font-mono text-slate-700">{formatCurrency(s.starting_cash)}</td>
							<td class="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">{formatCurrency(s.expected_cash || s.starting_cash)}</td>
							<td class="py-2.5 px-3 text-center">
								<span class="px-2 py-0.5 rounded text-[10px] font-bold {s.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'}">
									{s.status === 'OPEN' ? '🟢 Aktif' : 'Tutup'}
								</span>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="6" class="py-6 text-center text-slate-400">
								Belum ada catatan shift kasir.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Modal Tambah Pegawai -->
{#if showAddModal}
	<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="pos-panel bg-white border-slate-300 w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl">
			<div class="flex justify-between items-center pb-2 border-b border-slate-200">
				<h3 class="font-bold text-slate-900 text-base">Tambah Pegawai Baru</h3>
				<button onclick={() => (showAddModal = false)} class="text-slate-400 hover:text-slate-700">✕</button>
			</div>

			<form
				method="POST"
				action="?/create"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						showAddModal = false;
					};
				}}
				class="space-y-3 text-xs"
			>
				<div>
					<label for="p-fn-cr" class="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
					<input id="p-fn-cr" type="text" name="full_name" required placeholder="Contoh: Budi Santoso" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900" />
				</div>

				<div>
					<label for="p-un-cr" class="block font-bold text-slate-700 mb-1">Username Login</label>
					<input id="p-un-cr" type="text" name="username" required placeholder="kasir_budi" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900 font-mono" />
				</div>

				<div>
					<label for="p-pw-cr" class="block font-bold text-slate-700 mb-1">Password</label>
					<input id="p-pw-cr" type="password" name="password" required placeholder="••••••••" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900" />
				</div>

				<div>
					<label for="p-ro-cr" class="block font-bold text-slate-700 mb-1">Jabatan / Role</label>
					<select id="p-ro-cr" name="role_id" required class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900">
						{#each data.roles as r}
							<option value={r.id}>{r.name}</option>
						{/each}
					</select>
				</div>

				<div class="pt-3 flex justify-end gap-2">
					<button type="button" onclick={() => (showAddModal = false)} class="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100">
						Batal
					</button>
					<button type="submit" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold">
						Simpan Pegawai
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Modal Edit Pegawai -->
{#if showEditModal && editItem}
	<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="pos-panel bg-white border-slate-300 w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl">
			<div class="flex justify-between items-center pb-2 border-b border-slate-200">
				<h3 class="font-bold text-slate-900 text-base">Edit Data Pegawai</h3>
				<button onclick={() => (showEditModal = false)} class="text-slate-400 hover:text-slate-700">✕</button>
			</div>

			<form
				method="POST"
				action="?/update"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						showEditModal = false;
					};
				}}
				class="space-y-3 text-xs"
			>
				<input type="hidden" name="id" value={editItem.id} />

				<div>
					<label for="p-fn-ed" class="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
					<input id="p-fn-ed" type="text" name="full_name" bind:value={editItem.full_name} required class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900" />
				</div>

				<div>
					<label for="p-un-ed" class="block font-bold text-slate-700 mb-1">Username Login</label>
					<input id="p-un-ed" type="text" name="username" bind:value={editItem.username} required class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900 font-mono" />
				</div>

				<div>
					<label for="p-pw-ed" class="block font-bold text-slate-700 mb-1">Password Baru (Biarkan kosong jika tidak diubah)</label>
					<input id="p-pw-ed" type="password" name="password" placeholder="••••••••" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900" />
				</div>

				<div>
					<label for="p-ro-ed" class="block font-bold text-slate-700 mb-1">Jabatan / Role</label>
					<select id="p-ro-ed" name="role_id" bind:value={editItem.role_id} required class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900">
						{#each data.roles as r}
							<option value={r.id}>{r.name}</option>
						{/each}
					</select>
				</div>

				<div class="pt-3 flex justify-end gap-2">
					<button type="button" onclick={() => (showEditModal = false)} class="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100">
						Batal
					</button>
					<button type="submit" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold">
						Perbarui Data
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
