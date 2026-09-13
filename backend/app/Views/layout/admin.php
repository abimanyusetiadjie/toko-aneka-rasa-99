<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart POS - <?= $this->renderSection('title') ?? 'Admin Dashboard' ?></title>
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS (CDN for quick setup) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'] },
                    colors: { brand: '#3b82f6' }
                }
            }
        }
    </script>
    
    <!-- Alpine JS for Interactions -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

    <style>
        body { background-color: #f8fafc; }
        .card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); padding: 1.5rem; }
    </style>
    
    <?= $this->renderSection('head_scripts') ?>
</head>
<body class="text-slate-800 antialiased flex h-screen overflow-hidden">

    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div class="p-6 flex items-center gap-3 border-b border-slate-800">
            <div class="bg-brand w-8 h-8 rounded flex items-center justify-center font-bold text-lg">S</div>
            <h1 class="text-xl font-bold tracking-tight">SmartPOS</h1>
        </div>
        <nav class="flex-1 p-4 space-y-1">
            <?php $uri = service('uri')->getSegment(2); ?>
            
            <a href="/admin/dashboard" class="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors <?= ($uri == 'dashboard' || $uri == '') ? 'bg-brand/10 text-brand' : 'text-slate-400 hover:text-white hover:bg-slate-800' ?>">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                Dashboard
            </a>
            <a href="/admin/inventory" class="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors <?= ($uri == 'inventory') ? 'bg-brand/10 text-brand' : 'text-slate-400 hover:text-white hover:bg-slate-800' ?>">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                Inventory
            </a>
            <a href="/admin/pegawai" class="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors <?= ($uri == 'pegawai') ? 'bg-brand/10 text-brand' : 'text-slate-400 hover:text-white hover:bg-slate-800' ?>">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                Pegawai
            </a>
        </nav>
        <div class="p-4 border-t border-slate-800 text-xs text-slate-500">
            Login sebagai: <span class="text-slate-300">Admin Pusat</span>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-y-auto">
        <!-- Header -->
        <header class="bg-white px-8 py-5 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
            <h2 class="text-2xl font-bold text-slate-800"><?= $this->renderSection('header_title') ?? 'Sistem Minimarket' ?></h2>
            
            <?php if(session()->getFlashdata('success')): ?>
                <div class="bg-emerald-100 text-emerald-700 px-4 py-2 rounded shadow-sm text-sm font-medium flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    <?= session()->getFlashdata('success') ?>
                </div>
            <?php endif; ?>
            
            <?php if(session()->getFlashdata('error')): ?>
                <div class="bg-red-100 text-red-700 px-4 py-2 rounded shadow-sm text-sm font-medium flex items-center gap-2">
                    ⚠️ <?= session()->getFlashdata('error') ?>
                </div>
            <?php endif; ?>
            
            <?= $this->renderSection('header_action') ?>
        </header>

        <div class="p-8 space-y-6 max-w-7xl mx-auto w-full">
            <?= $this->renderSection('content') ?>
        </div>
    </main>

    <?= $this->renderSection('scripts') ?>
</body>
</html>
