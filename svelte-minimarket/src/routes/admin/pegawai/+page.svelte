<script lang="ts">
	import { enhance } from '$app/forms';
	import { 
		Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Users, Clock, DollarSign, 
		Lock, Power, KeyRound, Check, X, ShieldCheck, ShieldAlert 
	} from 'lucide-svelte';
	import type { User } from '$lib/types';

	let { data, form } = $props();

	// Modals Pegawai
	let showAddModal = $state(false);
	let showEditModal = $state(false);
	let editItem = $state<any>(null);

	// Modals Shift
	let showAddShiftModal = $state(false);
	let showCloseShiftModal = $state(false);
	let showEditShiftModal = $state(false);
	let selectedShift = $state<any>(null);

	// State input nominal modal & rekonsiliasi
	let startingCashDisplay = $state('Rp 200.000');
	let rawStartingCash = $state(200000);

	let actualCashDisplay = $state('');
	let rawActualCash = $state(0);

	let editStartingCashDisplay = $state('');
	let rawEditStartingCash = $state(0);

	let editActualCashDisplay = $state('');
	let rawEditActualCash = $state<number | null>(null);

	function formatCurrency(val: number | null | undefined): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(val || 0);
	}

	function openEditPegawai(user: any) {
		editItem = { ...user };
		showEditModal = true;
	}

	function openAddShift() {
		rawStartingCash = 200000;
		startingCashDisplay = 'Rp 200.000';
		showAddShiftModal = true;
	}

	function openCloseShift(shift: any) {
		selectedShift = shift;
		rawActualCash = Number(shift.expected_cash || shift.starting_cash || 0);
		actualCashDisplay = 'Rp ' + new Intl.NumberFormat('id-ID').format(rawActualCash);
		showCloseShiftModal = true;
	}

	function openEditShift(shift: any) {
		selectedShift = shift;
		rawEditStartingCash = Number(shift.starting_cash || 0);
		editStartingCashDisplay = 'Rp ' + new Intl.NumberFormat('id-ID').format(rawEditStartingCash);
		if (shift.actual_cash !== null && shift.actual_cash !== undefined) {
			rawEditActualCash = Number(shift.actual_cash);
			editActualCashDisplay = 'Rp ' + new Intl.NumberFormat('id-ID').format(rawEditActualCash);
		} else {
			rawEditActualCash = null;
			editActualCashDisplay = '';
		}
		showEditShiftModal = true;
	}

	// Helper live rupiah formatting on inputs
	function handleStartingCashInput(e: Event) {
		const val = (e.target as HTMLInputElement).value.replace(/\D/g, '');
		rawStartingCash = val ? parseInt(val, 10) : 0;
		startingCashDisplay = rawStartingCash > 0 ? 'Rp ' + new Intl.NumberFormat('id-ID').format(rawStartingCash) : '';
	}

	function handleActualCashInput(e: Event) {
		const val = (e.target as HTMLInputElement).value.replace(/\D/g, '');
		rawActualCash = val ? parseInt(val, 10) : 0;
		actualCashDisplay = rawActualCash > 0 ? 'Rp ' + new Intl.NumberFormat('id-ID').format(rawActualCash) : '';
	}

	function handleEditStartingCashInput(e: Event) {
		const val = (e.target as HTMLInputElement).value.replace(/\D/g, '');
		rawEditStartingCash = val ? parseInt(val, 10) : 0;
		editStartingCashDisplay = rawEditStartingCash > 0 ? 'Rp ' + new Intl.NumberFormat('id-ID').format(rawEditStartingCash) : '';
	}

	function handleEditActualCashInput(e: Event) {
		const val = (e.target as HTMLInputElement).value.replace(/\D/g, '');
		if (!val) {
			rawEditActualCash = null;
			editActualCashDisplay = '';
		} else {
			rawEditActualCash = parseInt(val, 10);
			editActualCashDisplay = 'Rp ' + new Intl.NumberFormat('id-ID').format(rawEditActualCash);
		}
	}

	let closeDifference = $derived(rawActualCash - Number(selectedShift?.expected_cash || selectedShift?.starting_cash || 0));

	let userFilter = $state<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
	let activeUsersCount = $derived(data.users.filter((u: any) => u.is_active !== false).length);
	let inactiveUsersCount = $derived(data.users.filter((u: any) => u.is_active === false).length);
	let filteredUsers = $derived(
		data.users.filter((u: any) => {
			if (userFilter === 'ACTIVE') return u.is_active !== false;
			if (userFilter === 'INACTIVE') return u.is_active === false;
			return true;
		})
	);
</script>

<div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
	<!-- Header -->
	<header class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
		<div>
			<div class="flex items-center gap-2 mb-1 flex-wrap">
				<span class="text-[10px] sm:text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">PENGGUNA & HAK AKSES</span>
				<span class="text-[10px] sm:text-xs text-slate-500 font-mono">Staff & Cash Drawer Audit</span>
			</div>
			<h2 class="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
				<Users class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
				<span>Data Pegawai & Rekap Shift Kasir</span>
			</h2>
			<p class="text-xs text-slate-600">Kelola akun pegawai, kredensial login, dan audit rekonsiliasi kas laci kasir secara transparan.</p>
		</div>

		<div class="flex items-center gap-2">
			<button
				onclick={openAddShift}
				class="bg-emerald-700 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
			>
				<Clock class="w-4 h-4" />
				<span>Buka Shift Baru</span>
			</button>

			<button
				onclick={() => (showAddModal = true)}
				class="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
			>
				<Plus class="w-4 h-4" />
				<span>Tambah Pegawai</span>
			</button>
		</div>
	</header>

	<!-- Flash Message Notification -->
	{#if form?.message}
		<div class="p-3.5 rounded-lg text-xs font-semibold flex items-center gap-2 {form.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}">
			{#if form.success}
				<CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
			{:else}
				<AlertCircle class="w-4 h-4 text-red-600 shrink-0" />
			{/if}
			<span>{form.message}</span>
		</div>
	{/if}

	<!-- 1. TABEL DATA PEGAWAI -->
	<section class="pos-panel bg-white overflow-hidden shadow-sm border border-slate-200 rounded-xl">
		<div class="p-3.5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
			<div class="flex items-center gap-2">
				<Users class="w-4 h-4 text-blue-600" />
				<h3 class="font-bold text-slate-900">Daftar Akun Pegawai & Hak Akses</h3>
			</div>

			<div class="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-[11px] font-semibold">
				<button 
					type="button" 
					onclick={() => (userFilter = 'ALL')}
					class="px-2.5 py-1 rounded-md transition-all {userFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}"
				>
					Semua ({data.users.length})
				</button>
				<button 
					type="button" 
					onclick={() => (userFilter = 'ACTIVE')}
					class="px-2.5 py-1 rounded-md transition-all {userFilter === 'ACTIVE' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}"
				>
					Aktif ({activeUsersCount})
				</button>
				{#if inactiveUsersCount > 0}
					<button 
						type="button" 
						onclick={() => (userFilter = 'INACTIVE')}
						class="px-2.5 py-1 rounded-md transition-all {userFilter === 'INACTIVE' ? 'bg-white text-slate-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}"
					>
						Non-Aktif ({inactiveUsersCount})
					</button>
				{/if}
			</div>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs border-collapse">
				<thead>
					<tr class="text-slate-500 border-b border-slate-200 bg-slate-50/50 text-[11px] font-mono">
						<th class="py-3 px-4">NAMA LENGKAP</th>
						<th class="py-3 px-4">USERNAME</th>
						<th class="py-3 px-4">ROLE / JABATAN</th>
						<th class="py-3 px-4 text-center">STATUS</th>
						<th class="py-3 px-4">TERDAFTAR</th>
						<th class="py-3 px-4 text-center w-28">AKSI</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filteredUsers as u}
						<tr class="hover:bg-slate-50/80 transition-colors">
							<td class="py-3 px-4 font-bold text-slate-900">
								<div class="flex items-center gap-2.5">
									<div class="w-7 h-7 rounded-full {u.role_id === 1 ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'} border flex items-center justify-center font-bold text-xs">
										{u.full_name?.charAt(0)?.toUpperCase() || 'P'}
									</div>
									<span class="{u.is_active === false ? 'line-through text-slate-400' : ''}">{u.full_name}</span>
								</div>
							</td>
							<td class="py-3 px-4 font-mono text-slate-600">@{u.username}</td>
							<td class="py-3 px-4">
								<span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] {u.role_id === 1 ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}">
									{u.role_name || (u.role_id === 1 ? 'Owner' : 'Kasir')}
								</span>
							</td>
							<td class="py-3 px-4 text-center">
								{#if u.is_active !== false}
									<span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
										<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aktif
									</span>
								{:else}
									<span class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
										<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Non-Aktif
									</span>
								{/if}
							</td>
							<td class="py-3 px-4 text-slate-500 font-mono text-[11px]">
								{u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
							</td>
							<td class="py-3 px-4 text-center">
								<div class="flex items-center justify-center gap-1.5">
									<!-- Edit Pegawai -->
									<button
										onclick={() => openEditPegawai(u)}
										class="p-1.5 rounded hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition-colors"
										title="Edit Data Pegawai"
									>
										<Edit2 class="w-3.5 h-3.5" />
									</button>

									<!-- Toggle Aktif/Nonaktif -->
									<form method="POST" action="?/toggleStatusPegawai" use:enhance>
										<input type="hidden" name="id" value={u.id} />
										<button
											type="submit"
											class="p-1.5 rounded hover:bg-amber-50 {u.is_active !== false ? 'text-emerald-600 hover:text-amber-700' : 'text-slate-400 hover:text-emerald-600'} transition-colors"
											title={u.is_active !== false ? 'Klik untuk Non-aktifkan' : 'Klik untuk Aktifkan'}
										>
											<Power class="w-3.5 h-3.5" />
										</button>
									</form>

									<!-- Hapus Pegawai -->
									<form
										method="POST"
										action="?/deletePegawai"
										use:enhance
										onsubmit={(e) => {
											if (!confirm(`Hapus pegawai "${u.full_name}" (@${u.username}) secara permanen? Data pegawai akan dihapus dari daftar dan riwayat transaksi dialihkan ke Owner.`)) e.preventDefault();
										}}
									>
										<input type="hidden" name="id" value={u.id} />
										<button type="submit" class="p-1.5 rounded hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors" title="Hapus Pegawai">
											<Trash2 class="w-3.5 h-3.5" />
										</button>
									</form>
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="6" class="py-12 text-center text-slate-400">
								Belum ada data pegawai terdaftar.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<!-- 2. TABEL REKAP SHIFT KASIR & KAS LACI -->
	<section class="pos-panel bg-white overflow-hidden shadow-sm border border-slate-200 rounded-xl space-y-2">
		<div class="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
			<div class="flex items-center gap-2">
				<Clock class="w-4 h-4 text-emerald-600" />
				<h3 class="font-bold text-slate-900">Rekapitulasi Shift Kasir & Rekonsiliasi Kas Laci (Z-Report Audit)</h3>
			</div>
			<span class="text-slate-500 font-mono">Daftar {data.shifts.length} Shift</span>
		</div>

		<div class="overflow-x-auto p-2">
			<table class="w-full text-left text-xs border-collapse">
				<thead>
					<tr class="text-slate-500 border-b border-slate-200 bg-slate-50/50 text-[11px] font-mono">
						<th class="py-2.5 px-3">KASIR BERTUGAS</th>
						<th class="py-2.5 px-3">BUKA SHIFT</th>
						<th class="py-2.5 px-3">TUTUP SHIFT</th>
						<th class="py-2.5 px-3 text-right">MODAL AWAL</th>
						<th class="py-2.5 px-3 text-right">KAS DIHARAPKAN</th>
						<th class="py-2.5 px-3 text-right">KAS FISIK AKTUAL</th>
						<th class="py-2.5 px-3 text-right">SELISIH KAS</th>
						<th class="py-2.5 px-3 text-center">STATUS</th>
						<th class="py-2.5 px-3 text-center w-28">AKSI</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each data.shifts as s}
						<tr class="hover:bg-slate-50 transition-colors text-[11px]">
							<td class="py-2.5 px-3 font-bold text-slate-900">
								<span>{s.cashier_name || 'Kasir'}</span>
								{#if s.cashier_username}
									<span class="text-[10px] text-slate-500 font-mono block">@{s.cashier_username}</span>
								{/if}
							</td>
							<td class="py-2.5 px-3 text-slate-600 font-mono">
								{new Date(s.opened_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
							</td>
							<td class="py-2.5 px-3 text-slate-600 font-mono">
								{#if s.closed_at}
									{new Date(s.closed_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
								{:else}
									<span class="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">🟢 Berjalan</span>
								{/if}
							</td>
							<td class="py-2.5 px-3 text-right font-mono text-slate-700">{formatCurrency(s.starting_cash)}</td>
							<td class="py-2.5 px-3 text-right font-mono font-bold text-slate-800">{formatCurrency(s.expected_cash || s.starting_cash)}</td>
							<td class="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
								{s.actual_cash !== null && s.actual_cash !== undefined ? formatCurrency(s.actual_cash) : '-'}
							</td>
							<td class="py-2.5 px-3 text-right font-mono font-bold">
								{#if s.status === 'OPEN'}
									<span class="text-slate-400 font-normal">-</span>
								{:else if (s.cash_difference || 0) === 0}
									<span class="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">Pas (0)</span>
								{:else if (s.cash_difference || 0) > 0}
									<span class="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">+{formatCurrency(s.cash_difference)}</span>
								{:else}
									<span class="text-red-700 bg-red-50 px-1.5 py-0.5 rounded text-[10px]">{formatCurrency(s.cash_difference)}</span>
								{/if}
							</td>
							<td class="py-2.5 px-3 text-center">
								<span class="px-2 py-0.5 rounded text-[10px] font-bold {s.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'}">
									{s.status === 'OPEN' ? '🟢 Aktif' : 'Tutup'}
								</span>
							</td>
							<td class="py-2.5 px-3 text-center">
								<div class="flex items-center justify-center gap-1">
									<!-- Tombol Tutup Shift (Jika status OPEN) -->
									{#if s.status === 'OPEN'}
										<button
											onclick={() => openCloseShift(s)}
											class="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition-all shadow-xs"
											title="Rekonsiliasi & Tutup Shift"
										>
											Tutup
										</button>
									{/if}

									<!-- Edit Shift -->
									<button
										onclick={() => openEditShift(s)}
										class="p-1 rounded hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition-colors"
										title="Edit Catatan Shift"
									>
										<Edit2 class="w-3.5 h-3.5" />
									</button>

									<!-- Hapus Shift -->
									<form
										method="POST"
										action="?/deleteShift"
										use:enhance
										onsubmit={(e) => {
											if (!confirm(`Hapus catatan shift kasir ini?`)) e.preventDefault();
										}}
									>
										<input type="hidden" name="shift_id" value={s.id} />
										<button type="submit" class="p-1 rounded hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors" title="Hapus Catatan Shift">
											<Trash2 class="w-3.5 h-3.5" />
										</button>
									</form>
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="9" class="py-8 text-center text-slate-400">
								Belum ada catatan shift kasir. Silakan klik tombol "Buka Shift Baru".
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</div>

<!-- ======================================================== -->
<!-- MODAL: TAMBAH PEGAWAI BARU -->
<!-- ======================================================== -->
{#if showAddModal}
	<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="pos-panel bg-white border-slate-300 w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl rounded-xl">
			<div class="flex justify-between items-center pb-2 border-b border-slate-200">
				<h3 class="font-bold text-slate-900 text-base flex items-center gap-2">
					<Users class="w-4 h-4 text-blue-600" />
					Tambah Pegawai Baru
				</h3>
				<button onclick={() => (showAddModal = false)} class="text-slate-400 hover:text-slate-700 text-sm">✕</button>
			</div>

			<form
				method="POST"
				action="?/createPegawai"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						showAddModal = false;
					};
				}}
				class="space-y-3.5 text-xs"
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
					<input id="p-pw-cr" type="password" name="password" required placeholder="Minimal 6 karakter" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900" />
				</div>

				<div>
					<label for="p-ro-cr" class="block font-bold text-slate-700 mb-1">Jabatan / Role</label>
					<select id="p-ro-cr" name="role_id" required class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900 font-semibold">
						{#each data.roles as r}
							<option value={r.id}>{r.name}</option>
						{/each}
					</select>
				</div>

				<div class="pt-3 flex justify-end gap-2 border-t border-slate-100">
					<button type="button" onclick={() => (showAddModal = false)} class="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold">
						Batal
					</button>
					<button type="submit" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold shadow-xs">
						Simpan Pegawai
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- ======================================================== -->
<!-- MODAL: EDIT PEGAWAI -->
<!-- ======================================================== -->
{#if showEditModal && editItem}
	<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="pos-panel bg-white border-slate-300 w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl rounded-xl">
			<div class="flex justify-between items-center pb-2 border-b border-slate-200">
				<h3 class="font-bold text-slate-900 text-base flex items-center gap-2">
					<Edit2 class="w-4 h-4 text-blue-600" />
					Edit Data Pegawai
				</h3>
				<button onclick={() => (showEditModal = false)} class="text-slate-400 hover:text-slate-700 text-sm">✕</button>
			</div>

			<form
				method="POST"
				action="?/updatePegawai"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						showEditModal = false;
					};
				}}
				class="space-y-3.5 text-xs"
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
					<label for="p-pw-ed" class="block font-bold text-slate-700 mb-1">Ganti Password (Opsional)</label>
					<input id="p-pw-ed" type="password" name="password" placeholder="Biarkan kosong jika tidak ingin ganti" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900" />
				</div>

				<div>
					<label for="p-ro-ed" class="block font-bold text-slate-700 mb-1">Jabatan / Role</label>
					<select id="p-ro-ed" name="role_id" bind:value={editItem.role_id} required class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900 font-semibold">
						{#each data.roles as r}
							<option value={r.id}>{r.name}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="p-act-ed" class="block font-bold text-slate-700 mb-1">Status Keaktifan Akun</label>
					<select id="p-act-ed" name="is_active" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900 font-semibold">
						<option value="true" selected={editItem.is_active !== false}>🟢 Aktif (Dapat Login Kasir/Admin)</option>
						<option value="false" selected={editItem.is_active === false}>⚪ Non-Aktif (Akses Dinonaktifkan)</option>
					</select>
				</div>

				<div class="pt-3 flex justify-end gap-2 border-t border-slate-100">
					<button type="button" onclick={() => (showEditModal = false)} class="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold">
						Batal
					</button>
					<button type="submit" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold shadow-xs">
						Simpan Perubahan
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- ======================================================== -->
<!-- MODAL: BUKA SHIFT BARU -->
<!-- ======================================================== -->
{#if showAddShiftModal}
	<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="pos-panel bg-white border-slate-300 w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl rounded-xl">
			<div class="flex justify-between items-center pb-2 border-b border-slate-200">
				<h3 class="font-bold text-slate-900 text-base flex items-center gap-2">
					<Clock class="w-4 h-4 text-emerald-600" />
					Buka Shift Kasir Baru
				</h3>
				<button onclick={() => (showAddShiftModal = false)} class="text-slate-400 hover:text-slate-700 text-sm">✕</button>
			</div>

			<form
				method="POST"
				action="?/createShift"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						showAddShiftModal = false;
					};
				}}
				class="space-y-4 text-xs"
			>
				<div>
					<label for="sh-user" class="block font-bold text-slate-700 mb-1">Kasir Bertugas</label>
					<select id="sh-user" name="user_id" required class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-emerald-600 text-slate-900 font-semibold">
						<option value="" disabled selected>-- Pilih Kasir --</option>
						{#each data.users.filter(u => u.is_active !== false) as u}
							<option value={u.id}>{u.full_name} (@{u.username})</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="sh-start-cash" class="block font-bold text-slate-700 mb-1">Modal Awal Kas Laci (Starting Cash)</label>
					<input
						id="sh-start-cash"
						type="text"
						inputmode="numeric"
						value={startingCashDisplay}
						oninput={handleStartingCashInput}
						placeholder="Contoh: Rp 200.000"
						class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-base font-bold outline-none focus:border-emerald-600 text-slate-900"
					/>
					<input type="hidden" name="starting_cash" value={rawStartingCash} />
					<p class="text-[11px] text-slate-500 mt-1">Uang pecahan kecil yang disediakan di laci kasir saat awal shift dimulai.</p>
				</div>

				<div class="pt-3 flex justify-end gap-2 border-t border-slate-100">
					<button type="button" onclick={() => (showAddShiftModal = false)} class="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold">
						Batal
					</button>
					<button type="submit" class="bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow-xs">
						Buka Shift Sekarang
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- ======================================================== -->
<!-- MODAL: TUTUP SHIFT & REKONSILIASI KAS LACI -->
<!-- ======================================================== -->
{#if showCloseShiftModal && selectedShift}
	<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="pos-panel bg-white border-slate-300 w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl rounded-xl">
			<div class="flex justify-between items-center pb-2 border-b border-slate-200">
				<h3 class="font-bold text-slate-900 text-base flex items-center gap-2">
					<DollarSign class="w-4 h-4 text-emerald-600" />
					Tutup Shift & Rekonsiliasi Kas Laci
				</h3>
				<button onclick={() => (showCloseShiftModal = false)} class="text-slate-400 hover:text-slate-700 text-sm">✕</button>
			</div>

			<div class="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
				<div class="flex justify-between">
					<span class="text-slate-500">Kasir:</span>
					<span class="font-bold text-slate-900">{selectedShift.cashier_name}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-slate-500">Jam Buka:</span>
					<span class="font-mono text-slate-700">{new Date(selectedShift.opened_at).toLocaleString('id-ID')}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-slate-500">Modal Awal:</span>
					<span class="font-mono font-bold text-slate-700">{formatCurrency(selectedShift.starting_cash)}</span>
				</div>
				<div class="flex justify-between border-t border-slate-200 pt-1.5">
					<span class="text-slate-700 font-bold">Kas Diharapkan di Laci:</span>
					<span class="font-mono font-black text-emerald-800 text-sm">{formatCurrency(selectedShift.expected_cash || selectedShift.starting_cash)}</span>
				</div>
			</div>

			<form
				method="POST"
				action="?/closeShift"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						showCloseShiftModal = false;
					};
				}}
				class="space-y-4 text-xs"
			>
				<input type="hidden" name="shift_id" value={selectedShift.id} />

				<div>
					<label for="close-actual-cash" class="block font-bold text-slate-700 mb-1">Hitungan Uang Fisik Aktual di Laci (Actual Cash)</label>
					<input
						id="close-actual-cash"
						type="text"
						inputmode="numeric"
						value={actualCashDisplay}
						oninput={handleActualCashInput}
						required
						placeholder="Ketik total uang fisik di laci..."
						class="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-base font-bold outline-none focus:border-emerald-600 text-slate-900"
					/>
					<input type="hidden" name="actual_cash" value={rawActualCash} />
				</div>

				<!-- Live Preview Selisih Kas -->
				<div class="p-3 rounded-lg border {closeDifference === 0 ? 'bg-emerald-50 border-emerald-200' : closeDifference > 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}">
					<div class="flex justify-between items-center text-xs">
						<span class="font-bold text-slate-700">HASIL REKONSILIASI KAS:</span>
						<span class="font-mono font-black text-sm {closeDifference === 0 ? 'text-emerald-700' : closeDifference > 0 ? 'text-blue-700' : 'text-red-700'}">
							{#if closeDifference === 0}
								✓ Pas (Sesuai)
							{:else if closeDifference > 0}
								+ {formatCurrency(closeDifference)} (Lebih)
							{:else}
								{formatCurrency(closeDifference)} (Kurang)
							{/if}
						</span>
					</div>
				</div>

				<div class="pt-3 flex justify-end gap-2 border-t border-slate-100">
					<button type="button" onclick={() => (showCloseShiftModal = false)} class="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold">
						Batal
					</button>
					<button type="submit" class="bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow-xs">
						Simpan & Tutup Shift
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- ======================================================== -->
<!-- MODAL: EDIT CATATAN SHIFT KASIR -->
<!-- ======================================================== -->
{#if showEditShiftModal && selectedShift}
	<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="pos-panel bg-white border-slate-300 w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl rounded-xl">
			<div class="flex justify-between items-center pb-2 border-b border-slate-200">
				<h3 class="font-bold text-slate-900 text-base flex items-center gap-2">
					<Edit2 class="w-4 h-4 text-blue-600" />
					Koreksi Catatan Shift Kasir
				</h3>
				<button onclick={() => (showEditShiftModal = false)} class="text-slate-400 hover:text-slate-700 text-sm">✕</button>
			</div>

			<form
				method="POST"
				action="?/updateShift"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						showEditShiftModal = false;
					};
				}}
				class="space-y-3.5 text-xs"
			>
				<input type="hidden" name="shift_id" value={selectedShift.id} />

				<div>
					<label for="ed-sh-kasir" class="block font-bold text-slate-700 mb-1">Kasir</label>
					<input id="ed-sh-kasir" type="text" disabled value={selectedShift.cashier_name} class="w-full bg-slate-100 border border-slate-300 rounded-lg p-2.5 text-slate-600 font-semibold cursor-not-allowed" />
				</div>

				<div>
					<label for="ed-sh-start" class="block font-bold text-slate-700 mb-1">Koreksi Modal Awal (Starting Cash)</label>
					<input
						id="ed-sh-start"
						type="text"
						inputmode="numeric"
						value={editStartingCashDisplay}
						oninput={handleEditStartingCashInput}
						required
						class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-base font-bold outline-none focus:border-blue-600 text-slate-900"
					/>
					<input type="hidden" name="starting_cash" value={rawEditStartingCash} />
				</div>

				<div>
					<label for="ed-sh-actual" class="block font-bold text-slate-700 mb-1">Koreksi Kas Aktual Fisik (Actual Cash)</label>
					<input
						id="ed-sh-actual"
						type="text"
						inputmode="numeric"
						value={editActualCashDisplay}
						oninput={handleEditActualCashInput}
						placeholder="Belum dihitung fisik"
						class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-base font-bold outline-none focus:border-blue-600 text-slate-900"
					/>
					<input type="hidden" name="actual_cash" value={rawEditActualCash !== null ? rawEditActualCash : ''} />
				</div>

				<div>
					<label for="ed-sh-status" class="block font-bold text-slate-700 mb-1">Status Shift</label>
					<select id="ed-sh-status" name="status" bind:value={selectedShift.status} class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900 font-semibold">
						<option value="OPEN">🟢 OPEN (Masih Bertugas)</option>
						<option value="CLOSED">⚪ CLOSED (Shift Ditutup)</option>
					</select>
				</div>

				<div class="pt-3 flex justify-end gap-2 border-t border-slate-100">
					<button type="button" onclick={() => (showEditShiftModal = false)} class="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold">
						Batal
					</button>
					<button type="submit" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold shadow-xs">
						Simpan Koreksi
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

