<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'Home::index');

// API Routes
$routes->group('api', function($routes) {
    // Auth endpoints
    $routes->post('login', 'AuthController::login');
    
    // Protected POS endpoints (requires Kasir, Manager, or Owner)
    $routes->group('pos', ['filter' => 'auth:kasir,manager,owner'], function($routes) {
        $routes->get('products/scan', '\App\Controllers\Api\ProductController::scan');
        $routes->get('recommendations', '\App\Controllers\Api\ProductController::recommendations');
        $routes->post('transactions', '\App\Controllers\Api\TransactionController::create');
    });

    // Protected Admin/CMS endpoints (requires Manager or Owner)
    $routes->group('admin', ['filter' => 'auth:manager,owner'], function($routes) {
        // API versions of admin tools could go here
    });
});

// Web Routes for Admin Dashboard (SSR view)
$routes->get('admin/dashboard', 'AdminController::dashboard');
$routes->post('admin/sync-ml', 'AdminController::syncMl');

// Inventory Web Routes
$routes->get('admin/inventory', 'AdminController::inventory');
$routes->post('admin/inventory/store', 'AdminController::storeInventory');
$routes->post('admin/inventory/update/(:any)', 'AdminController::updateInventory/$1');
$routes->get('admin/inventory/delete/(:any)', 'AdminController::deleteInventory/$1');

// Pegawai Web Routes
$routes->get('admin/pegawai', 'AdminController::pegawai');
$routes->post('admin/pegawai/store', 'AdminController::storePegawai');
$routes->post('admin/pegawai/update/(:any)', 'AdminController::updatePegawai/$1');
$routes->get('admin/pegawai/delete/(:any)', 'AdminController::deletePegawai/$1');
