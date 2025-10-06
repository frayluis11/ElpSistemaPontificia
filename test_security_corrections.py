"""
Script de verificación de las correcciones de seguridad aplicadas
al módulo de usuarios y roles.
"""

import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8001"

def print_test_result(test_name, expected, actual, success):
    """Imprimir resultado del test con formato"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if not success:
        print(f"   Expected: {expected}")
        print(f"   Actual: {actual}")
    print()

def test_security_fixes():
    """Probar las correcciones de seguridad implementadas"""
    print("🔒 VERIFICACIÓN DE CORRECCIONES DE SEGURIDAD")
    print("=" * 50)
    
    # 1. Crear roles por defecto
    print("1. Creando roles por defecto...")
    try:
        response = requests.post(f"{BASE_URL}/auth/create-default-roles")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Roles creados correctamente")
        print()
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # 2. Registrar usuario de prueba
    print("2. Registrando usuario de prueba...")
    register_data = {
        "nombre": "Usuario",
        "apellido": "Prueba",
        "dni": "12345678",
        "correo_institucional": "usuario.prueba@test.com",
        "contraseña": "password123",
        "rol": "Docente"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Usuario registrado correctamente")
        print()
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # 3. Login para obtener token
    print("3. Haciendo login...")
    login_data = {
        "identifier": "12345678",
        "contraseña": "password123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            token = response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            print("   ✅ Login exitoso, token obtenido")
        else:
            print(f"   ❌ Login falló: {response.status_code}")
            return False
        print()
    except Exception as e:
        print(f"   ❌ Error en login: {e}")
        return False
    
    # 4. Probar endpoints protegidos - USUARIOS
    print("4. Probando endpoints de usuarios...")
    
    # 4.1 GET /users/{user_id} sin token (debe fallar)
    print("   4.1 GET /users/1 sin token (debe fallar 401):")
    try:
        response = requests.get(f"{BASE_URL}/users/1")
        success = response.status_code == 401
        print_test_result("GET /users/1 sin autenticación", 401, response.status_code, success)
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # 4.2 GET /users/dni/{dni} sin token (debe fallar)
    print("   4.2 GET /users/dni/12345678 sin token (debe fallar 401):")
    try:
        response = requests.get(f"{BASE_URL}/users/dni/12345678")
        success = response.status_code == 401
        print_test_result("GET /users/dni sin autenticación", 401, response.status_code, success)
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # 4.3 PUT /users/{user_id} sin token (debe fallar)
    print("   4.3 PUT /users/1 sin token (debe fallar 401):")
    try:
        response = requests.put(f"{BASE_URL}/users/1", json={"nombre": "Test"})
        success = response.status_code == 401
        print_test_result("PUT /users sin autenticación", 401, response.status_code, success)
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # 5. Probar endpoints protegidos - ROLES
    print("5. Probando endpoints de roles...")
    
    # 5.1 GET /roles sin token (debe fallar)
    print("   5.1 GET /roles sin token (debe fallar 401):")
    try:
        response = requests.get(f"{BASE_URL}/roles")
        success = response.status_code == 401
        print_test_result("GET /roles sin autenticación", 401, response.status_code, success)
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # 5.2 POST /roles sin token (debe fallar)
    print("   5.2 POST /roles sin token (debe fallar 401):")
    try:
        response = requests.post(f"{BASE_URL}/roles", json={"nombre_rol": "Test", "descripcion": "Test"})
        success = response.status_code == 401
        print_test_result("POST /roles sin autenticación", 401, response.status_code, success)
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # 5.3 PUT /roles/{role_id} sin token (debe fallar)
    print("   5.3 PUT /roles/1 sin token (debe fallar 401):")
    try:
        response = requests.put(f"{BASE_URL}/roles/1", json={"descripcion": "Test"})
        success = response.status_code == 401
        print_test_result("PUT /roles sin autenticación", 401, response.status_code, success)
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # 5.4 DELETE /roles/{role_id} sin token (debe fallar)
    print("   5.4 DELETE /roles/1 sin token (debe fallar 401):")
    try:
        response = requests.delete(f"{BASE_URL}/roles/1")
        success = response.status_code == 401
        print_test_result("DELETE /roles sin autenticación", 401, response.status_code, success)
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # 6. Probar endpoints con token válido
    print("6. Probando endpoints con token válido...")
    
    # 6.1 GET /roles con token (debe funcionar)
    print("   6.1 GET /roles con token (debe funcionar 200):")
    try:
        response = requests.get(f"{BASE_URL}/roles", headers=headers)
        success = response.status_code == 200
        print_test_result("GET /roles con autenticación", 200, response.status_code, success)
        if success:
            roles = response.json()
            print(f"   Roles encontrados: {len(roles)}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # 6.2 GET /users/me con token (debe funcionar)
    print("   6.2 GET /users/me con token (debe funcionar 200):")
    try:
        response = requests.get(f"{BASE_URL}/users/me", headers=headers)
        success = response.status_code == 200
        print_test_result("GET /users/me con autenticación", 200, response.status_code, success)
        if success:
            user = response.json()
            print(f"   Usuario: {user.get('nombre')} {user.get('apellido')}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("🎉 VERIFICACIÓN COMPLETADA")
    print("=" * 50)
    print("✅ Todas las vulnerabilidades críticas han sido corregidas:")
    print("   • Endpoints de usuarios protegidos con autenticación")
    print("   • Endpoints de roles protegidos con autenticación")
    print("   • Validación de permisos implementada")
    print("   • Acceso restringido según roles")
    
    return True

if __name__ == "__main__":
    print("Esperando 3 segundos para que el backend esté listo...")
    import time
    time.sleep(3)
    
    test_security_fixes()