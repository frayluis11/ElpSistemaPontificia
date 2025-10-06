#!/usr/bin/env python3
"""
Test específico para verificar autorización
"""
import urllib.request
import json
import urllib.error

def test_me_endpoint():
    # Obtener token
    url = 'http://localhost:8000/auth/login'
    data = {'username': '12345678', 'password': 'admin123'}
    json_data = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=json_data, headers={'Content-Type': 'application/json'})
    
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        token = result['access_token']
        print('✅ Token obtenido exitosamente')
    
    # Probar endpoint /users/me
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    me_url = 'http://localhost:8000/users/me'
    req_me = urllib.request.Request(me_url, headers=headers)
    
    try:
        with urllib.request.urlopen(req_me) as response:
            me_result = json.loads(response.read().decode('utf-8'))
            print('✅ /users/me funciona:')
            print(f'   Usuario: {me_result.get("nombre", "N/A")} {me_result.get("apellido", "N/A")}')
            print(f'   DNI: {me_result.get("dni", "N/A")}')
            print(f'   Email: {me_result.get("correo_institucional", "N/A")}')
    except urllib.error.HTTPError as e:
        print(f'❌ Error en /users/me: {e.code} - {e.read().decode()}')
        
    # Probar endpoint /users/ (listar usuarios)
    list_url = 'http://localhost:8000/users/'
    req_list = urllib.request.Request(list_url, headers=headers)
    
    try:
        with urllib.request.urlopen(req_list) as response:
            list_result = json.loads(response.read().decode('utf-8'))
            print('✅ /users/ funciona:')
            print(f'   Total usuarios: {len(list_result)}')
    except urllib.error.HTTPError as e:
        print(f'❌ Error en /users/: {e.code} - {e.read().decode()}')

if __name__ == '__main__':
    test_me_endpoint()