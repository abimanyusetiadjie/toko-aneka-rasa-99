<?php

namespace App\Entities;

use CodeIgniter\Entity\Entity;

class TransactionDetail extends Entity
{
    protected $datamap = [];
    protected $dates   = [];
    protected $casts   = [
        'qty'               => 'integer',
        'conversion_factor' => 'integer',
        'price_per_unit'    => 'float',
        'subtotal'          => 'float',
    ];
}
