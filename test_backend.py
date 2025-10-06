#!/usr/bin/env python3
"""
Script de prueba para verificar la conectividad con el backend
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    """Probar endpoint de salud"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✅ Health endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
        return False

def test_docs():
    """Probar documentación Swagger"""
    try:
        response = requests.get(f"{BASE_URL}/docs")
        print(f"✅ Docs endpoint: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ Docs endpoint error: {e}")
        return False

def create_default_roles():
    """Crear roles por defecto del sistema"""
    try:
        response = requests.post(f"{BASE_URL}/auth/create-default-roles")
        print(f"✅ Create roles endpoint: {response.status_code}")
        if response.status_code in [200, 201]:
            print(f"   Roles created: {response.json()}")
        else:
            print(f"   Response: {response.text}")
        return True
    except Exception as e:
        print(f"❌ Create roles error: {e}")
        return False

def test_auth_register():
    """Probar registro de usuario de prueba"""
    try:
        test_user = {
            "nombre": "Administrador",
            "apellido": "Sistema",
            "dni": "12345678",
            "correo_institucional": "admin@pontificia.edu",
            "contraseña": "admin123456",
            "rol_nombre": "Administración"
        }
        
        response = requests.post(f"{BASE_URL}/auth/register", json=test_user)
        print(f"✅ Register endpoint: {response.status_code}")
        if response.status_code in [200, 201]:
            print(f"   User created: {response.json()}")
        else:
            print(f"   Response: {response.text}")
        return True
    except Exception as e:
        print(f"❌ Register endpoint error: {e}")
        return False

def test_auth_login():
    """Probar login con usuario de prueba"""
    try:
        credentials = {
            "username": "12345678",  # DNI
            "password": "admin123456"
        }
        
        response = requests.post(f"{BASE_URL}/auth/login", json=credentials)
        print(f"✅ Login endpoint: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Access token: {data.get('access_token', 'N/A')[:20]}...")
            return data.get('access_token')
        else:
            print(f"   Response: {response.text}")
        return None
    except Exception as e:
        print(f"❌ Login endpoint error: {e}")
        return None

if __name__ == "__main__":
    print("🚀 Probando conectividad con backend...")
    print(f"📍 Base URL: {BASE_URL}")
    print("=" * 50)
    
    # Probar endpoints básicos
    test_health()
    test_docs()
    
    # Crear roles por defecto
    create_default_roles()
    
    # Probar autenticación
    test_auth_register()
    token = test_auth_login()
    
    if token:
        print("\n✅ Backend está funcionando correctamente!")
        print("🔐 Autenticación exitosa")
    else:
        print("\n⚠️ Backend funcionando pero hay problemas con autenticación")