<?php

namespace App\Entities;

use CodeIgniter\Entity\Entity;

class Product extends Entity
{
    protected $datamap = [];
    protected $dates   = ['created_at', 'updated_at'];
    protected $casts   = [
        'category_id' => 'integer',
        'stock'       => 'integer',
        'base_hpp'    => 'float',
    ];
}
