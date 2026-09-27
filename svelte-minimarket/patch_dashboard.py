import re

file_path = 'src/routes/admin/dashboard/+page.svelte'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

widget_html = '''
	<!-- 7. Riwayat Tutup Kasir (Z-Report) -->
	<section class="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
			<div>
				<h3 class="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
					<Store class="w-4 h-4 text-emerald-600" />
					Riwayat Tutup Kasir (Z-Report)
				</h3>
				<p class="text-xs text-slate-500">Rekapitulasi setoran kasir harian, modal awal, dan selisih kas fisik laci.</p>
			</div>
		</div>

		{#if data.recentShifts && data.recentShifts.length > 0}
			<div class="overflow-x-auto rounded-lg border border-slate-200">
				<table class="w-full text-left text-xs whitespace-nowrap">
					<thead>
						<tr class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
							<th class="py-3 px-4 text-center w-10">No</th>
							<th class="py-3 px-4">Waktu Tutup</th>
							<th class="py-3 px-4">Kasir</th>
							<th class="py-3 px-4 text-right">Modal Awal</th>
							<th class="py-3 px-4 text-right">Tunai Masuk</th>
							<th class="py-3 px-4 text-right text-red-600">Pengeluaran</th>
							<th class="py-3 px-4 text-right font-black">Wajib di Laci</th>
							<th class="py-3 px-4 text-right">Fisik Dihitung</th>
							<th class="py-3 px-4 text-right">Selisih</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each data.recentShifts as shift, idx}
							<tr class="hover:bg-blue-50/50 transition-colors">
								<td class="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
								<td class="py-3 px-4 text-slate-700">
									<span class="font-medium block">{new Date(shift.closed_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
									<span class="text-[10px] text-slate-500">{new Date(shift.closed_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
								</td>
								<td class="py-3 px-4 font-bold text-slate-800">
									<div class="flex items-center gap-2">
										<div class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 uppercase">{shift.cashier_name.charAt(0)}</div>
										{shift.cashier_name.split(' ')[0]}
									</div>
								</td>
								<td class="py-3 px-4 text-right font-mono text-slate-600">{Number(shift.starting_cash).toLocaleString('id-ID')}</td>
								<td class="py-3 px-4 text-right font-mono text-emerald-700 font-semibold">+{Number(shift.total_cash_sales).toLocaleString('id-ID')}</td>
								<td class="py-3 px-4 text-right font-mono text-red-600">-{Number(shift.total_expenses).toLocaleString('id-ID')}</td>
								<td class="py-3 px-4 text-right font-mono font-black text-blue-900 bg-blue-50/30">{Number(shift.expected_drawer_cash).toLocaleString('id-ID')}</td>
								<td class="py-3 px-4 text-right font-mono font-bold text-slate-900">
									{#if shift.actual_physical_cash !== null}
										{Number(shift.actual_physical_cash).toLocaleString('id-ID')}
									{:else}
										<span class="text-slate-400 italic font-sans text-[10px] px-2 py-0.5 bg-slate-100 rounded-full">N/A</span>
									{/if}
								</td>
								<td class="py-3 px-4 text-right font-mono font-bold">
									{#if shift.cash_difference !== null}
										<span class="px-2 py-1 rounded-md text-[11px] {Number(shift.cash_difference) < 0 ? 'bg-red-100 text-red-700' : (Number(shift.cash_difference) > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600')}">
											{Number(shift.cash_difference) > 0 ? '+' : ''}{Number(shift.cash_difference).toLocaleString('id-ID')}
										</span>
									{:else}
										-
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="py-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
				<Store class="w-8 h-8 mx-auto text-slate-300 mb-2" />
				<p class="font-medium">Belum Ada Riwayat Tutup Kasir</p>
				<p class="text-xs mt-1">Data shift kasir akan muncul di sini setelah kasir melakukan Z-Report.</p>
			</div>
		{/if}
	</section>
'''

# Use a regular expression to safely insert the widget right before the closing </div> of the main dashboard container.
# The main dashboard ends with:
# 	</section>
# </div>
#
# <!-- Modal Pratinjau Dokumen Laporan Resmi A4 (Siap Cetak / Simpan PDF) -->

pattern = re.compile(r'(</section>\s*)(</div>\s*<!-- Modal Pratinjau Dokumen Laporan Resmi A4)')

if pattern.search(content):
    content = pattern.sub(rf'\1\n{widget_html}\n\2', content)
    print("Found and injected!")
else:
    print("Target not found. Something is wrong.")

if 'import { Store' not in content:
	content = content.replace('import { Download,', 'import { Download, Store,')
elif 'Store' not in content:
    content = content.replace('import { Download,', 'import { Download, Store,')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done modifying file.')
