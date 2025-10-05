"""
Pruebas unitarias para el módulo de roles
"""
import pytest
from httpx import AsyncClient


class TestRoles:
    """Pruebas para endpoints de roles"""

    async def test_list_roles(self, client: AsyncClient, auth_headers_admin, test_roles):
        """Prueba listar roles"""
        response = await client.get("/roles/", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 5  # Los 5 roles de prueba

    async def test_list_roles_without_permission(self, client: AsyncClient, auth_headers_docente):
        """Prueba listar roles sin permisos"""
        response = await client.get("/roles/", headers=auth_headers_docente)
        
        assert response.status_code == 403

    async def test_create_role(self, client: AsyncClient, auth_headers_admin):
        """Prueba crear nuevo rol"""
        role_data = {
            "nombre_rol": "Nuevo Rol",
            "descripcion": "Descripción del nuevo rol"
        }
        
        response = await client.post("/roles/", json=role_data, headers=auth_headers_admin)
        
        assert response.status_code == 201
        data = response.json()
        assert data["nombre_rol"] == "Nuevo Rol"
        assert data["descripcion"] == "Descripción del nuevo rol"

    async def test_get_role_by_id(self, client: AsyncClient, auth_headers_admin, test_roles):
        """Prueba obtener rol por ID"""
        role_id = test_roles[0].id
        response = await client.get(f"/roles/{role_id}", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == role_id
        assert data["nombre_rol"] == "Docente"

    async def test_get_nonexistent_role(self, client: AsyncClient, auth_headers_admin):
        """Prueba obtener rol inexistente"""
        response = await client.get("/roles/999", headers=auth_headers_admin)
        
        assert response.status_code == 404

    async def test_update_role(self, client: AsyncClient, auth_headers_admin, test_roles):
        """Prueba actualizar rol"""
        role_id = test_roles[0].id
        update_data = {
            "nombre_rol": "Docente Actualizado",
            "descripcion": "Descripción actualizada"
        }
        
        response = await client.put(f"/roles/{role_id}", json=update_data, headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert data["nombre_rol"] == "Docente Actualizado"
        assert data["descripcion"] == "Descripción actualizada"

    async def test_delete_role(self, client: AsyncClient, auth_headers_admin):
        """Prueba eliminar rol"""
        # Crear un rol para eliminar
        role_data = {
            "nombre_rol": "Rol Para Eliminar",
            "descripcion": "Este rol será eliminado"
        }
        
        create_response = await client.post("/roles/", json=role_data, headers=auth_headers_admin)
        role_id = create_response.json()["id"]
        
        # Eliminar el rol
        response = await client.delete(f"/roles/{role_id}", headers=auth_headers_admin)
        
        assert response.status_code == 200

    async def test_create_duplicate_role(self, client: AsyncClient, auth_headers_admin, test_roles):
        """Prueba crear rol con nombre duplicado"""
        role_data = {
            "nombre_rol": "Docente",  # Ya existe
            "descripcion": "Rol duplicado"
        }
        
        response = await client.post("/roles/", json=role_data, headers=auth_headers_admin)
        
        assert response.status_code == 400

    async def test_role_permissions_rrhh(self, client: AsyncClient, auth_headers_rrhh, test_roles):
        """Prueba permisos de roles para RRHH"""
        response = await client.get("/roles/", headers=auth_headers_rrhh)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)