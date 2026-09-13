<?php

namespace App\Controllers;

use CodeIgniter\Controller;
use CodeIgniter\Database\Exceptions\DatabaseException;

class AdminController extends Controller
{
    public function dashboard()
    {
        $db = \Config\Database::connect();
        $data = [
            'peak_hours' => [],
            'gpm_data' => [],
            'avg_basket_size' => 0,
            'ml_rules' => []
        ];

        try {
            // 1. Peak Hours (Heatmap / Bar data)
            // Agregasi jumlah transaksi berdasarkan hari dan jam
            $peakQuery = $db->query("
                SELECT 
                    EXTRACT(DOW FROM created_at) as day_of_week,
                    EXTRACT(HOUR FROM created_at) as hour_of_day,
                    COUNT(id) as total_tx
                FROM transactions
                WHERE status = 'COMPLETED'
                GROUP BY day_of_week, hour_of_day
                ORDER BY day_of_week, hour_of_day
            ");
            $peakResults = $peakQuery->getResultArray();

            // 2. Gross Profit Margin per Category
            // GPM = (Revenue - COGS) / Revenue
            $gpmQuery = $db->query("
                SELECT 
                    c.name as category_name,
                    SUM(td.subtotal) as revenue,
                    SUM(td.qty * td.base_hpp) as cogs
                FROM transaction_details td
                JOIN products p ON td.product_id = p.id
                JOIN categories c ON p.category_id = c.id
                JOIN transactions t ON td.transaction_id = t.id
                WHERE t.status = 'COMPLETED'
                GROUP BY c.name
            ");
            $gpmResults = $gpmQuery->getResultArray();

            // 3. Average Basket Size
            $basketQuery = $db->query("
                SELECT 
                    COALESCE(SUM(total_amount), 0) as total_revenue,
                    COUNT(id) as total_transactions
                FROM transactions
                WHERE status = 'COMPLETED'
            ");
            $basketResult = $basketQuery->getRowArray();

            // 4. ML Rules
            $rulesQuery = $db->query("
                SELECT * FROM ml_association_rules
                ORDER BY lift DESC
                LIMIT 5
            ");
            $mlRules = $rulesQuery->getResultArray();

            // --- PROCESS RESULTS ---
            
            // Format Peak Hours for ApexCharts Heatmap (Series by Day, Categories by Hour)
            if (!empty($peakResults)) {
                $data['peak_hours'] = $this->formatPeakHours($peakResults);
            } else {
                $data['peak_hours'] = $this->getMockPeakHours();
            }

            // Format GPM
            if (!empty($gpmResults)) {
                $categories = [];
                $margins = [];
                foreach ($gpmResults as $row) {
                    $categories[] = $row['category_name'];
                    $margin = 0;
                    if ($row['revenue'] > 0) {
                        $margin = (($row['revenue'] - $row['cogs']) / $row['revenue']) * 100;
                    }
                    $margins[] = round($margin, 2);
                }
                $data['gpm_data'] = [
                    'categories' => $categories,
                    'margins' => $margins
                ];
            } else {
                $data['gpm_data'] = [
                    'categories' => ['Makanan Ringan', 'Minuman', 'Sembako', 'Kebutuhan Mandi'],
                    'margins' => [25.5, 30.2, 12.0, 20.8] // Mock data
                ];
            }

            // Format Basket Size & Totals
            if ($basketResult && $basketResult['total_transactions'] > 0) {
                $data['total_transactions'] = (int)$basketResult['total_transactions'];
                $data['total_revenue'] = (float)$basketResult['total_revenue'];
                $data['avg_basket_size'] = round($basketResult['total_revenue'] / $basketResult['total_transactions']);
            } else {
                $data['total_transactions'] = 0;
                $data['total_revenue'] = 0;
                $data['avg_basket_size'] = 0;
            }

            // Format ML Rules
            if (!empty($mlRules)) {
                $formattedRules = [];
                foreach ($mlRules as $rule) {
                    // Fetch product names from IDs stored in JSON arrays
                    $antecedents = json_decode($rule['antecedent_product_ids'], true);
                    $consequents = json_decode($rule['consequent_product_ids'], true);
                    
                    $antNames = $this->getProductNames($db, $antecedents);
                    $conNames = $this->getProductNames($db, $consequents);
                    
                    $formattedRules[] = [
                        'antecedents' => implode(', ', $antNames),
                        'consequents' => implode(', ', $conNames),
                        'confidence' => round($rule['confidence'] * 100, 1),
                        'lift' => round($rule['lift'], 2)
                    ];
                }
                $data['ml_rules'] = $formattedRules;
            } else {
                $data['ml_rules'] = [];
            }

        } catch (DatabaseException $e) {
            $data['peak_hours'] = $this->getMockPeakHours();
            $data['gpm_data'] = [
                'categories' => ['Makanan Ringan', 'Minuman', 'Sembako', 'Kebutuhan Mandi'],
                'margins' => [25.5, 30.2, 12.0, 20.8]
            ];
            $data['total_transactions'] = 0;
            $data['total_revenue'] = 0;
            $data['avg_basket_size'] = 0;
            $data['ml_rules'] = [];
            $data['db_error'] = "Koneksi database bermasalah: " . $e->getMessage();
        }

        return view('admin/dashboard', $data);
    }

    private function getProductNames($db, $ids)
    {
        if (empty($ids)) return [];
        
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $query = $db->query("SELECT name FROM products WHERE id IN ($placeholders)", $ids);
        $results = $query->getResultArray();
        
        return array_column($results, 'name');
    }

    private function formatPeakHours($dbResults)
    {
        $daysMap = [0 => 'Minggu', 1 => 'Senin', 2 => 'Selasa', 3 => 'Rabu', 4 => 'Kamis', 5 => 'Jumat', 6 => 'Sabtu'];
        
        // Initialize 7 days with 24 hours of 0
        $matrix = [];
        foreach ($daysMap as $dayNum => $dayName) {
            $matrix[$dayNum] = [
                'name' => $dayName,
                'data' => array_fill(0, 24, 0)
            ];
        }

        foreach ($dbResults as $row) {
            $day = (int)$row['day_of_week'];
            $hour = (int)$row['hour_of_day'];
            $matrix[$day]['data'][$hour] = (int)$row['total_tx'];
        }

        // Return just the values, reformatted for apexcharts
        $series = [];
        foreach ($matrix as $dayData) {
            $dataPoints = [];
            foreach ($dayData['data'] as $hour => $val) {
                // Formatting hour label
                $dataPoints[] = [
                    'x' => sprintf('%02d:00', $hour),
                    'y' => $val
                ];
            }
            $series[] = [
                'name' => $dayData['name'],
                'data' => $dataPoints
            ];
        }
        return $series;
    }

    private function getMockPeakHours()
    {
        $series = [];
        $daysMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        foreach ($daysMap as $dayName) {
            $dataPoints = [];
            for ($h = 0; $h < 24; $h++) {
                // Mock more traffic during daytime (8-20)
                $val = ($h >= 8 && $h <= 20) ? rand(10, 50) : rand(0, 5);
                $dataPoints[] = [
                    'x' => sprintf('%02d:00', $h),
                    'y' => $val
                ];
            }
            $series[] = [
                'name' => $dayName,
                'data' => $dataPoints
            ];
        }
        return $series;
    }

    // ==========================================
    // ML SYNC ACTION
    // ==========================================
    public function syncMl()
    {
        $client = \Config\Services::curlrequest();
        try {
            $response = $client->post('http://localhost:8000/api/v1/ml/market-basket-analysis', [
                'timeout' => 10,
                'http_errors' => false
            ]);
            $result = json_decode($response->getBody(), true);
            if ($response->getStatusCode() == 200 && ($result['status'] ?? '') === 'success') {
                return redirect()->to('/admin/dashboard')->with('success', $result['message'] ?? 'Sinkronisasi ML Berhasil!');
            } else {
                return redirect()->to('/admin/dashboard')->with('error', 'Gagal memicu ML Engine: ' . ($result['detail'] ?? $response->getReason()));
            }
        } catch (\Exception $e) {
            return redirect()->to('/admin/dashboard')->with('error', 'Koneksi ke ML Engine gagal: ' . $e->getMessage());
        }
    }

    // ==========================================
    // INVENTORY CRUD
    // ==========================================
    public function inventory()
    {
        $db = \Config\Database::connect();
        
        // Fetch all products with their categories and base unit details (barcode, selling price)
        $query = $db->query("
            SELECT p.*, c.name as category_name, pu.price as selling_price, pu.barcode, pu.unit_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_units pu ON p.id = pu.product_id AND pu.conversion_factor = 1
            ORDER BY p.name ASC
        ");
        $products = $query->getResultArray();
        
        $categoriesQuery = $db->query("SELECT * FROM categories ORDER BY name ASC");
        $categories = $categoriesQuery->getResultArray();
        
        return view('admin/inventory', [
            'products' => $products,
            'categories' => $categories
        ]);
    }

    public function storeInventory()
    {
        $db = \Config\Database::connect();
        $name = trim($this->request->getPost('name'));
        $categoryId = (int)$this->request->getPost('category_id');
        $baseHpp = (float)$this->request->getPost('base_hpp');
        $stock = (int)$this->request->getPost('stock');
        $sellingPrice = (float)$this->request->getPost('selling_price');
        $barcode = trim($this->request->getPost('barcode'));
        $sku = trim($this->request->getPost('sku'));
        
        if (empty($sku)) {
            $sku = 'SKU-' . strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $name), 0, 3)) . '-' . rand(100, 999);
        }
        if (empty($barcode)) {
            $barcode = '899' . rand(10000000, 99999999);
        }
        if ($sellingPrice <= 0) {
            $sellingPrice = round($baseHpp * 1.25); // Default 25% margin if unset
        }
        
        $productId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x', mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000, mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff));
        $unitId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x', mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000, mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff));
        
        $db->table('products')->insert([
            'id' => $productId,
            'sku' => $sku,
            'name' => $name,
            'category_id' => $categoryId,
            'base_unit' => 'Pcs',
            'base_hpp' => $baseHpp,
            'stock' => $stock
        ]);
        
        $db->table('product_units')->insert([
            'id' => $unitId,
            'product_id' => $productId,
            'unit_name' => 'Pcs',
            'conversion_factor' => 1,
            'price' => $sellingPrice,
            'barcode' => $barcode
        ]);
        
        return redirect()->to('/admin/inventory')->with('success', "Produk '$name' & Barcode '$barcode' berhasil ditambahkan");
    }

    public function updateInventory($id)
    {
        $db = \Config\Database::connect();
        $name = trim($this->request->getPost('name'));
        $categoryId = (int)$this->request->getPost('category_id');
        $baseHpp = (float)$this->request->getPost('base_hpp');
        $stock = (int)$this->request->getPost('stock');
        $sellingPrice = (float)$this->request->getPost('selling_price');
        $barcode = trim($this->request->getPost('barcode'));
        $sku = trim($this->request->getPost('sku'));
        
        $updateProduct = [
            'name' => $name,
            'category_id' => $categoryId,
            'base_hpp' => $baseHpp,
            'stock' => $stock
        ];
        if (!empty($sku)) {
            $updateProduct['sku'] = $sku;
        }
        
        $db->table('products')->where('id', $id)->update($updateProduct);
        
        // Update product_units for base unit (conversion_factor = 1)
        $existingUnit = $db->table('product_units')->where('product_id', $id)->where('conversion_factor', 1)->get()->getRowArray();
        if ($existingUnit) {
            $unitUpdate = ['price' => $sellingPrice];
            if (!empty($barcode)) {
                $unitUpdate['barcode'] = $barcode;
            }
            $db->table('product_units')->where('id', $existingUnit['id'])->update($unitUpdate);
        } else {
            $unitId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x', mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000, mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff));
            $db->table('product_units')->insert([
                'id' => $unitId,
                'product_id' => $id,
                'unit_name' => 'Pcs',
                'conversion_factor' => 1,
                'price' => $sellingPrice,
                'barcode' => $barcode ?: ('899' . rand(10000000, 99999999))
            ]);
        }
        
        return redirect()->to('/admin/inventory')->with('success', 'Data produk & satuan berhasil diperbarui');
    }

    public function deleteInventory($id)
    {
        $db = \Config\Database::connect();
        $db->table('products')->where('id', $id)->delete();
        return redirect()->to('/admin/inventory')->with('success', 'Produk berhasil dihapus');
    }

    // ==========================================
    // PEGAWAI CRUD
    // ==========================================
    public function pegawai()
    {
        $db = \Config\Database::connect();
        
        // Fetch all users with their roles
        $query = $db->query("
            SELECT u.*, r.name as role_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            ORDER BY u.created_at DESC
        ");
        $users = $query->getResultArray();
        
        $rolesQuery = $db->query("SELECT * FROM roles ORDER BY id ASC");
        $roles = $rolesQuery->getResultArray();
        
        return view('admin/pegawai', [
            'users' => $users,
            'roles' => $roles
        ]);
    }

    public function storePegawai()
    {
        $db = \Config\Database::connect();
        $username = $this->request->getPost('username');
        $password = password_hash($this->request->getPost('password'), PASSWORD_BCRYPT);
        $roleId = $this->request->getPost('role_id');
        $fullName = $this->request->getPost('full_name');
        
        $userId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x', mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000, mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff));
        
        $db->table('users')->insert([
            'id' => $userId,
            'username' => $username,
            'password_hash' => $password,
            'role_id' => $roleId,
            'full_name' => $fullName
        ]);
        
        return redirect()->to('/admin/pegawai')->with('success', 'Pegawai berhasil ditambahkan');
    }

    public function updatePegawai($id)
    {
        $db = \Config\Database::connect();
        $username = $this->request->getPost('username');
        $roleId = $this->request->getPost('role_id');
        $fullName = $this->request->getPost('full_name');
        
        $updateData = [
            'username' => $username,
            'role_id' => $roleId,
            'full_name' => $fullName
        ];
        
        if ($this->request->getPost('password')) {
            $updateData['password_hash'] = password_hash($this->request->getPost('password'), PASSWORD_BCRYPT);
        }
        
        $db->table('users')->where('id', $id)->update($updateData);
        
        return redirect()->to('/admin/pegawai')->with('success', 'Data pegawai berhasil diperbarui');
    }

    public function deletePegawai($id)
    {
        $db = \Config\Database::connect();
        $db->table('users')->where('id', $id)->delete();
        return redirect()->to('/admin/pegawai')->with('success', 'Pegawai berhasil dihapus');
    }
}
