<?php

namespace App\Entities;

use CodeIgniter\Entity\Entity;

class ProductUnit extends Entity
{
    protected $datamap = [];
    protected $dates   = ['created_at'];
    protected $casts   = [
        'conversion_factor' => 'integer',
        'price'             => 'float',
    ];
}
