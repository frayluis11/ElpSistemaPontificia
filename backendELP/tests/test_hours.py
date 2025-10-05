"""
Pruebas de integración para el módulo de horas trabajadas
"""
import pytest
from httpx import AsyncClient
from datetime import datetime, date, timedelta


class TestHours:
    """Pruebas para endpoints de horas trabajadas"""

    async def test_register_hours_docente(self, client: AsyncClient, auth_headers_docente):
        """Prueba registrar horas como docente"""
        hours_data = {
            "fecha": datetime.now().date().isoformat(),
            "horas_trabajadas": 8.5,
            "descripcion": "Clases de programación y reunión departamental",
            "tipo_actividad": "docencia"
        }
        
        response = await client.post("/hours/", json=hours_data, headers=auth_headers_docente)
        
        assert response.status_code == 200
        data = response.json()
        assert data["horas_trabajadas"] == 8.5
        assert data["tipo_actividad"] == "docencia"
        assert "id" in data

    async def test_register_hours_invalid_data(self, client: AsyncClient, auth_headers_docente):
        """Prueba registrar horas con datos inválidos"""
        hours_data = {
            "fecha": "fecha-invalida",
            "horas_trabajadas": -5,  # Horas negativas
            "descripcion": "Descripción inválida"
        }
        
        response = await client.post("/hours/", json=hours_data, headers=auth_headers_docente)
        
        assert response.status_code == 422  # Validation error

    async def test_get_own_hours(self, client: AsyncClient, auth_headers_docente):
        """Prueba obtener horas propias"""
        # Primero registrar algunas horas
        hours_data = {
            "fecha": datetime.now().date().isoformat(),
            "horas_trabajadas": 6.0,
            "descripcion": "Preparación de clases",
            "tipo_actividad": "preparacion"
        }
        
        await client.post("/hours/", json=hours_data, headers=auth_headers_docente)
        
        # Obtener horas registradas
        response = await client.get("/hours/my-hours", headers=auth_headers_docente)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_get_hours_by_date_range(self, client: AsyncClient, auth_headers_docente):
        """Prueba obtener horas por rango de fechas"""
        start_date = (datetime.now() - timedelta(days=7)).date()
        end_date = datetime.now().date()
        
        response = await client.get(
            f"/hours/my-hours?start_date={start_date}&end_date={end_date}",
            headers=auth_headers_docente
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_update_hours_entry(self, client: AsyncClient, auth_headers_docente):
        """Prueba actualizar entrada de horas"""
        # Primero crear una entrada
        hours_data = {
            "fecha": datetime.now().date().isoformat(),
            "horas_trabajadas": 4.0,
            "descripcion": "Descripción original",
            "tipo_actividad": "administrativa"
        }
        
        create_response = await client.post("/hours/", json=hours_data, headers=auth_headers_docente)
        hours_id = create_response.json()["id"]
        
        # Actualizar la entrada
        update_data = {
            "horas_trabajadas": 5.5,
            "descripcion": "Descripción actualizada",
            "tipo_actividad": "docencia"
        }
        
        response = await client.put(
            f"/hours/{hours_id}", 
            json=update_data, 
            headers=auth_headers_docente
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["horas_trabajadas"] == 5.5
        assert data["descripcion"] == "Descripción actualizada"

    async def test_delete_hours_entry(self, client: AsyncClient, auth_headers_docente):
        """Prueba eliminar entrada de horas"""
        # Primero crear una entrada
        hours_data = {
            "fecha": datetime.now().date().isoformat(),
            "horas_trabajadas": 3.0,
            "descripcion": "Entrada a eliminar",
            "tipo_actividad": "investigacion"
        }
        
        create_response = await client.post("/hours/", json=hours_data, headers=auth_headers_docente)
        hours_id = create_response.json()["id"]
        
        # Eliminar la entrada
        response = await client.delete(f"/hours/{hours_id}", headers=auth_headers_docente)
        
        assert response.status_code == 200
        assert "message" in response.json()

    async def test_view_all_hours_admin(self, client: AsyncClient, auth_headers_admin):
        """Prueba ver todas las horas como administrador"""
        response = await client.get("/hours/all", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_view_all_hours_rrhh(self, client: AsyncClient, auth_headers_rrhh):
        """Prueba ver todas las horas como RRHH"""
        response = await client.get("/hours/all", headers=auth_headers_rrhh)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_view_all_hours_unauthorized(self, client: AsyncClient, auth_headers_docente):
        """Prueba ver todas las horas sin permisos (docente)"""
        response = await client.get("/hours/all", headers=auth_headers_docente)
        
        assert response.status_code == 403  # Forbidden

    async def test_hours_statistics(self, client: AsyncClient, auth_headers_rrhh):
        """Prueba obtener estadísticas de horas"""
        response = await client.get("/hours/statistics", headers=auth_headers_rrhh)
        
        assert response.status_code == 200
        data = response.json()
        assert "total_hours" in data or "statistics" in data

    async def test_export_hours_excel(self, client: AsyncClient, auth_headers_admin):
        """Prueba exportar horas a Excel"""
        response = await client.get("/hours/export/excel", headers=auth_headers_admin)
        
        # Puede ser 200 con datos o 404 si no hay horas
        assert response.status_code in [200, 404]
        
        if response.status_code == 200:
            assert response.headers.get("content-type") in [
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/json"  # Si retorna error JSON
            ]

    async def test_excessive_hours_validation(self, client: AsyncClient, auth_headers_docente):
        """Prueba validación de horas excesivas"""
        hours_data = {
            "fecha": datetime.now().date().isoformat(),
            "horas_trabajadas": 25.0,  # Más de 24 horas
            "descripcion": "Horas imposibles",
            "tipo_actividad": "docencia"
        }
        
        response = await client.post("/hours/", json=hours_data, headers=auth_headers_docente)
        
        # Debería rechazar horas excesivas
        assert response.status_code in [400, 422]

    async def test_duplicate_date_registration(self, client: AsyncClient, auth_headers_docente):
        """Prueba registrar horas en fecha duplicada"""
        test_date = datetime.now().date().isoformat()
        
        hours_data_1 = {
            "fecha": test_date,
            "horas_trabajadas": 4.0,
            "descripcion": "Primera entrada",
            "tipo_actividad": "docencia"
        }
        
        hours_data_2 = {
            "fecha": test_date,
            "horas_trabajadas": 3.0,
            "descripcion": "Segunda entrada mismo día",
            "tipo_actividad": "administrativa"
        }
        
        # Primera entrada debería ser exitosa
        response1 = await client.post("/hours/", json=hours_data_1, headers=auth_headers_docente)
        assert response1.status_code == 200
        
        # Segunda entrada puede ser exitosa (múltiples entradas por día) o rechazada según reglas de negocio
        response2 = await client.post("/hours/", json=hours_data_2, headers=auth_headers_docente)
        assert response2.status_code in [200, 400, 409]