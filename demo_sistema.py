#!/usr/bin/env python3
"""
Script para demostrar las funcionalidades del Sistema ELP Pontificia
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def mostrar_usuarios_disponibles():
    """Mostrar usuarios disponibles para login"""
    print("\n🔐 USUARIOS DISPONIBLES PARA PRUEBAS:")
    print("="*50)
    
    usuarios = [
        {"dni": "11111111", "contraseña": "docente123456", "rol": "Docente", "email": "maria.docente@pontificia.edu"},
        {"dni": "22222222", "contraseña": "rrhh123456", "rol": "RRHH", "email": "juan.rrhh@pontificia.edu"},
        {"dni": "33333333", "contraseña": "conta123456", "rol": "Contabilidad", "email": "ana.conta@pontificia.edu"},
        {"dni": "44444444", "contraseña": "admin123456", "rol": "Administración", "email": "carlos.admin@pontificia.edu"},
        {"dni": "55555555", "contraseña": "ti123456", "rol": "Área TI", "email": "sofia.ti@pontificia.edu"},
        {"dni": "12345678", "contraseña": "admin123456", "rol": "Administración", "email": "admin@pontificia.edu"}
    ]
    
    for i, user in enumerate(usuarios, 1):
        print(f"{i}. {user['rol']}")
        print(f"   DNI: {user['dni']}")
        print(f"   Contraseña: {user['contraseña']}")
        print(f"   Email: {user['email']}")
        print()

def probar_login(dni, contraseña):
    """Probar login con credenciales"""
    try:
        credentials = {
            "username": dni,
            "password": contraseña
        }
        
        response = requests.post(f"{BASE_URL}/auth/login", json=credentials)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login exitoso!")
            print(f"   Usuario: {data['nombre']} {data['apellido']}")
            print(f"   Rol: {data['rol']}")
            print(f"   Token: {data['access_token'][:30]}...")
            return data['access_token']
        else:
            print(f"❌ Error de login: {response.json().get('detail', 'Error desconocido')}")
            return None
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None

def probar_endpoints_con_token(token, rol):
    """Probar diferentes endpoints con el token"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"\n🧪 PROBANDO ENDPOINTS CON ROL: {rol}")
    print("="*50)
    
    # Probar endpoint de usuarios
    try:
        response = requests.get(f"{BASE_URL}/users/", headers=headers)
        if response.status_code == 200:
            users_count = len(response.json())
            print(f"✅ Listar usuarios: {users_count} usuarios encontrados")
        else:
            print(f"❌ Listar usuarios: Status {response.status_code}")
    except Exception as e:
        print(f"❌ Error usuarios: {e}")
    
    # Probar endpoint de documentos
    try:
        response = requests.get(f"{BASE_URL}/documents/", headers=headers)
        if response.status_code == 200:
            docs_count = len(response.json())
            print(f"✅ Listar documentos: {docs_count} documentos encontrados")
        else:
            print(f"❌ Listar documentos: Status {response.status_code}")
    except Exception as e:
        print(f"❌ Error documentos: {e}")
    
    # Probar endpoint de roles
    try:
        response = requests.get(f"{BASE_URL}/roles/", headers=headers)
        if response.status_code == 200:
            roles_count = len(response.json())
            print(f"✅ Listar roles: {roles_count} roles encontrados")
        else:
            print(f"❌ Listar roles: Status {response.status_code}")
    except Exception as e:
        print(f"❌ Error roles: {e}")

def menu_interactivo():
    """Menu interactivo para probar el sistema"""
    print("🚀 DEMO INTERACTIVO - SISTEMA ELP PONTIFICIA")
    print("="*60)
    
    while True:
        print("\n📋 OPCIONES DISPONIBLES:")
        print("1. Mostrar usuarios disponibles")
        print("2. Probar login con un usuario")
        print("3. Verificar estado del sistema")
        print("4. Salir")
        
        opcion = input("\n👉 Selecciona una opción (1-4): ").strip()
        
        if opcion == "1":
            mostrar_usuarios_disponibles()
            
        elif opcion == "2":
            print("\n🔐 LOGIN AL SISTEMA")
            print("-" * 30)
            dni = input("DNI (ej: 44444444): ").strip()
            contraseña = input("Contraseña (ej: admin123456): ").strip()
            
            token = probar_login(dni, contraseña)
            if token:
                # Obtener info del usuario para mostrar el rol
                try:
                    headers = {"Authorization": f"Bearer {token}"}
                    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
                    if response.status_code == 200:
                        user_data = response.json()
                        rol = user_data.get('rol', 'Desconocido')
                        probar_endpoints_con_token(token, rol)
                    else:
                        probar_endpoints_con_token(token, "Usuario")
                except:
                    probar_endpoints_con_token(token, "Usuario")
                    
        elif opcion == "3":
            print("\n🔍 VERIFICANDO ESTADO DEL SISTEMA")
            print("-" * 40)
            try:
                response = requests.get(f"{BASE_URL}/health")
                if response.status_code == 200:
                    health_data = response.json()
                    print(f"✅ Sistema: {health_data['status']}")
                    print(f"✅ Servicio: {health_data['service']}")
                    print(f"✅ Versión: {health_data['version']}")
                else:
                    print(f"❌ Error: Status {response.status_code}")
            except Exception as e:
                print(f"❌ Error de conexión: {e}")
                
        elif opcion == "4":
            print("\n👋 ¡Gracias por probar el Sistema ELP Pontificia!")
            break
            
        else:
            print("❌ Opción no válida. Por favor selecciona 1-4.")

if __name__ == "__main__":
    menu_interactivo()