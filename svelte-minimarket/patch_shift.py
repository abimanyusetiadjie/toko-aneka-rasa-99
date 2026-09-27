import re

file_path = 'src/routes/pos/+page.svelte'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change default startingCash
content = re.sub(
    r'let startingCash = \$state\(200000\); // Default Modal Awal Laci Rp 200\.000',
    'let startingCash = $state(250000); // Default Modal Awal Laci Rp 250.000\n\tlet isShiftOpen = $state(false);\n\tlet showOpeningModal = $state(false);',
    content
)

# 2. Update localStorage parsing
content = re.sub(
    r'(const savedStartingCash = localStorage\.getItem\(\'aneka_pos_starting_cash\'\);\s+if \(savedStartingCash\) \{\s+startingCash = Number\(savedStartingCash\) \|\| )200000(;)',
    r'\g<1>250000\g<2>',
    content
)

# 3. Add shift open check on mount
mount_block = '''
				const savedShiftStatus = localStorage.getItem('aneka_pos_shift_open');
				if (savedShiftStatus === 'true') {
					isShiftOpen = true;
				} else {
					isShiftOpen = false;
					showOpeningModal = true;
				}
				
				const savedStartingCash = localStorage.getItem('aneka_pos_starting_cash');'''
content = content.replace("const savedStartingCash = localStorage.getItem('aneka_pos_starting_cash');", mount_block)

# 4. Update handleResetShift
reset_block = '''localStorage.removeItem('aneka_pos_today_tx');
			localStorage.removeItem('aneka_pos_today_expenses');
			localStorage.removeItem('aneka_pos_shift_open'); // Shift ditutup'''
content = content.replace("localStorage.removeItem('aneka_pos_today_tx');\n\t\t\tlocalStorage.removeItem('aneka_pos_today_expenses');", reset_block)

reset_state_block = '''showClosingModal = false;
			isShiftOpen = false;
			showOpeningModal = true; // Langsung minta buka shift baru untuk kasir berikutnya'''
content = content.replace("showClosingModal = false;", reset_state_block)

# 5. Insert Opening Modal at the bottom
opening_modal_html = '''
<!-- Modal Buka Kasir -->
{#if showOpeningModal}
	<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
		<div class="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
			<div class="p-5 border-b border-slate-100 bg-blue-50/50">
				<h3 class="font-black text-blue-900 text-xl flex items-center gap-2">
					<Store class="w-6 h-6 text-blue-600" /> Buka Shift Kasir Baru
				</h3>
				<p class="text-slate-500 text-xs mt-1 font-medium">Sistem mewajibkan pencatatan modal awal laci sebelum transaksi pertama.</p>
			</div>
			
			<div class="p-5 space-y-4">
				<div>
					<label class="block text-slate-700 font-bold mb-1.5 text-xs">Uang Kas Modal Awal (Laci)</label>
					<div class="relative">
						<span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Rp</span>
						<input type="number" bind:value={startingCash} class="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl font-mono font-bold text-lg outline-none transition-all" />
					</div>
					<p class="text-[10px] text-amber-600 mt-1.5 flex items-center gap-1 font-medium"><AlertCircle class="w-3 h-3"/> Default disarankan Rp 250.000 untuk kembalian kasir.</p>
				</div>
				
				<button 
					type="button"
					onclick={() => {
						localStorage.setItem('aneka_pos_shift_open', 'true');
						localStorage.setItem('aneka_pos_starting_cash', startingCash.toString());
						isShiftOpen = true;
						showOpeningModal = false;
					}}
					class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 mt-4 cursor-pointer active:scale-95">
					<CheckCircle2 class="w-5 h-5" /> BUKA KASIR SEKARANG
				</button>
			</div>
		</div>
	</div>
{/if}

'''
content = content.replace("<!-- Modal Tutup Kasir / Rekap Harian Shift (Z-Report) -->", opening_modal_html + "<!-- Modal Tutup Kasir / Rekap Harian Shift (Z-Report) -->")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done modifying starting cash and adding open shift modal.')
