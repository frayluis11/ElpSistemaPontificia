"""
Pruebas unitarias para el módulo de usuarios
"""
import pytest
from httpx import AsyncClient


class TestUsers:
    """Pruebas para endpoints de usuarios"""

    async def test_get_current_user(self, client: AsyncClient, auth_headers_admin):
        """Prueba obtener usuario actual"""
        response = await client.get("/users/me", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "admin@test.com"
        assert data["nombre"] == "Admin"
        assert data["apellido"] == "Test"

    async def test_list_users_admin(self, client: AsyncClient, auth_headers_admin):
        """Prueba listar usuarios como admin"""
        response = await client.get("/users/", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 3  # Los usuarios de prueba

    async def test_list_users_without_permission(self, client: AsyncClient, auth_headers_docente):
        """Prueba listar usuarios sin permisos"""
        response = await client.get("/users/", headers=auth_headers_docente)
        
        assert response.status_code == 403
        data = response.json()
        assert "detail" in data

    async def test_create_user_as_admin(self, client: AsyncClient, auth_headers_admin):
        """Prueba crear usuario como admin"""
        user_data = {
            "nombre": "Nuevo",
            "apellido": "Usuario",
            "email": "nuevo_user@test.com",
            "password": "password123",
            "rol_id": 1
        }
        
        response = await client.post("/users/create", json=user_data, headers=auth_headers_admin)
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "nuevo_user@test.com"
        assert data["nombre"] == "Nuevo"

    async def test_get_user_by_id(self, client: AsyncClient, auth_headers_admin, test_users):
        """Prueba obtener usuario por ID"""
        user_id = test_users[0].id
        response = await client.get(f"/users/{user_id}", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id

    async def test_get_nonexistent_user(self, client: AsyncClient, auth_headers_admin):
        """Prueba obtener usuario inexistente"""
        response = await client.get("/users/999", headers=auth_headers_admin)
        
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data

    async def test_update_user(self, client: AsyncClient, auth_headers_admin, test_users):
        """Prueba actualizar usuario"""
        user_id = test_users[0].id
        update_data = {
            "nombre": "Updated",
            "apellido": "Name"
        }
        
        response = await client.put(f"/users/{user_id}", json=update_data, headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert data["nombre"] == "Updated"
        assert data["apellido"] == "Name"

    async def test_deactivate_user(self, client: AsyncClient, auth_headers_admin, test_users):
        """Prueba desactivar usuario"""
        user_id = test_users[1].id  # Usar el segundo usuario para no afectar admin
        
        response = await client.patch(f"/users/{user_id}/deactivate", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] == False

    async def test_activate_user(self, client: AsyncClient, auth_headers_admin, test_users):
        """Prueba activar usuario"""
        user_id = test_users[1].id
        
        # Primero desactivar
        await client.patch(f"/users/{user_id}/deactivate", headers=auth_headers_admin)
        
        # Luego activar
        response = await client.patch(f"/users/{user_id}/activate", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] == True

    async def test_update_own_profile(self, client: AsyncClient, auth_headers_docente):
        """Prueba actualizar propio perfil"""
        update_data = {
            "nombre": "Updated",
            "apellido": "Profile"
        }
        
        response = await client.put("/users/me", json=update_data, headers=auth_headers_docente)
        
        assert response.status_code == 200
        data = response.json()
        assert data["nombre"] == "Updated"
        assert data["apellido"] == "Profile"