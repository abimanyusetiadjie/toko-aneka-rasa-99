<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { ArrowLeft, Link as LinkIcon, Unlink, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-svelte';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();

	let isAutoMapping = $state(false);
	let isSubmitting = $state<string | null>(null);

	function formatCurrency(val: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
	}
</script>

<svelte:head>
	<title>Tautkan Produk Shopee - Admin Aneka Rasa 99</title>
</svelte:head>

<div class="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
	<!-- Header -->
	<header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<a href="/admin/shopee" class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-2">
				<ArrowLeft class="w-4 h-4" />
				<span>Kembali ke Shopee Dashboard</span>
			</a>
			<h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
				<LinkIcon class="w-6 h-6 text-orange-600" />
				Tautkan Produk (Mapping)
			</h1>
			<p class="text-sm text-slate-500 mt-1">
				Sambungkan produk di etalase kasir dengan produk di Shopee agar stok bisa sinkron.
			</p>
		</div>

		<form method="POST" action="?/autoMap" use:enhance={() => {
			isAutoMapping = true;
			return async ({ update }) => {
				await update();
				isAutoMapping = false;
			};
		}}>
			<button
				type="submit"
				disabled={isAutoMapping || data.error}
				class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer"
			>
				<RefreshCw class="w-4 h-4 {isAutoMapping ? 'animate-spin' : ''}" />
				Auto-Map via SKU
			</button>
		</form>
	</header>

	{#if form?.message}
		<div class="p-4 rounded-xl flex items-start gap-3 {form.success ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'}">
			{#if form.success}
				<CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0" />
			{:else}
				<AlertCircle class="w-5 h-5 text-red-600 shrink-0" />
			{/if}
			<p class="text-sm font-medium">{form.message}</p>
		</div>
	{/if}

	{#if data.error}
		<div class="p-6 rounded-2xl border border-red-200 bg-red-50 text-red-900 flex flex-col items-center justify-center text-center">
			<AlertCircle class="w-10 h-10 text-red-500 mb-3" />
			<h3 class="font-bold text-lg mb-1">Gagal Menarik Data Shopee</h3>
			<p class="text-sm max-w-md">{data.error}</p>
			<a href="/admin/shopee" class="mt-4 inline-flex px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50">Periksa Koneksi Shopee</a>
		</div>
	{:else}
		<div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm whitespace-nowrap">
					<thead class="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
						<tr>
							<th class="px-4 py-3">Produk Kasir Lokal</th>
							<th class="px-4 py-3">SKU Lokal</th>
							<th class="px-4 py-3">Stok Kasir</th>
							<th class="px-4 py-3">Ditautkan ke Shopee</th>
							<th class="px-4 py-3 text-right">Aksi</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each data.localProducts as lp (lp.id)}
							<tr class="hover:bg-slate-50 transition-colors group">
								<td class="px-4 py-3">
									<p class="font-bold text-slate-900">{lp.name}</p>
									<p class="text-xs text-slate-500">{formatCurrency(lp.price)}</p>
								</td>
								<td class="px-4 py-3 text-slate-600 font-mono text-xs">{lp.sku || '-'}</td>
								<td class="px-4 py-3">
									<span class="inline-flex px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold">{lp.stock}</span>
								</td>
								<td class="px-4 py-3">
									<form method="POST" action="?/mapProduct" id="form-{lp.id}" use:enhance={() => {
										isSubmitting = lp.id;
										return async ({ update }) => {
											await update({ reset: false });
											isSubmitting = null;
										};
									}}>
										<input type="hidden" name="local_id" value={lp.id} />
										<div class="flex items-center gap-2">
											<select
												name="shopee_item_id"
												class="block w-full min-w-[250px] rounded-lg border-0 py-1.5 pl-3 pr-8 text-slate-900 ring-1 ring-inset {lp.shopee_item_id ? 'ring-emerald-300 bg-emerald-50' : 'ring-slate-300 bg-white'} focus:ring-2 focus:ring-orange-600 sm:text-sm sm:leading-6"
												onchange={() => document.getElementById(`btn-${lp.id}`)?.click()}
											>
												<option value="">-- Belum Ditautkan (Tidak Sync) --</option>
												{#each data.shopeeProducts as sp}
													<option value={sp.item_id} selected={Number(lp.shopee_item_id) === sp.item_id}>
														Shopee: {sp.item_name.substring(0, 30)}{sp.item_name.length > 30 ? '...' : ''} (SKU: {sp.item_sku || '-'})
													</option>
												{/each}
											</select>
										</div>
										<button type="submit" id="btn-{lp.id}" class="hidden">Submit</button>
									</form>
								</td>
								<td class="px-4 py-3 text-right">
									{#if lp.shopee_item_id}
										<span class="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">
											<LinkIcon class="w-3.5 h-3.5" />
											Tertaut
										</span>
									{:else}
										<span class="inline-flex items-center gap-1 text-slate-400 text-xs font-medium">
											<Unlink class="w-3.5 h-3.5" />
											Putus
										</span>
									{/if}
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="5" class="px-4 py-8 text-center text-slate-500">
									Belum ada produk lokal.
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
