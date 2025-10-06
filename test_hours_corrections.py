#!/usr/bin/env python3
"""
Script de pruebas para validar las correcciones del módulo de horas trabajadas
"""

import requests
import json
from datetime import date, datetime
import sys

BASE_URL = "http://127.0.0.1:8001"

def print_test_result(test_name, passed, message=""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} {test_name}")
    if message:
        print(f"   📝 {message}")
    print()

def test_authentication_required():
    """Probar que los endpoints requieren autenticación"""
    print("🔐 PROBANDO AUTENTICACIÓN REQUERIDA")
    print("=" * 50)
    
    endpoints_to_test = [
        ("GET", "/hours/"),
        ("POST", "/hours/"),
        ("GET", "/hours/1"),
        ("PUT", "/hours/1"),
        ("DELETE", "/hours/1"),
        ("GET", "/hours/my-hours"),
        ("GET", "/hours/export/excel"),
        ("GET", "/reports/hours")
    ]
    
    for method, endpoint in endpoints_to_test:
        try:
            if method == "GET":
                response = requests.get(f"{BASE_URL}{endpoint}")
            elif method == "POST":
                response = requests.post(f"{BASE_URL}{endpoint}", json={})
            elif method == "PUT":
                response = requests.put(f"{BASE_URL}{endpoint}", json={})
            elif method == "DELETE":
                response = requests.delete(f"{BASE_URL}{endpoint}")
            
            # Debe retornar 401 (Unauthorized) en lugar de 200
            is_protected = response.status_code == 401
            print_test_result(
                f"{method} {endpoint} requiere autenticación",
                is_protected,
                f"Status: {response.status_code} (esperado: 401)"
            )
            
        except Exception as e:
            print_test_result(f"{method} {endpoint}", False, f"Error: {str(e)}")

def test_login_and_get_token():
    """Obtener token de autenticación"""
    print("🔑 OBTENIENDO TOKEN DE AUTENTICACIÓN")
    print("=" * 50)
    
    login_data = {
        "dni": "12345678",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        
        if response.status_code == 200:
            token_data = response.json()
            token = token_data.get("access_token")
            print_test_result("Login exitoso", True, f"Token obtenido: {token[:20]}...")
            return token
        else:
            print_test_result("Login", False, f"Status: {response.status_code}")
            return None
            
    except Exception as e:
        print_test_result("Login", False, f"Error: {str(e)}")
        return None

def test_hours_endpoints_with_auth(token):
    """Probar endpoints de horas con autenticación"""
    if not token:
        print("❌ No se puede probar sin token")
        return
    
    print("📊 PROBANDO ENDPOINTS DE HORAS CON AUTENTICACIÓN")
    print("=" * 50)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test GET /hours/ (ahora debe funcionar)
    try:
        response = requests.get(f"{BASE_URL}/hours/", headers=headers)
        print_test_result(
            "GET /hours/ con autenticación",
            response.status_code == 200,
            f"Status: {response.status_code}"
        )
    except Exception as e:
        print_test_result("GET /hours/", False, f"Error: {str(e)}")
    
    # Test GET /hours/my-hours (nuevo endpoint)
    try:
        response = requests.get(f"{BASE_URL}/hours/my-hours", headers=headers)
        print_test_result(
            "GET /hours/my-hours (nuevo endpoint)",
            response.status_code == 200,
            f"Status: {response.status_code}"
        )
    except Exception as e:
        print_test_result("GET /hours/my-hours", False, f"Error: {str(e)}")
    
    # Test POST /hours/ (crear hora - ahora validado)
    try:
        hour_data = {
            "usuario_id": 1,  # Debería validar que coincida con el usuario actual
            "fecha": str(date.today()),
            "horas_totales": 8.0,
            "observaciones": "Prueba de corrección de seguridad"
        }
        response = requests.post(f"{BASE_URL}/hours/", json=hour_data, headers=headers)
        print_test_result(
            "POST /hours/ con validación de usuario",
            response.status_code in [201, 400, 403],  # 201=success, 400/403=validation
            f"Status: {response.status_code}"
        )
        
        if response.status_code == 201:
            created_hour = response.json()
            print(f"   📝 Hora creada con ID: {created_hour.get('id')}")
            return created_hour.get('id')
            
    except Exception as e:
        print_test_result("POST /hours/", False, f"Error: {str(e)}")
    
    return None

def test_statistics_endpoints(token):
    """Probar endpoints de estadísticas corregidos"""
    if not token:
        return
    
    print("📈 PROBANDO ENDPOINTS DE ESTADÍSTICAS")
    print("=" * 50)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test GET /reports/hours (nuevo endpoint)
    try:
        response = requests.get(f"{BASE_URL}/reports/hours", headers=headers)
        print_test_result(
            "GET /reports/hours (estadísticas corregidas)",
            response.status_code == 200,
            f"Status: {response.status_code}"
        )
        
        if response.status_code == 200:
            stats = response.json()
            print(f"   📝 Stats keys: {list(stats.keys())}")
            
    except Exception as e:
        print_test_result("GET /reports/hours", False, f"Error: {str(e)}")

def test_export_functionality(token):
    """Probar funcionalidad de exportación"""
    if not token:
        return
    
    print("📤 PROBANDO EXPORTACIÓN A EXCEL")
    print("=" * 50)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test exportación desde hours
    try:
        response = requests.get(f"{BASE_URL}/hours/export/excel", headers=headers)
        print_test_result(
            "GET /hours/export/excel",
            response.status_code == 200,
            f"Status: {response.status_code}, Content-Type: {response.headers.get('content-type', 'N/A')}"
        )
    except Exception as e:
        print_test_result("Hours Excel Export", False, f"Error: {str(e)}")
    
    # Test exportación desde reports
    try:
        response = requests.get(f"{BASE_URL}/reports/export/hours/excel", headers=headers)
        print_test_result(
            "GET /reports/export/hours/excel",
            response.status_code == 200,
            f"Status: {response.status_code}, Content-Type: {response.headers.get('content-type', 'N/A')}"
        )
    except Exception as e:
        print_test_result("Reports Excel Export", False, f"Error: {str(e)}")

def main():
    print("🚀 INICIANDO PRUEBAS DE CORRECCIONES DEL MÓDULO DE HORAS")
    print("=" * 60)
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"🕐 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # 1. Probar que los endpoints requieren autenticación
    test_authentication_required()
    
    # 2. Obtener token
    token = test_login_and_get_token()
    
    # 3. Probar endpoints con autenticación
    test_hours_endpoints_with_auth(token)
    
    # 4. Probar estadísticas corregidas
    test_statistics_endpoints(token)
    
    # 5. Probar exportación
    test_export_functionality(token)
    
    print("🎉 PRUEBAS COMPLETADAS")
    print("=" * 60)
    print("✅ Si todos los tests pasaron, las correcciones están funcionando correctamente")
    print("❌ Si hay fallos, revisa los logs del servidor para más detalles")

if __name__ == "__main__":
    main()