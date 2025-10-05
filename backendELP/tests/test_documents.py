"""
Pruebas de integración para el módulo de documentos
"""
import pytest
from httpx import AsyncClient
import io


class TestDocuments:
    """Pruebas para endpoints de documentos"""

    async def test_upload_document(self, client: AsyncClient, auth_headers_admin):
        """Prueba subir documento"""
        # Crear archivo de prueba
        file_content = b"Contenido de prueba para documento"
        files = {
            "file": ("test_document.txt", io.BytesIO(file_content), "text/plain")
        }
        data = {
            "titulo": "Documento de prueba",
            "tipo_documento": "test",
            "observaciones": "Prueba unitaria"
        }
        
        response = await client.post(
            "/documents/upload", 
            files=files, 
            data=data, 
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        response_data = response.json()
        assert "document_id" in response_data
        assert response_data["message"] == "Documento subido exitosamente"

    async def test_list_documents_admin(self, client: AsyncClient, auth_headers_admin):
        """Prueba listar documentos como admin"""
        response = await client.get("/documents/", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_list_documents_docente(self, client: AsyncClient, auth_headers_docente):
        """Prueba listar documentos como docente"""
        response = await client.get("/documents/", headers=auth_headers_docente)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_upload_invalid_file_type(self, client: AsyncClient, auth_headers_admin):
        """Prueba subir archivo con tipo no permitido"""
        file_content = b"Contenido ejecutable"
        files = {
            "file": ("malicious.exe", io.BytesIO(file_content), "application/exe")
        }
        data = {
            "titulo": "Archivo malicioso",
            "tipo_documento": "test"
        }
        
        response = await client.post(
            "/documents/upload", 
            files=files, 
            data=data, 
            headers=auth_headers_admin
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data

    async def test_upload_large_file(self, client: AsyncClient, auth_headers_admin):
        """Prueba subir archivo demasiado grande"""
        # Crear archivo de 11MB (más del límite de 10MB)
        file_content = b"A" * (11 * 1024 * 1024)
        files = {
            "file": ("large_file.txt", io.BytesIO(file_content), "text/plain")
        }
        data = {
            "titulo": "Archivo grande",
            "tipo_documento": "test"
        }
        
        response = await client.post(
            "/documents/upload", 
            files=files, 
            data=data, 
            headers=auth_headers_admin
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data

    async def test_get_document_info(self, client: AsyncClient, auth_headers_admin):
        """Prueba obtener información de documento"""
        # Primero subir un documento
        file_content = b"Contenido para obtener info"
        files = {
            "file": ("info_test.txt", io.BytesIO(file_content), "text/plain")
        }
        data = {
            "titulo": "Documento info",
            "tipo_documento": "test"
        }
        
        upload_response = await client.post(
            "/documents/upload", 
            files=files, 
            data=data, 
            headers=auth_headers_admin
        )
        document_id = upload_response.json()["document_id"]
        
        # Obtener información del documento
        response = await client.get(f"/documents/{document_id}", headers=auth_headers_admin)
        
        assert response.status_code == 200
        doc_data = response.json()
        assert doc_data["titulo"] == "Documento info"
        assert doc_data["id"] == document_id

    async def test_update_document_metadata(self, client: AsyncClient, auth_headers_admin):
        """Prueba actualizar metadatos de documento"""
        # Primero subir un documento
        file_content = b"Contenido para actualizar"
        files = {
            "file": ("update_test.txt", io.BytesIO(file_content), "text/plain")
        }
        data = {
            "titulo": "Documento original",
            "tipo_documento": "test"
        }
        
        upload_response = await client.post(
            "/documents/upload", 
            files=files, 
            data=data, 
            headers=auth_headers_admin
        )
        document_id = upload_response.json()["document_id"]
        
        # Actualizar metadatos
        update_data = {
            "titulo": "Documento actualizado",
            "observaciones": "Metadatos actualizados"
        }
        
        response = await client.put(
            f"/documents/{document_id}", 
            json=update_data, 
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        doc_data = response.json()
        assert doc_data["titulo"] == "Documento actualizado"
        assert doc_data["observaciones"] == "Metadatos actualizados"

    async def test_delete_document(self, client: AsyncClient, auth_headers_admin):
        """Prueba eliminar documento"""
        # Primero subir un documento
        file_content = b"Contenido para eliminar"
        files = {
            "file": ("delete_test.txt", io.BytesIO(file_content), "text/plain")
        }
        data = {
            "titulo": "Documento a eliminar",
            "tipo_documento": "test"
        }
        
        upload_response = await client.post(
            "/documents/upload", 
            files=files, 
            data=data, 
            headers=auth_headers_admin
        )
        document_id = upload_response.json()["document_id"]
        
        # Eliminar documento
        response = await client.delete(f"/documents/{document_id}", headers=auth_headers_admin)
        
        assert response.status_code == 200
        delete_data = response.json()
        assert "message" in delete_data

    async def test_access_document_without_permission(self, client: AsyncClient, auth_headers_docente):
        """Prueba acceder a documento sin permisos (simulado)"""
        # Intentar acceder a documento inexistente o sin permisos
        response = await client.get("/documents/999", headers=auth_headers_docente)
        
        assert response.status_code == 404