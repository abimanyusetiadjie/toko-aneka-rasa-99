<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use CodeIgniter\API\ResponseTrait;
use App\Models\TransactionModel;
use App\Models\TransactionDetailModel;
use App\Models\ProductModel;
use App\Models\ProductUnitModel;

class TransactionController extends BaseController
{
    use ResponseTrait;

    private function generateUuid() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    public function create()
    {
        $json = $this->request->getJSON();
        if (!$json) {
            return $this->failValidationErrors('Invalid JSON payload');
        }

        $db = \Config\Database::connect();
        
        // Aktifkan pelemparan Exception untuk transRollback otomatis saat ada error
        $db->transException(true); 
        $db->transBegin();

        try {
            $transactionModel = new TransactionModel();
            $transactionDetailModel = new TransactionDetailModel();
            $productModel = new ProductModel();
            $productUnitModel = new ProductUnitModel();

            $transactionId = $this->generateUuid();
            
            // Ambil UID dari JWT Payload yang telah disuntikkan oleh AuthFilter
            $userId = $_SERVER['AUTH_USER']->uid ?? ($this->request->user->uid ?? ($json->user_id ?? '22222222-2222-2222-2222-222222222222'));
            if (!$userId) {
                throw new \Exception("User ID is missing from authorization context");
            }
            
            $transactionData = [
                'id' => $transactionId,
                'user_id' => $userId,
                'member_id' => $json->member_id ?? null,
                'receipt_number' => 'RCPT-' . date('YmdHis') . '-' . rand(1000, 9999),
                'total_amount' => $json->total_amount,
                'payment_method' => $json->payment_method ?? 'CASH',
                'payment_reference' => $json->payment_reference ?? null,
                'status' => 'COMPLETED'
            ];

            // Validasi Aturan 2: Pembayaran
            if ($transactionData['payment_method'] === 'CASH') {
                $amountPaid = $json->amount_paid ?? 0;
                if ($amountPaid < $transactionData['total_amount']) {
                    throw new \Exception("Pembayaran tunai kurang dari total belanja.");
                }
            } else {
                if (empty($json->payment_reference)) {
                    throw new \Exception("Nomor referensi pembayaran wajib dicatat untuk pembayaran non-tunai.");
                }
            }

            // Insert Data Transaksi Header
            $transactionModel->insert($transactionData);

            if (empty($json->items) || !is_array($json->items)) {
                throw new \Exception("Transaction items are empty");
            }

            // Insert Detail Transaksi & Proses Logika Konversi Satuan
            foreach ($json->items as $item) {
                $unit = $productUnitModel->find($item->unit_id);
                if (!$unit) {
                    throw new \Exception("Product unit not found: " . $item->unit_id);
                }
                
                $product = $productModel->find($unit->product_id);
                if (!$product) {
                    throw new \Exception("Product not found for unit: " . $item->unit_id);
                }

                // Kalkulasi konversi satuan (qty aktual * faktor konversi)
                $convertedQty = $item->qty * $unit->conversion_factor;
                
                // Validasi Stok Minimum PHP level (Sebelum trigger database melempar error)
                if ($product->stock < $convertedQty) {
                    throw new \Exception("Stok tidak mencukupi untuk produk: " . $product->name);
                }

                // Kalkulasi HPP terkonversi berdasarkan unit dasar
                // Aturan 1: HPP Satuan Besar = HPP Satuan Dasar x Faktor Konversi
                $hppTerkonversi = $product->base_hpp * $unit->conversion_factor;

                $detailId = $this->generateUuid();
                $detailData = [
                    'id' => $detailId,
                    'transaction_id' => $transactionId,
                    'product_id' => $product->id,
                    'unit_id' => $unit->id,
                    'qty' => $item->qty,
                    'conversion_factor' => $unit->conversion_factor,
                    'price_per_unit' => $unit->price,
                    'subtotal' => $item->qty * $unit->price
                ];

                // Memasukkan detail transaksi
                // Catatan: Proses ini akan secara otomatis memicu Trigger SQL `update_product_stock_after_sale()`
                // pada Supabase untuk memotong `$product->stock`.
                $transactionDetailModel->insert($detailData);
            }

            // Komit transaksi
            $db->transCommit();

            return $this->respondCreated([
                'message' => 'Transaction successful',
                'transaction_id' => $transactionId,
                'receipt_number' => $transactionData['receipt_number']
            ]);

        } catch (\Exception $e) {
            // Rollback seketika (< 1 detik sesuai Rule 2) mengembalikan semua stok jika terjadi error
            $db->transRollback();
            return $this->failServerError('Transaction Failed/Rollbacked: ' . $e->getMessage());
        }
    }
}
