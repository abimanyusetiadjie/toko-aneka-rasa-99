import sys

filepath = 'svelte-minimarket/src/routes/+page.svelte'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# DESKTOP
desktop_old = """
				<!-- Desktop Nav Links -->
				<div class="hidden md:flex items-center gap-6 lg:gap-7 text-xs lg:text-sm font-bold text-slate-600">
					<a href="#hero" class="hover:text-red-600 transition-colors">Beranda</a>
					<a href="#katalog" class="hover:text-red-600 transition-colors">Katalog & Produk</a>
					<a href="#testimoni" class="hover:text-red-600 transition-colors">Testimoni</a>
					<a href="#kontak" class="hover:text-red-600 transition-colors">Lokasi & Pesan</a>
				</div>
"""

desktop_new = """
				<!-- Desktop Nav Links -->
				<div class="hidden md:flex items-center gap-6 lg:gap-7 text-xs lg:text-sm font-bold text-slate-600">
					<a href="#hero" class="{activeSection === 'hero' ? 'text-red-600' : 'hover:text-red-600'} transition-colors">Beranda</a>
					<a href="#katalog" class="{activeSection === 'katalog' ? 'text-red-600' : 'hover:text-red-600'} transition-colors">Katalog & Produk</a>
					<a href="#testimoni" class="{activeSection === 'testimoni' ? 'text-red-600' : 'hover:text-red-600'} transition-colors">Testimoni</a>
					<a href="#kontak" class="{activeSection === 'kontak' ? 'text-red-600' : 'hover:text-red-600'} transition-colors">Lokasi & Pesan</a>
				</div>
"""
content = content.replace(desktop_old.strip(), desktop_new.strip())

# MOBILE
mobile_old = """
			<div class="md:hidden py-4 border-t border-slate-100 flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-150">
				<a href="#hero" onclick={() => mobileMenuOpen = false} class="px-3 py-2 rounded-lg font-bold text-slate-700 hover:bg-slate-50 hover:text-red-600 text-sm">Beranda</a>
				<a href="#katalog" onclick={() => mobileMenuOpen = false} class="px-3 py-2 rounded-lg font-bold text-slate-700 hover:bg-slate-50 hover:text-red-600 text-sm">Katalog & Produk</a>
				<a href="#testimoni" onclick={() => mobileMenuOpen = false} class="px-3 py-2 rounded-lg font-bold text-slate-700 hover:bg-slate-50 hover:text-red-600 text-sm">Testimoni</a>
				<a href="#kontak" onclick={() => mobileMenuOpen = false} class="px-3 py-2 rounded-lg font-bold text-slate-700 hover:bg-slate-50 hover:text-red-600 text-sm">Lokasi & Pesan</a>
"""

mobile_new = """
			<div class="md:hidden py-4 border-t border-slate-100 flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-150">
				<a href="#hero" onclick={() => mobileMenuOpen = false} class="px-3 py-2 rounded-lg font-bold text-sm transition-colors {activeSection === 'hero' ? 'bg-red-50 text-red-600' : 'text-slate-700 hover:bg-slate-50 hover:text-red-600'}">Beranda</a>
				<a href="#katalog" onclick={() => mobileMenuOpen = false} class="px-3 py-2 rounded-lg font-bold text-sm transition-colors {activeSection === 'katalog' ? 'bg-red-50 text-red-600' : 'text-slate-700 hover:bg-slate-50 hover:text-red-600'}">Katalog & Produk</a>
				<a href="#testimoni" onclick={() => mobileMenuOpen = false} class="px-3 py-2 rounded-lg font-bold text-sm transition-colors {activeSection === 'testimoni' ? 'bg-red-50 text-red-600' : 'text-slate-700 hover:bg-slate-50 hover:text-red-600'}">Testimoni</a>
				<a href="#kontak" onclick={() => mobileMenuOpen = false} class="px-3 py-2 rounded-lg font-bold text-sm transition-colors {activeSection === 'kontak' ? 'bg-red-50 text-red-600' : 'text-slate-700 hover:bg-slate-50 hover:text-red-600'}">Lokasi & Pesan</a>
"""
content = content.replace(mobile_old.strip(), mobile_new.strip())

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done both")
