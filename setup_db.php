<?php
$host = 'aws-0-ap-southeast-1.pooler.supabase.com';
$port = '6543';
$dbname = 'postgres';
$user = 'postgres.zdqrraxsefjvopucyysm';
$pwd = 'minimarket123*';

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=require";
    $pdo = new PDO($dsn, $user, $pwd, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    echo "SUCCESS: Connected to Supabase directly on 5432!\n";
    
    // Execute schema
    $schema = file_get_contents(__DIR__ . '/database/schema.sql');
    $pdo->exec($schema);
    echo "Schema imported successfully.\n";
    
    // Execute seed
    $seed = file_get_contents(__DIR__ . '/database/seed.sql');
    $pdo->exec($seed);
    echo "Data seeded successfully.\n";
    
} catch (PDOException $e) {
    echo "FAILED: " . $e->getMessage() . "\n";
}
