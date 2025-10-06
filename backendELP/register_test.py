#!/usr/bin/env python3
"""
Script para registrar usuario admin usando endpoint del backend
"""
import urllib.request
import json
import urllib.error

def register_admin():
    url = 'http://localhost:8000/auth/register'
    data = {
        'nombre': 'Admin',
        'apellido': 'Sistema',
        'dni': '12345678',
        'correo_institucional': 'admin@pontificia.edu',
        'contraseña': 'admin123',
        'rol_nombre': 'Área TI'
    }
    json_data = json.dumps(data).encode('utf-8')
    
    req = urllib.request.Request(url, data=json_data, headers={'Content-Type': 'application/json'})
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print('✅ Usuario registrado exitosamente')
            print(f'ID: {result["user_id"]}')
            print(f'Nombre: {result["nombre"]} {result["apellido"]}') 
            print(f'Rol: {result["rol"]}')
            return True
    except urllib.error.HTTPError as e:
        error_details = e.read().decode('utf-8')
        print(f'❌ Error HTTP {e.code}: {error_details}')
        return False
    except Exception as e:
        print(f'❌ Error: {e}')
        return False

def test_login():
    url = 'http://localhost:8000/auth/login'
    data = {'username': '12345678', 'password': 'admin123'}
    json_data = json.dumps(data).encode('utf-8')
    
    req = urllib.request.Request(url, data=json_data, headers={'Content-Type': 'application/json'})
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print('✅ LOGIN EXITOSO')
            print(f'Token: {result["access_token"][:50]}...')
            print(f'Usuario: {result["nombre"]} {result["apellido"]}')
            print(f'Rol: {result["rol"]}')
            return result["access_token"]
    except urllib.error.HTTPError as e:
        error_details = e.read().decode('utf-8')
        print(f'❌ Error HTTP {e.code}: {error_details}')
        return None
    except Exception as e:
        print(f'❌ Error: {e}')
        return None

if __name__ == '__main__':
    print('=== CREACIÓN Y PRUEBA DE USUARIO ADMIN ===\n')
    
    print('1. Registrando usuario admin...')
    success = register_admin()
    
    if success:
        print('\n2. Probando login...')
        token = test_login()
        
        if token:
            print('\n✅ SISTEMA DE AUTENTICACIÓN FUNCIONAL')
        else:
            print('\n❌ LOGIN FALLÓ')
    else:
        print('\nVASE DE DATOS POSIBLE REGISTRADO, PROBANDO LOGIN...')
        token = test_login()
        if token:
            print('✅ LOGIN FUNCIONAL CON USUARIO EXISTENTE')
    
    print('\n=== FIN ===')