<?php

namespace App\Models;

use CodeIgniter\Model;

class ProductUnitModel extends Model
{
    protected $table            = 'product_units';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = false; // UUIDs
    protected $returnType       = \App\Entities\ProductUnit::class;
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'id', 'product_id', 'unit_name', 'conversion_factor', 'price', 'barcode'
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = ''; // No updated_at in schema
}
