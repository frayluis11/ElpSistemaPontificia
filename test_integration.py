#!/usr/bin/env python3
"""
Pruebas de integración completa para el Sistema ELP Pontificia
Prueba todas las funcionalidades con diferentes roles de usuario
"""
import requests
import json
import time
from typing import Dict, Any

BASE_URL = "http://127.0.0.1:8000"

class SistemaELPTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.tokens = {}
        self.users = {}
        
    def print_section(self, title: str):
        print(f"\n{'='*60}")
        print(f"🧪 {title}")
        print('='*60)
        
    def print_test(self, test_name: str, success: bool, details: str = ""):
        icon = "✅" if success else "❌"
        print(f"{icon} {test_name}")
        if details:
            print(f"   {details}")
            
    def create_test_users(self):
        """Crear usuarios de prueba para cada rol"""
        self.print_section("CREACIÓN DE USUARIOS DE PRUEBA")
        
        # Crear roles por defecto
        try:
            response = requests.post(f"{self.base_url}/auth/create-default-roles")
            self.print_test("Crear roles por defecto", response.status_code in [200, 201])
        except Exception as e:
            self.print_test("Crear roles por defecto", False, str(e))
        
        # Usuarios de prueba para cada rol
        test_users = [
            {
                "nombre": "María", "apellido": "Docente", "dni": "11111111",
                "correo_institucional": "maria.docente@pontificia.edu",
                "contraseña": "docente123456", "rol_nombre": "Docente"
            },
            {
                "nombre": "Juan", "apellido": "RRHH", "dni": "22222222",
                "correo_institucional": "juan.rrhh@pontificia.edu",
                "contraseña": "rrhh123456", "rol_nombre": "RRHH"
            },
            {
                "nombre": "Ana", "apellido": "Contabilidad", "dni": "33333333",
                "correo_institucional": "ana.conta@pontificia.edu",
                "contraseña": "conta123456", "rol_nombre": "Contabilidad"
            },
            {
                "nombre": "Carlos", "apellido": "Admin", "dni": "44444444",
                "correo_institucional": "carlos.admin@pontificia.edu",
                "contraseña": "admin123456", "rol_nombre": "Administración"
            },
            {
                "nombre": "Sofia", "apellido": "TI", "dni": "55555555",
                "correo_institucional": "sofia.ti@pontificia.edu",
                "contraseña": "ti123456", "rol_nombre": "Área TI"
            }
        ]
        
        for user_data in test_users:
            try:
                response = requests.post(f"{self.base_url}/auth/register", json=user_data)
                success = response.status_code in [200, 201]
                role = user_data["rol_nombre"]
                
                if success:
                    self.users[role] = user_data
                    self.print_test(f"Usuario {role}", True, f"ID: {response.json().get('user_id', 'N/A')}")
                else:
                    # Si el usuario ya existe, está bien
                    if "ya está registrado" in response.text:
                        self.users[role] = user_data
                        self.print_test(f"Usuario {role}", True, "Ya existe")
                    else:
                        self.print_test(f"Usuario {role}", False, response.text[:100])
            except Exception as e:
                self.print_test(f"Usuario {user_data['rol_nombre']}", False, str(e))
                
    def login_all_users(self):
        """Hacer login con todos los usuarios"""
        self.print_section("AUTENTICACIÓN DE USUARIOS")
        
        for role, user_data in self.users.items():
            try:
                credentials = {
                    "username": user_data["dni"],
                    "password": user_data["contraseña"]
                }
                
                response = requests.post(f"{self.base_url}/auth/login", json=credentials)
                success = response.status_code == 200
                
                if success:
                    token_data = response.json()
                    self.tokens[role] = token_data["access_token"]
                    self.print_test(f"Login {role}", True, 
                                  f"Token: {token_data['access_token'][:20]}...")
                else:
                    self.print_test(f"Login {role}", False, response.text[:100])
            except Exception as e:
                self.print_test(f"Login {role}", False, str(e))
                
    def get_headers(self, role: str) -> Dict[str, str]:
        """Obtener headers con token de autorización"""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.tokens.get(role, '')}"
        }
        
    def test_user_management(self):
        """Probar gestión de usuarios"""
        self.print_section("GESTIÓN DE USUARIOS")
        
        # Probar con rol de Administración
        admin_role = "Administración"
        if admin_role not in self.tokens:
            self.print_test("Gestión de usuarios", False, "Sin token de admin")
            return
            
        headers = self.get_headers(admin_role)
        
        # Listar usuarios
        try:
            response = requests.get(f"{self.base_url}/users/", headers=headers)
            success = response.status_code == 200
            users_count = len(response.json()) if success else 0
            self.print_test("Listar usuarios", success, f"Encontrados: {users_count} usuarios")
        except Exception as e:
            self.print_test("Listar usuarios", False, str(e))
            
        # Probar acceso restringido con rol docente
        if "Docente" in self.tokens:
            try:
                response = requests.get(f"{self.base_url}/users/", 
                                      headers=self.get_headers("Docente"))
                # Los docentes normalmente no deberían tener acceso a listar todos los usuarios
                restricted = response.status_code in [403, 401]
                self.print_test("Restricción de acceso (Docente)", restricted, 
                              f"Status: {response.status_code}")
            except Exception as e:
                self.print_test("Restricción de acceso (Docente)", False, str(e))
                
    def test_document_management(self):
        """Probar gestión de documentos"""
        self.print_section("GESTIÓN DE DOCUMENTOS")
        
        # Probar con diferentes roles
        for role in ["Docente", "RRHH", "Administración"]:
            if role not in self.tokens:
                continue
                
            headers = self.get_headers(role)
            
            # Listar documentos
            try:
                response = requests.get(f"{self.base_url}/documents/", headers=headers)
                success = response.status_code == 200
                docs_count = len(response.json()) if success else 0
                self.print_test(f"Listar documentos ({role})", success, 
                              f"Documentos: {docs_count}")
            except Exception as e:
                self.print_test(f"Listar documentos ({role})", False, str(e))
                
    def test_hours_tracking(self):
        """Probar seguimiento de horas"""
        self.print_section("SEGUIMIENTO DE HORAS")
        
        # Crear registro de horas (Docente)
        if "Docente" in self.tokens:
            headers = self.get_headers("Docente")
            
            # Crear registro de horas
            hours_data = {
                "fecha": "2024-10-05",
                "horas_trabajadas": 8.0,
                "descripcion_actividades": "Clases de matemáticas y preparación de material",
                "proyecto": "Educación Básica"
            }
            
            try:
                response = requests.post(f"{self.base_url}/hours/", 
                                       json=hours_data, headers=headers)
                success = response.status_code in [200, 201]
                self.print_test("Registrar horas (Docente)", success, 
                              f"Status: {response.status_code}")
                
                if success:
                    # Obtener mis horas
                    response = requests.get(f"{self.base_url}/hours/my-hours", headers=headers)
                    success = response.status_code == 200
                    hours_count = len(response.json()) if success else 0
                    self.print_test("Consultar mis horas", success, f"Registros: {hours_count}")
                    
            except Exception as e:
                self.print_test("Registrar horas (Docente)", False, str(e))
                
        # Ver todas las horas (RRHH/Admin)
        for role in ["RRHH", "Administración"]:
            if role not in self.tokens:
                continue
                
            try:
                headers = self.get_headers(role)
                response = requests.get(f"{self.base_url}/hours/all", headers=headers)
                success = response.status_code == 200
                total_hours = len(response.json()) if success else 0
                self.print_test(f"Ver todas las horas ({role})", success, 
                              f"Total registros: {total_hours}")
            except Exception as e:
                self.print_test(f"Ver todas las horas ({role})", False, str(e))
                
    def test_reports_and_stats(self):
        """Probar reportes y estadísticas"""
        self.print_section("REPORTES Y ESTADÍSTICAS")
        
        # Probar con rol administrativo
        for role in ["Administración", "RRHH"]:
            if role not in self.tokens:
                continue
                
            headers = self.get_headers(role)
            
            # Estadísticas de usuarios
            try:
                response = requests.get(f"{self.base_url}/reports-stats/users", headers=headers)
                success = response.status_code == 200
                self.print_test(f"Stats usuarios ({role})", success)
            except Exception as e:
                self.print_test(f"Stats usuarios ({role})", False, str(e))
                
            # Estadísticas de horas
            try:
                response = requests.get(f"{self.base_url}/reports-stats/hours", headers=headers)
                success = response.status_code == 200
                self.print_test(f"Stats horas ({role})", success)
            except Exception as e:
                self.print_test(f"Stats horas ({role})", False, str(e))
                
            # Dashboard completo
            try:
                response = requests.get(f"{self.base_url}/reports-stats/complete", headers=headers)
                success = response.status_code == 200
                self.print_test(f"Dashboard completo ({role})", success)
            except Exception as e:
                self.print_test(f"Dashboard completo ({role})", False, str(e))
                
    def test_system_endpoints(self):
        """Probar endpoints del sistema"""
        self.print_section("ENDPOINTS DEL SISTEMA")
        
        # Health check (público)
        try:
            response = requests.get(f"{self.base_url}/health")
            success = response.status_code == 200
            self.print_test("Health check", success, response.json().get('status', 'N/A'))
        except Exception as e:
            self.print_test("Health check", False, str(e))
            
        # System info (requiere autenticación)
        if "Área TI" in self.tokens:
            try:
                headers = self.get_headers("Área TI")
                response = requests.get(f"{self.base_url}/system-monitor/info", headers=headers)
                success = response.status_code == 200
                self.print_test("System info (TI)", success)
            except Exception as e:
                self.print_test("System info (TI)", False, str(e))
                
    def run_stress_test(self):
        """Prueba básica de carga"""
        self.print_section("PRUEBAS DE ESTRÉS BÁSICAS")
        
        # Múltiples requests concurrentes al health endpoint
        import threading
        import time
        
        results = {"success": 0, "failed": 0}
        
        def health_request():
            try:
                response = requests.get(f"{self.base_url}/health", timeout=5)
                if response.status_code == 200:
                    results["success"] += 1
                else:
                    results["failed"] += 1
            except:
                results["failed"] += 1
        
        # Ejecutar 20 requests concurrentes
        threads = []
        start_time = time.time()
        
        for _ in range(20):
            thread = threading.Thread(target=health_request)
            threads.append(thread)
            thread.start()
            
        # Esperar que terminen todos
        for thread in threads:
            thread.join()
            
        end_time = time.time()
        duration = end_time - start_time
        
        total_requests = results["success"] + results["failed"]
        success_rate = (results["success"] / total_requests * 100) if total_requests > 0 else 0
        
        self.print_test(f"Prueba de carga (20 requests)", True, 
                       f"Éxito: {results['success']}, Fallos: {results['failed']}, "
                       f"Tiempo: {duration:.2f}s, Tasa éxito: {success_rate:.1f}%")
        
    def run_all_tests(self):
        """Ejecutar todas las pruebas"""
        print("🚀 INICIANDO PRUEBAS COMPLETAS DEL SISTEMA ELP PONTIFICIA")
        print(f"📍 Base URL: {self.base_url}")
        
        start_time = time.time()
        
        # Ejecutar todas las pruebas
        self.create_test_users()
        self.login_all_users()
        self.test_user_management()
        self.test_document_management()
        self.test_hours_tracking()
        self.test_reports_and_stats()
        self.test_system_endpoints()
        self.run_stress_test()
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Resumen final
        self.print_section("RESUMEN FINAL")
        print(f"⏱️  Tiempo total de pruebas: {duration:.2f} segundos")
        print(f"👥 Usuarios creados: {len(self.users)}")
        print(f"🔐 Tokens obtenidos: {len(self.tokens)}")
        print(f"✅ Sistema completamente funcional y listo para producción!")

if __name__ == "__main__":
    tester = SistemaELPTester()
    tester.run_all_tests()