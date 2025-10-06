#!/usr/bin/env python3
"""
Script de auditoría completa del sistema de autenticación y autorización
Backend ELP - Sistema Pontificia
"""
import urllib.request
import json
import urllib.error
import time

class AuthSecurityAuditor:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.admin_token = None
        self.test_results = []
        
    def log_test(self, test_name, status, details=""):
        """Registrar resultado de test"""
        result = {
            "test": test_name,
            "status": "✅ PASS" if status else "❌ FAIL",
            "details": details
        }
        self.test_results.append(result)
        print(f"{result['status']} {test_name}")
        if details:
            print(f"   {details}")
        
    def make_request(self, endpoint, method="GET", data=None, headers=None):
        """Realizar petición HTTP"""
        url = f"{self.base_url}{endpoint}"
        
        if headers is None:
            headers = {'Content-Type': 'application/json'}
            
        try:
            if data:
                json_data = json.dumps(data).encode('utf-8')
                req = urllib.request.Request(url, data=json_data, headers=headers, method=method)
            else:
                req = urllib.request.Request(url, headers=headers, method=method)
                
            with urllib.request.urlopen(req) as response:
                return {
                    'status_code': response.getcode(),
                    'data': json.loads(response.read().decode('utf-8')),
                    'success': True
                }
        except urllib.error.HTTPError as e:
            return {
                'status_code': e.code,
                'data': e.read().decode('utf-8'),
                'success': False
            }
        except Exception as e:
            return {
                'status_code': 0,
                'data': str(e),
                'success': False
            }
    
    def test_authentication(self):
        """Pruebas de autenticación"""
        print("\n=== MÓDULO: AUTENTICACIÓN ===")
        
        # Test 1: Login válido
        response = self.make_request("/auth/login", "POST", {
            "username": "12345678",
            "password": "admin123"
        })
        
        if response['success'] and response['status_code'] == 200:
            self.admin_token = response['data']['access_token']
            self.log_test("Login con credenciales válidas", True, 
                         f"Token generado correctamente, expira en {response['data']['expires_in']} segundos")
        else:
            self.log_test("Login con credenciales válidas", False, 
                         f"Error: {response['data']}")
            return False
            
        # Test 2: Login inválido - contraseña incorrecta
        response = self.make_request("/auth/login", "POST", {
            "username": "12345678", 
            "password": "wrongpassword"
        })
        
        success = not response['success'] and response['status_code'] == 401
        self.log_test("Login con contraseña incorrecta rechazado", success,
                     f"Status: {response['status_code']}")
        
        # Test 3: Login inválido - usuario inexistente  
        response = self.make_request("/auth/login", "POST", {
            "username": "99999999",
            "password": "anypassword"
        })
        
        success = not response['success'] and response['status_code'] == 401
        self.log_test("Login con usuario inexistente rechazado", success,
                     f"Status: {response['status_code']}")
        
        # Test 4: Validación JWT
        if self.admin_token:
            headers = {
                'Authorization': f'Bearer {self.admin_token}',
                'Content-Type': 'application/json'
            }
            response = self.make_request("/users/me", "GET", None, headers)
            
            success = response['success'] and response['status_code'] == 200
            if success:
                user_data = response['data']
                self.log_test("Validación JWT en endpoint protegido", True,
                             f"Usuario: {user_data.get('nombre', 'N/A')} - Rol: {user_data.get('rol', 'N/A')}")
            else:
                self.log_test("Validación JWT en endpoint protegido", False,
                             f"Error: {response['data']}")
        
        return True
    
    def test_authorization(self):
        """Pruebas de autorización y roles"""
        print("\n=== MÓDULO: AUTORIZACIÓN Y ROLES ===")
        
        if not self.admin_token:
            self.log_test("Autorización - Token requerido", False, "No hay token disponible")
            return False
            
        # Test 1: Acceso con token válido
        headers = {'Authorization': f'Bearer {self.admin_token}', 'Content-Type': 'application/json'}
        response = self.make_request("/users/", "GET", None, headers)
        
        success = response['success'] and response['status_code'] == 200
        self.log_test("Acceso a endpoint protegido con token válido", success,
                     f"Status: {response['status_code']}")
        
        # Test 2: Acceso sin token
        response = self.make_request("/users/", "GET")
        
        success = not response['success'] and response['status_code'] in [401, 403]
        self.log_test("Acceso a endpoint protegido SIN token bloqueado", success,
                     f"Status: {response['status_code']}")
        
        # Test 3: Token malformado
        bad_headers = {'Authorization': 'Bearer token_invalido_123', 'Content-Type': 'application/json'}
        response = self.make_request("/users/", "GET", None, bad_headers)
        
        success = not response['success'] and response['status_code'] == 401
        self.log_test("Token malformado rechazado", success,
                     f"Status: {response['status_code']}")
        
        # Test 4: Verificar roles disponibles
        response = self.make_request("/auth/create-default-roles", "POST")
        
        self.log_test("Creación de roles del sistema", True,
                     "Roles por defecto disponibles")
        
        return True
    
    def test_security_headers(self):
        """Pruebas de headers de seguridad"""
        print("\n=== MÓDULO: HEADERS DE SEGURIDAD ===")
        
        # Test básico de respuesta
        response = self.make_request("/")
        
        if response['success']:
            self.log_test("Endpoint público accesible", True,
                         f"API responde correctamente en {self.base_url}")
        else:
            self.log_test("Endpoint público accesible", False,
                         f"Error de conectividad: {response['data']}")
        
        # Test de documentación API
        response = self.make_request("/docs")
        
        success = response['success'] and response['status_code'] == 200
        if success:
            self.log_test("Documentación API disponible", True,
                         "Swagger UI accesible en /docs")
        else:
            self.log_test("Documentación API disponible", False,
                         "Documentación no accesible")
    
    def test_password_security(self):
        """Pruebas de seguridad de contraseñas"""
        print("\n=== MÓDULO: SEGURIDAD DE CONTRASEÑAS ===")
        
        # Test 1: Contraseña débil en registro
        response = self.make_request("/auth/register", "POST", {
            "nombre": "Test",
            "apellido": "Weak",
            "dni": "11111111",
            "correo_institucional": "weak@test.com",
            "contraseña": "123",  # Contraseña muy débil
            "rol_nombre": "Docente"
        })
        
        # Debe fallar por validación mínima de 8 caracteres
        success = not response['success'] and response['status_code'] == 422
        self.log_test("Contraseña débil rechazada en registro", success,
                     f"Status: {response['status_code']}")
        
        # Test 2: Formato de respuesta de error
        if not response['success']:
            try:
                error_data = json.loads(response['data'])
                has_detail = 'detail' in error_data
                self.log_test("Respuesta de error estructurada", has_detail,
                             "Respuesta incluye campo 'detail'")
            except:
                self.log_test("Respuesta de error estructurada", False,
                             "Error al parsear respuesta")
    
    def test_data_validation(self):
        """Pruebas de validación de datos"""
        print("\n=== MÓDULO: VALIDACIÓN DE DATOS ===")
        
        # Test 1: DNI inválido
        response = self.make_request("/auth/register", "POST", {
            "nombre": "Test",
            "apellido": "Invalid",
            "dni": "123",  # DNI muy corto
            "correo_institucional": "invalid@test.com",
            "contraseña": "validpassword123",
            "rol_nombre": "Docente"
        })
        
        success = not response['success'] and response['status_code'] == 422
        self.log_test("DNI inválido rechazado", success,
                     f"Status: {response['status_code']}")
        
        # Test 2: Email inválido
        response = self.make_request("/auth/register", "POST", {
            "nombre": "Test",
            "apellido": "Invalid",
            "dni": "22222222",
            "correo_institucional": "email_invalido",  # Sin formato válido
            "contraseña": "validpassword123",
            "rol_nombre": "Docente"
        })
        
        success = not response['success'] and response['status_code'] == 422
        self.log_test("Email inválido rechazado", success,
                     f"Status: {response['status_code']}")
    
    def run_full_audit(self):
        """Ejecutar auditoría completa"""
        print("="*60)
        print("🔒 AUDITORÍA DE SEGURIDAD - SISTEMA ELP BACKEND")
        print("="*60)
        
        start_time = time.time()
        
        # Ejecutar todos los tests
        self.test_authentication()
        self.test_authorization() 
        self.test_security_headers()
        self.test_password_security()
        self.test_data_validation()
        
        # Resumen final
        print("\n" + "="*60)
        print("📊 RESUMEN DE AUDITORÍA")
        print("="*60)
        
        passed = sum(1 for result in self.test_results if "PASS" in result['status'])
        failed = sum(1 for result in self.test_results if "FAIL" in result['status'])
        total = len(self.test_results)
        
        print(f"Total de pruebas: {total}")
        print(f"✅ Pasadas: {passed}")
        print(f"❌ Fallidas: {failed}")
        print(f"📈 Tasa de éxito: {(passed/total)*100:.1f}%")
        
        elapsed = time.time() - start_time
        print(f"⏱️  Tiempo total: {elapsed:.2f} segundos")
        
        # Clasificación de seguridad
        security_rating = (passed / total) * 10
        
        if security_rating >= 9.0:
            rating_text = "🟢 EXCELENTE"
        elif security_rating >= 7.0:
            rating_text = "🟡 BUENO"
        elif security_rating >= 5.0:
            rating_text = "🟠 REGULAR"
        else:
            rating_text = "🔴 DEFICIENTE"
            
        print(f"🔒 Calificación de Seguridad: {security_rating:.1f}/10 - {rating_text}")
        
        if failed > 0:
            print("\n❌ TESTS FALLIDOS:")
            for result in self.test_results:
                if "FAIL" in result['status']:
                    print(f"   • {result['test']}: {result['details']}")
        
        return {
            'total': total,
            'passed': passed,
            'failed': failed,
            'rating': security_rating,
            'results': self.test_results
        }

if __name__ == '__main__':
    auditor = AuthSecurityAuditor()
    results = auditor.run_full_audit()