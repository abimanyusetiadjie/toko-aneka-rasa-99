<?php

namespace App\Models;

use CodeIgniter\Model;

class TransactionDetailModel extends Model
{
    protected $table            = 'transaction_details';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = false; // UUIDs
    protected $returnType       = \App\Entities\TransactionDetail::class;
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'id', 'transaction_id', 'product_id', 'unit_id', 'qty', 
        'conversion_factor', 'price_per_unit', 'subtotal'
    ];

    // Dates
    protected $useTimestamps = false;
}
