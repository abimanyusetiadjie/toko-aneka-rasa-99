<?= $this->extend('layout/admin') ?>

<?= $this->section('title') ?>BI Dashboard<?= $this->endSection() ?>

<?= $this->section('header_title') ?>Business Intelligence<?= $this->endSection() ?>

<?= $this->section('head_scripts') ?>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
<?= $this->endSection() ?>

<?= $this->section('header_action') ?>
    <?php if(isset($db_error)): ?>
        <div class="bg-amber-100 text-amber-700 px-3 py-1 rounded text-sm font-medium">
            ⚠️ Mode Simulasi (DB Kosong)
        </div>
    <?php endif; ?>
<?= $this->endSection() ?>

<?= $this->section('content') ?>
    <!-- Top Metrics Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card bg-gradient-to-br from-brand to-blue-700 text-white border-0">
            <h3 class="text-blue-100 text-sm font-medium mb-1">Average Basket Size</h3>
            <div class="text-3xl font-bold tracking-tight mb-2">Rp <?= number_format($avg_basket_size, 0, ',', '.') ?></div>
            <p class="text-xs text-blue-200">+12% dari bulan lalu</p>
        </div>
        
        <div class="card">
            <h3 class="text-slate-500 text-sm font-medium mb-1">Total Transaksi</h3>
            <div class="text-3xl font-bold tracking-tight text-slate-800 mb-2">
                <?= number_format($total_transactions ?? 0, 0, ',', '.') ?>
            </div>
            <p class="text-xs text-slate-400 font-medium">Data Transaksi Riil</p>
        </div>

        <div class="card">
            <h3 class="text-slate-500 text-sm font-medium mb-1">Rata-rata Margin Kasar</h3>
            <div class="text-3xl font-bold tracking-tight text-slate-800 mb-2">
                <?= !empty($gpm_data['margins']) ? round(array_sum($gpm_data['margins'])/count($gpm_data['margins']), 1) : 0 ?>%
            </div>
            <p class="text-xs text-slate-400">Keseluruhan Kategori</p>
        </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Heatmap: Peak Hours -->
        <div class="card">
            <div class="flex justify-between items-end mb-4">
                <div>
                    <h3 class="text-lg font-bold text-slate-800">Jam Sibuk Toko (Peak Hours)</h3>
                    <p class="text-sm text-slate-500">Intensitas transaksi berdasarkan hari & jam</p>
                </div>
            </div>
            <div id="heatmapChart" class="-ml-2"></div>
        </div>

        <!-- Bar/Line: GPM per Category -->
        <div class="card">
            <div class="flex justify-between items-end mb-4">
                <div>
                    <h3 class="text-lg font-bold text-slate-800">Gross Profit Margin (GPM)</h3>
                    <p class="text-sm text-slate-500">Margin keuntungan berdasarkan kategori produk</p>
                </div>
            </div>
            <div id="gpmChart" class="-ml-2"></div>
        </div>
    </div>

    <!-- ML Recommendations Row -->
    <div class="card">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    Rekomendasi Cerdas (ML FP-Growth)
                </h3>
                <p class="text-sm text-slate-500">Aturan asosiasi produk otomatis untuk Bundling Promo / Penataan Rak</p>
            </div>
            <form action="/admin/sync-ml" method="POST">
                <button type="submit" class="bg-purple-50 hover:bg-purple-100 text-purple-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-purple-200 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Jalankan Sinkronisasi ML
                </button>
            </form>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead>
                    <tr class="text-slate-500 border-b border-slate-200">
                        <th class="pb-3 font-medium">Jika Pelanggan Membeli...</th>
                        <th class="pb-3 font-medium">Maka Rekomendasikan...</th>
                        <th class="pb-3 font-medium text-right">Confidence</th>
                        <th class="pb-3 font-medium text-right">Lift Ratio</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php if(!empty($ml_rules)): ?>
                        <?php foreach($ml_rules as $rule): ?>
                        <tr class="hover:bg-slate-50">
                            <td class="py-3 font-medium text-slate-700"><?= htmlspecialchars($rule['antecedents']) ?></td>
                            <td class="py-3 font-medium text-brand"><?= htmlspecialchars($rule['consequents']) ?></td>
                            <td class="py-3 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <div class="w-16 bg-slate-200 rounded-full h-1.5"><div class="bg-emerald-500 h-1.5 rounded-full" style="width: <?= $rule['confidence'] ?>%"></div></div>
                                    <span class="text-xs font-semibold"><?= $rule['confidence'] ?>%</span>
                                </div>
                            </td>
                            <td class="py-3 text-right">
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    <?= $rule['lift'] ?>x
                                </span>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="4" class="py-8 text-center text-slate-500">
                                Belum ada aturan ML tersimpan. Silakan klik tombol <b>Jalankan Sinkronisasi ML</b> di atas untuk menghitung data transaksi.
                            </td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
<?= $this->endSection() ?>

<?= $this->section('scripts') ?>
    <script>
        const peakHoursData = <?= json_encode($peak_hours) ?>;
        const gpmData = <?= json_encode($gpm_data) ?>;
        
        // 1. Heatmap: Peak Hours
        const heatmapOptions = {
            series: peakHoursData,
            chart: {
                height: 350,
                type: 'heatmap',
                toolbar: { show: false },
                fontFamily: 'Inter, sans-serif'
            },
            dataLabels: { enabled: false },
            colors: ['#3b82f6'],
            xaxis: {
                labels: { style: { colors: '#64748b' } },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                labels: { style: { colors: '#64748b' } }
            },
            plotOptions: {
                heatmap: {
                    shadeIntensity: 0.5,
                    radius: 4,
                    useFillColorAsStroke: false,
                    colorScale: {
                        ranges: [{ from: 0, to: 5, color: '#f1f5f9', name: 'Sepi' },
                                 { from: 6, to: 20, color: '#93c5fd', name: 'Normal' },
                                 { from: 21, to: 100, color: '#2563eb', name: 'Sibuk' }]
                    }
                }
            }
        };
        new ApexCharts(document.querySelector("#heatmapChart"), heatmapOptions).render();

        // 2. Bar Chart: GPM per Category
        const gpmOptions = {
            series: [{
                name: 'Margin (%)',
                data: gpmData.margins
            }],
            chart: {
                type: 'bar',
                height: 350,
                toolbar: { show: false },
                fontFamily: 'Inter, sans-serif'
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    horizontal: false,
                    columnWidth: '45%',
                    distributed: true
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function (val) { return val + "%"; },
                style: { fontSize: '12px', colors: ["#fff"] }
            },
            colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
            xaxis: {
                categories: gpmData.categories,
                labels: { style: { colors: '#64748b' } },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                labels: { style: { colors: '#64748b' } }
            },
            legend: { show: false }
        };
        new ApexCharts(document.querySelector("#gpmChart"), gpmOptions).render();
    </script>
<?= $this->endSection() ?>
