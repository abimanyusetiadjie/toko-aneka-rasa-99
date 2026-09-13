<?= $this->extend('layout/admin') ?>

<?= $this->section('title') ?>Manajemen Inventory<?= $this->endSection() ?>
<?= $this->section('header_title') ?>Data Produk & Inventory<?= $this->endSection() ?>

<?= $this->section('header_action') ?>
    <button onclick="document.getElementById('modal-add').classList.remove('hidden')" class="bg-brand hover:bg-blue-600 text-white px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors">
        + Tambah Produk
    </button>
<?= $this->endSection() ?>

<?= $this->section('content') ?>
    <div class="card overflow-x-auto">
        <table class="w-full text-left text-sm">
            <thead>
                <tr class="text-slate-500 border-b border-slate-200">
                    <th class="pb-3 font-medium">Barcode</th>
                    <th class="pb-3 font-medium">Nama Produk</th>
                    <th class="pb-3 font-medium">Kategori</th>
                    <th class="pb-3 font-medium">Harga Pokok (HPP)</th>
                    <th class="pb-3 font-medium">Harga Jual</th>
                    <th class="pb-3 font-medium text-center">Stok</th>
                    <th class="pb-3 font-medium text-center">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                <?php foreach($products as $p): ?>
                <tr class="hover:bg-slate-50">
                    <td class="py-3 font-mono text-xs text-slate-500">
                        <span class="bg-slate-100 px-2 py-1 rounded border border-slate-200 font-semibold text-slate-700">
                            <?= htmlspecialchars($p['barcode'] ?? 'N/A') ?>
                        </span>
                    </td>
                    <td class="py-3 font-medium text-slate-800"><?= htmlspecialchars($p['name']) ?></td>
                    <td class="py-3 text-slate-600"><?= htmlspecialchars($p['category_name'] ?? 'Umum') ?></td>
                    <td class="py-3 text-slate-600 font-mono">Rp <?= number_format($p['base_hpp'], 0, ',', '.') ?></td>
                    <td class="py-3 text-emerald-600 font-mono font-semibold">Rp <?= number_format($p['selling_price'] ?? ($p['base_hpp'] * 1.25), 0, ',', '.') ?></td>
                    <td class="py-3 text-center">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold <?= $p['stock'] < 20 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800' ?>">
                            <?= number_format($p['stock'], 0, ',', '.') ?> <?= htmlspecialchars($p['base_unit'] ?? 'Pcs') ?>
                        </span>
                    </td>
                    <td class="py-3 text-center space-x-2">
                        <button onclick="editProduct('<?= $p['id'] ?>', '<?= htmlspecialchars(addslashes($p['name'])) ?>', '<?= $p['category_id'] ?>', '<?= $p['base_hpp'] ?>', '<?= $p['selling_price'] ?? ($p['base_hpp'] * 1.25) ?>', '<?= $p['stock'] ?>', '<?= htmlspecialchars(addslashes($p['barcode'] ?? '')) ?>', '<?= htmlspecialchars(addslashes($p['sku'] ?? '')) ?>')" class="text-brand hover:text-blue-700 text-xs font-medium">Edit</button>
                        <a href="/admin/inventory/delete/<?= $p['id'] ?>" onclick="return confirm('Hapus produk ini?')" class="text-red-500 hover:text-red-700 text-xs font-medium">Hapus</a>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>

    <!-- Modal Tambah -->
    <div id="modal-add" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 hidden">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-slate-800">Tambah Produk Baru</h3>
                <button onclick="document.getElementById('modal-add').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            <form action="/admin/inventory/store" method="POST" class="space-y-3 text-sm">
                <div>
                    <label class="block font-medium text-slate-700 mb-1">Nama Produk</label>
                    <input type="text" name="name" required placeholder="Contoh: Indomie Soto" class="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-brand">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-medium text-slate-700 mb-1">Kategori</label>
                        <select name="category_id" required class="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-brand">
                            <?php foreach($categories as $c): ?>
                                <option value="<?= $c['id'] ?>"><?= htmlspecialchars($c['name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div>
                        <label class="block font-medium text-slate-700 mb-1">Barcode (Scan/Ketik)</label>
                        <input type="text" name="barcode" placeholder="Otomatis jika kosong" class="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-brand">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-medium text-slate-700 mb-1">Harga Pokok (HPP)</label>
                        <input type="number" name="base_hpp" required placeholder="2500" class="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-brand">
                    </div>
                    <div>
                        <label class="block font-medium text-slate-700 mb-1">Harga Jual Kasir</label>
                        <input type="number" name="selling_price" required placeholder="3500" class="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-brand">
                    </div>
                </div>
                <div>
                    <label class="block font-medium text-slate-700 mb-1">Stok Awal (Pcs)</label>
                    <input type="number" name="stock" required placeholder="100" class="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-brand">
                </div>
                <div class="pt-3 flex justify-end gap-2">
                    <button type="button" onclick="document.getElementById('modal-add').classList.add('hidden')" class="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50">Batal</button>
                    <button type="submit" class="bg-brand text-white px-4 py-2 rounded hover:bg-blue-600 font-medium">Simpan & Daftarkan Barcode</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Edit -->
    <div id="modal-edit" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 hidden">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-slate-800">Edit Produk & Barcode</h3>
                <button onclick="document.getElementById('modal-edit').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            <form id="form-edit" method="POST" class="space-y-3 text-sm">
                <div>
                    <label class="block font-medium text-slate-700 mb-1">Nama Produk</label>
                    <input type="text" id="edit-name" name="name" required class="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-brand">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-medium text-slate-700 mb-1">Kategori</label>
                        <select id="edit-category" name="category_id" required class="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-brand">
                            <?php foreach($categories as $c): ?>
                                <option value="<?= $c['id'] ?>"><?= htmlspecialchars($c['name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div>
                        <label class="block font-medium text-slate-700 mb-1">Barcode</label>
                        <input type="text" id="edit-barcode" name="barcode" class="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-brand">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-medium text-slate-700 mb-1">Harga Pokok (HPP)</label>
                        <input type="number" id="edit-hpp" name="base_hpp" required class="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-brand">
                    </div>
                    <div>
                        <label class="block font-medium text-slate-700 mb-1">Harga Jual Kasir</label>
                        <input type="number" id="edit-price" name="selling_price" required class="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-brand">
                    </div>
                </div>
                <div>
                    <label class="block font-medium text-slate-700 mb-1">Stok (Pcs)</label>
                    <input type="number" id="edit-stock" name="stock" required class="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-brand">
                </div>
                <div class="pt-3 flex justify-end gap-2">
                    <button type="button" onclick="document.getElementById('modal-edit').classList.add('hidden')" class="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50">Batal</button>
                    <button type="submit" class="bg-brand text-white px-4 py-2 rounded hover:bg-blue-600 font-medium">Perbarui</button>
                </div>
            </form>
        </div>
    </div>
<?= $this->endSection() ?>

<?= $this->section('scripts') ?>
<script>
    function editProduct(id, name, category, hpp, price, stock, barcode, sku) {
        document.getElementById('form-edit').action = '/admin/inventory/update/' + id;
        document.getElementById('edit-name').value = name;
        document.getElementById('edit-category').value = category;
        document.getElementById('edit-hpp').value = hpp;
        document.getElementById('edit-price').value = price;
        document.getElementById('edit-stock').value = stock;
        document.getElementById('edit-barcode').value = barcode;
        document.getElementById('modal-edit').classList.remove('hidden');
    }
</script>
<?= $this->endSection() ?>
