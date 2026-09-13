<?= $this->extend('layout/admin') ?>

<?= $this->section('title') ?>Manajemen Pegawai<?= $this->endSection() ?>
<?= $this->section('header_title') ?>Data Pegawai & Akses<?= $this->endSection() ?>

<?= $this->section('header_action') ?>
    <button onclick="document.getElementById('modal-add').classList.remove('hidden')" class="bg-brand hover:bg-blue-600 text-white px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors">
        + Tambah Pegawai
    </button>
<?= $this->endSection() ?>

<?= $this->section('content') ?>
    <div class="card overflow-x-auto">
        <table class="w-full text-left text-sm">
            <thead>
                <tr class="text-slate-500 border-b border-slate-200">
                    <th class="pb-3 font-medium">Nama Lengkap</th>
                    <th class="pb-3 font-medium">Username</th>
                    <th class="pb-3 font-medium">Role / Jabatan</th>
                    <th class="pb-3 font-medium">Terdaftar</th>
                    <th class="pb-3 font-medium text-center">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                <?php foreach($users as $u): ?>
                <tr class="hover:bg-slate-50">
                    <td class="py-3 font-medium text-slate-800 flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                            <?= substr(htmlspecialchars($u['full_name']), 0, 1) ?>
                        </div>
                        <?= htmlspecialchars($u['full_name']) ?>
                    </td>
                    <td class="py-3 text-slate-600 font-mono"><?= htmlspecialchars($u['username']) ?></td>
                    <td class="py-3">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium <?= $u['role_id'] == 1 ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800' ?>">
                            <?= htmlspecialchars($u['role_name']) ?>
                        </span>
                    </td>
                    <td class="py-3 text-slate-500 text-xs"><?= date('d M Y', strtotime($u['created_at'])) ?></td>
                    <td class="py-3 text-center space-x-2">
                        <button onclick="editUser('<?= $u['id'] ?>', '<?= htmlspecialchars(addslashes($u['full_name'])) ?>', '<?= htmlspecialchars(addslashes($u['username'])) ?>', '<?= $u['role_id'] ?>')" class="text-brand hover:text-blue-700 text-xs">Edit</button>
                        <a href="/admin/pegawai/delete/<?= $u['id'] ?>" onclick="return confirm('Hapus pegawai ini?')" class="text-red-500 hover:text-red-700 text-xs">Hapus</a>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>

    <!-- Modal Tambah -->
    <div id="modal-add" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 hidden">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-slate-800">Tambah Pegawai Baru</h3>
                <button onclick="document.getElementById('modal-add').classList.add('hidden')" class="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form action="/admin/pegawai/store" method="POST" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                    <input type="text" name="full_name" required class="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-brand">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Username Login</label>
                    <input type="text" name="username" required class="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-brand">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input type="password" name="password" required class="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-brand">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Jabatan (Role)</label>
                    <select name="role_id" required class="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-brand">
                        <?php foreach($roles as $r): ?>
                            <option value="<?= $r['id'] ?>"><?= htmlspecialchars($r['name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="pt-4 flex justify-end gap-2">
                    <button type="button" onclick="document.getElementById('modal-add').classList.add('hidden')" class="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50">Batal</button>
                    <button type="submit" class="bg-brand text-white px-4 py-2 rounded hover:bg-blue-600">Simpan</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Edit -->
    <div id="modal-edit" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 hidden">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-slate-800">Edit Data Pegawai</h3>
                <button onclick="document.getElementById('modal-edit').classList.add('hidden')" class="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form id="form-edit" method="POST" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                    <input type="text" id="edit-fullname" name="full_name" required class="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-brand">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Username Login</label>
                    <input type="text" id="edit-username" name="username" required class="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-brand">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Password Baru (Biarkan kosong jika tidak diubah)</label>
                    <input type="password" name="password" class="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-brand" placeholder="********">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Jabatan (Role)</label>
                    <select id="edit-role" name="role_id" required class="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-brand">
                        <?php foreach($roles as $r): ?>
                            <option value="<?= $r['id'] ?>"><?= htmlspecialchars($r['name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="pt-4 flex justify-end gap-2">
                    <button type="button" onclick="document.getElementById('modal-edit').classList.add('hidden')" class="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50">Batal</button>
                    <button type="submit" class="bg-brand text-white px-4 py-2 rounded hover:bg-blue-600">Perbarui</button>
                </div>
            </form>
        </div>
    </div>
<?= $this->endSection() ?>

<?= $this->section('scripts') ?>
<script>
    function editUser(id, fullname, username, roleId) {
        document.getElementById('form-edit').action = '/admin/pegawai/update/' + id;
        document.getElementById('edit-fullname').value = fullname;
        document.getElementById('edit-username').value = username;
        document.getElementById('edit-role').value = roleId;
        document.getElementById('modal-edit').classList.remove('hidden');
    }
</script>
<?= $this->endSection() ?>
