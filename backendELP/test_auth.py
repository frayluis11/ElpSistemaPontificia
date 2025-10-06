#!/usr/bin/env python3
"""
Script de prueba para el sistema de autenticación del Backend ELP
"""
import urllib.request
import json
import urllib.error
import sys

def test_login(username, password):
    """Probar login"""
    url = 'http://localhost:8000/auth/login'
    data = {'username': username, 'password': password}
    json_data = json.dumps(data).encode('utf-8')
    
    req = urllib.request.Request(url, data=json_data, headers={'Content-Type': 'application/json'})
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print('✅ LOGIN EXITOSO:')
            print(f'   Token: {result["access_token"][:50]}...')
            print(f'   Usuario: {result["nombre"]} {result["apellido"]}')
            print(f'   Rol: {result["rol"]}')
            print(f'   Expira en: {result["expires_in"]} segundos')
            return result["access_token"]
    except urllib.error.HTTPError as e:
        error_details = e.read().decode('utf-8')
        print(f'❌ Error HTTP {e.code}: {error_details}')
        return None
    except Exception as e:
        print(f'❌ Error: {e}')
        return None

def test_protected_endpoint(token):
    """Probar endpoint protegido"""
    url = 'http://localhost:8000/users/me'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    req = urllib.request.Request(url, headers=headers)
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print('✅ ACCESO A ENDPOINT PROTEGIDO:')
            print(f'   Usuario autenticado: {result.get("nombre", "N/A")} {result.get("apellido", "N/A")}')
            return True
    except urllib.error.HTTPError as e:
        error_details = e.read().decode('utf-8')
        print(f'❌ Error en endpoint protegido HTTP {e.code}: {error_details}')
        return False
    except Exception as e:
        print(f'❌ Error en endpoint protegido: {e}')
        return False

def test_invalid_login():
    """Probar login con credenciales incorrectas"""
    print('\n--- Probando credenciales incorrectas ---')
    token = test_login('12345678', 'wrongpassword')
    if token is None:
        print('✅ Credenciales incorrectas rechazadas correctamente')
    else:
        print('❌ PROBLEMA: Credenciales incorrectas fueron aceptadas')

if __name__ == '__main__':
    print('=== PRUEBAS DE AUTENTICACIÓN BACKEND ELP ===\n')
    
    # Prueba 1: Login válido
    print('--- Probando login válido ---')
    token = test_login('12345678', 'admin123')
    
    if token:
        # Prueba 2: Endpoint protegido
        print('\n--- Probando endpoint protegido ---')
        test_protected_endpoint(token)
    
    # Prueba 3: Login inválido
    test_invalid_login()
    
    print('\n=== FIN DE PRUEBAS ===')