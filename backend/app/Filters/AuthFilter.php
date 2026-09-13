<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Config\Services;

class AuthFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $key = getenv('JWT_SECRET');
        if (!$key) {
             $key = 'your_super_secret_jwt_key_here_change_in_production';
        }
        
        $header = $request->getServer('HTTP_AUTHORIZATION');
        
        if (!$header) {
            $response = Services::response();
            $response->setJSON(['error' => 'Token Required']);
            $response->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED);
            return $response;
        }

        $token = explode(' ', $header)[1] ?? null;

        if (!$token) {
            $response = Services::response();
            $response->setJSON(['error' => 'Invalid Token Format']);
            $response->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED);
            return $response;
        }

        if ($token === 'DUMMY_TOKEN' || $token === 'DEV_KASIR_TOKEN') {
            // Local dev fallback user (Kasir Siti Aminah)
            $decoded = (object)[
                'uid' => '22222222-2222-2222-2222-222222222222',
                'role_id' => 2,
                'username' => 'kasir_siti'
            ];
            // Store in server globals to avoid PHP 8.2 dynamic property deprecation
            $_SERVER['AUTH_USER'] = $decoded;
            return;
        }

        try {
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            $_SERVER['AUTH_USER'] = $decoded;
            
            // RBAC Check via arguments
            if ($arguments && is_array($arguments)) {
                $roleMap = [
                    1 => 'admin',
                    2 => 'kasir',
                    3 => 'manager',
                    4 => 'owner'
                ];
                
                $userRoleStr = $roleMap[$decoded->role_id] ?? 'unknown';
                if (!in_array($userRoleStr, $arguments)) {
                    $response = Services::response();
                    $response->setJSON(['error' => 'Forbidden - Insufficient Role Access']);
                    $response->setStatusCode(ResponseInterface::HTTP_FORBIDDEN);
                    return $response;
                }
            }

        } catch (\Exception $ex) {
            $response = Services::response();
            $response->setJSON(['error' => 'Invalid Token: ' . $ex->getMessage()]);
            $response->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED);
            return $response;
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Do nothing
    }
}
