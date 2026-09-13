<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use CodeIgniter\API\ResponseTrait;
use App\Models\ProductModel;
use App\Models\ProductUnitModel;

class ProductController extends BaseController
{
    use ResponseTrait;

    public function scan()
    {
        $barcode = $this->request->getGet('barcode');
        if (empty($barcode)) {
            return $this->failValidationErrors('Barcode is required');
        }

        $productUnitModel = new ProductUnitModel();
        $productModel = new ProductModel();

        // Cari unit spesifik berdasarkan barcode (misal: scan barcode Dus vs barcode Pcs)
        $unit = $productUnitModel->where('barcode', $barcode)->first();
        if (!$unit) {
            return $this->failNotFound('Produk dengan barcode tersebut tidak ditemukan');
        }

        // Cari data induk produk
        $product = $productModel->find($unit->product_id);
        if (!$product) {
            return $this->failNotFound('Data induk produk rusak atau tidak ditemukan');
        }

        // Ambil semua varian satuan (untuk keperluan pilihan konversi di UI kasir)
        $allUnits = $productUnitModel->where('product_id', $product->id)->findAll();

        $response = [
            'scanned_unit' => $unit,
            'product'      => $product,
            'all_units'    => $allUnits
        ];

        return $this->respond($response, 200);
    }

    public function recommendations()
    {
        $productId = $this->request->getGet('product_id');
        if (empty($productId)) {
            return $this->respond(['recommendations' => []], 200);
        }

        $db = \Config\Database::connect();
        try {
            // Find rules where antecedent contains the product UUID
            $query = $db->query("
                SELECT * FROM ml_association_rules 
                WHERE antecedent_product_ids::text LIKE ?
                ORDER BY lift DESC
                LIMIT 3
            ", ['%' . $productId . '%']);
            
            $rules = $query->getResultArray();
            $recommendations = [];

            foreach ($rules as $rule) {
                $consequents = json_decode($rule['consequent_product_ids'], true);
                if (!empty($consequents)) {
                    $placeholders = implode(',', array_fill(0, count($consequents), '?'));
                    $prodQuery = $db->query("SELECT id, name FROM products WHERE id IN ($placeholders)", $consequents);
                    $consequentProds = $prodQuery->getResultArray();
                    $consequentNames = array_column($consequentProds, 'name');

                    $recommendations[] = [
                        'suggested_products' => implode(', ', $consequentNames),
                        'confidence' => round($rule['confidence'] * 100, 1),
                        'lift' => round($rule['lift'], 2),
                        'message' => "Pelanggan sering membeli " . implode(', ', $consequentNames) . " bersamaan (" . round($rule['confidence'] * 100) . "% kecenderungan)!"
                    ];
                }
            }

            return $this->respond(['recommendations' => $recommendations], 200);
        } catch (\Exception $e) {
            return $this->respond(['recommendations' => []], 200);
        }
    }
}
