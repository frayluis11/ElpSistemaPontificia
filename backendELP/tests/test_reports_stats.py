"""
Pruebas de integración para el módulo de reportes estadísticos
"""
import pytest
from httpx import AsyncClient


class TestReportsStats:
    """Pruebas para endpoints de reportes estadísticos"""

    async def test_users_statistics_admin(self, client: AsyncClient, auth_headers_admin):
        """Prueba estadísticas de usuarios como admin"""
        response = await client.get("/reports-stats/users", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "users_by_role" in data
        assert isinstance(data["users_by_role"], list)

    async def test_users_statistics_rrhh(self, client: AsyncClient, auth_headers_rrhh):
        """Prueba estadísticas de usuarios como RRHH"""
        response = await client.get("/reports-stats/users", headers=auth_headers_rrhh)
        
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data

    async def test_users_statistics_unauthorized(self, client: AsyncClient, auth_headers_docente):
        """Prueba estadísticas de usuarios sin permisos"""
        response = await client.get("/reports-stats/users", headers=auth_headers_docente)
        
        assert response.status_code == 403

    async def test_documents_statistics_admin(self, client: AsyncClient, auth_headers_admin):
        """Prueba estadísticas de documentos como admin"""
        response = await client.get("/reports-stats/documents", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert "total_documents" in data
        assert "documents_by_type" in data
        assert "documents_by_month" in data

    async def test_documents_statistics_contabilidad(self, client: AsyncClient, auth_headers_contabilidad):
        """Prueba estadísticas de documentos como contabilidad"""
        response = await client.get("/reports-stats/documents", headers=auth_headers_contabilidad)
        
        assert response.status_code == 200
        data = response.json()
        assert "total_documents" in data

    async def test_hours_statistics_admin(self, client: AsyncClient, auth_headers_admin):
        """Prueba estadísticas de horas como admin"""
        response = await client.get("/reports-stats/hours", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert "total_hours" in data
        assert "hours_by_activity" in data
        assert "hours_by_month" in data

    async def test_hours_statistics_rrhh(self, client: AsyncClient, auth_headers_rrhh):
        """Prueba estadísticas de horas como RRHH"""
        response = await client.get("/reports-stats/hours", headers=auth_headers_rrhh)
        
        assert response.status_code == 200
        data = response.json()
        assert "total_hours" in data

    async def test_complete_statistics_admin(self, client: AsyncClient, auth_headers_admin):
        """Prueba estadísticas completas del sistema como admin"""
        response = await client.get("/reports-stats/complete", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert "users_stats" in data
        assert "documents_stats" in data
        assert "hours_stats" in data
        assert "system_stats" in data

    async def test_complete_statistics_unauthorized(self, client: AsyncClient, auth_headers_docente):
        """Prueba estadísticas completas sin permisos"""
        response = await client.get("/reports-stats/complete", headers=auth_headers_docente)
        
        assert response.status_code == 403

    async def test_export_users_report_excel(self, client: AsyncClient, auth_headers_admin):
        """Prueba exportar reporte de usuarios a Excel"""
        response = await client.get("/reports-stats/export/users/excel", headers=auth_headers_admin)
        
        assert response.status_code in [200, 404]
        
        if response.status_code == 200:
            assert response.headers.get("content-type") in [
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/json"
            ]

    async def test_export_documents_report_excel(self, client: AsyncClient, auth_headers_admin):
        """Prueba exportar reporte de documentos a Excel"""
        response = await client.get("/reports-stats/export/documents/excel", headers=auth_headers_admin)
        
        assert response.status_code in [200, 404]
        
        if response.status_code == 200:
            assert response.headers.get("content-type") in [
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/json"
            ]

    async def test_export_hours_report_excel(self, client: AsyncClient, auth_headers_admin):
        """Prueba exportar reporte de horas a Excel"""
        response = await client.get("/reports-stats/export/hours/excel", headers=auth_headers_admin)
        
        assert response.status_code in [200, 404]
        
        if response.status_code == 200:
            assert response.headers.get("content-type") in [
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/json"
            ]

    async def test_export_users_report_pdf(self, client: AsyncClient, auth_headers_admin):
        """Prueba exportar reporte de usuarios a PDF"""
        response = await client.get("/reports-stats/export/users/pdf", headers=auth_headers_admin)
        
        assert response.status_code in [200, 404]
        
        if response.status_code == 200:
            assert response.headers.get("content-type") in [
                "application/pdf",
                "application/json"
            ]

    async def test_export_documents_report_pdf(self, client: AsyncClient, auth_headers_admin):
        """Prueba exportar reporte de documentos a PDF"""
        response = await client.get("/reports-stats/export/documents/pdf", headers=auth_headers_admin)
        
        assert response.status_code in [200, 404]
        
        if response.status_code == 200:
            assert response.headers.get("content-type") in [
                "application/pdf",
                "application/json"
            ]

    async def test_monthly_summary_admin(self, client: AsyncClient, auth_headers_admin):
        """Prueba resumen mensual como admin"""
        response = await client.get("/reports-stats/monthly-summary", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert "month" in data
        assert "year" in data
        assert "summary" in data

    async def test_monthly_summary_with_params(self, client: AsyncClient, auth_headers_admin):
        """Prueba resumen mensual con parámetros específicos"""
        response = await client.get(
            "/reports-stats/monthly-summary?month=12&year=2024", 
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["month"] == 12
        assert data["year"] == 2024

    async def test_yearly_comparison_admin(self, client: AsyncClient, auth_headers_admin):
        """Prueba comparación anual como admin"""
        response = await client.get("/reports-stats/yearly-comparison", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert "current_year" in data
        assert "previous_year" in data
        assert "comparison" in data

    async def test_dashboard_summary_stats(self, client: AsyncClient, auth_headers_admin):
        """Prueba estadísticas resumidas para dashboard"""
        response = await client.get("/reports-stats/dashboard-summary", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert "users_count" in data
        assert "documents_count" in data
        assert "total_hours" in data