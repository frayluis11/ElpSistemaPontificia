"""
Pruebas unitarias para el módulo de autenticación
"""
import pytest
from httpx import AsyncClient


class TestAuth:
    """Pruebas para endpoints de autenticación"""

    async def test_login_success(self, client: AsyncClient, test_users):
        """Prueba de login exitoso"""
        login_data = {
            "username": "admin@test.com",
            "password": "admin123"
        }
        
        response = await client.post("/auth/login", data=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"

    async def test_login_invalid_credentials(self, client: AsyncClient, test_users):
        """Prueba de login con credenciales inválidas"""
        login_data = {
            "username": "admin@test.com",
            "password": "wrongpassword"
        }
        
        response = await client.post("/auth/login", data=login_data)
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data

    async def test_login_nonexistent_user(self, client: AsyncClient, test_users):
        """Prueba de login con usuario inexistente"""
        login_data = {
            "username": "nonexistent@test.com",
            "password": "password123"
        }
        
        response = await client.post("/auth/login", data=login_data)
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data

    async def test_protected_endpoint_without_token(self, client: AsyncClient):
        """Prueba de acceso a endpoint protegido sin token"""
        response = await client.get("/users/me")
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data

    async def test_protected_endpoint_with_token(self, client: AsyncClient, auth_headers_admin):
        """Prueba de acceso a endpoint protegido con token válido"""
        response = await client.get("/users/me", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert "email" in data
        assert data["email"] == "admin@test.com"

    async def test_invalid_token(self, client: AsyncClient):
        """Prueba con token inválido"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = await client.get("/users/me", headers=headers)
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data

    async def test_expired_token_format(self, client: AsyncClient):
        """Prueba con formato de token inválido"""
        headers = {"Authorization": "InvalidFormat token"}
        response = await client.get("/users/me", headers=headers)
        
        assert response.status_code == 401

    async def test_register_user(self, client: AsyncClient, test_roles):
        """Prueba de registro de nuevo usuario"""
        user_data = {
            "nombre": "Nuevo",
            "apellido": "Usuario",
            "email": "nuevo@test.com",
            "password": "password123",
            "rol_id": 1
        }
        
        response = await client.post("/users/create", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "nuevo@test.com"
        assert data["nombre"] == "Nuevo"
        assert "id" in data

    async def test_register_duplicate_email(self, client: AsyncClient, test_users):
        """Prueba de registro con email duplicado"""
        user_data = {
            "nombre": "Duplicate",
            "apellido": "User",
            "email": "admin@test.com",  # Email ya existe
            "password": "password123",
            "rol_id": 1
        }
        
        response = await client.post("/users/create", json=user_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data