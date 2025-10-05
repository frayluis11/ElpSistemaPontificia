"""
Configuración global para las pruebas del backendELP
"""
import pytest
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import get_db, Base
from app.models.user import User
from app.models.role import Role
from app.core.security import get_password_hash

# Base de datos en memoria para pruebas
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# Configurar engine de prueba
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def event_loop():
    """Crear loop de eventos para pruebas async"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def db_session():
    """
    Crear sesión de base de datos para pruebas
    """
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


def override_get_db():
    """
    Override de la función get_db para usar la base de datos de prueba
    """
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Override dependency
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """
    Cliente HTTP async para pruebas
    """
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def test_roles(db_session):
    """
    Crear roles de prueba
    """
    roles_data = [
        {"nombre_rol": "Docente", "descripcion": "Docente universitario"},
        {"nombre_rol": "RRHH", "descripcion": "Recursos Humanos"},
        {"nombre_rol": "Contabilidad", "descripcion": "Área contable"},
        {"nombre_rol": "Administración", "descripcion": "Administración general"},
        {"nombre_rol": "Área TI", "descripcion": "Tecnologías de información"}
    ]
    
    roles = []
    for role_data in roles_data:
        role = Role(**role_data)
        db_session.add(role)
        roles.append(role)
    
    db_session.commit()
    
    for role in roles:
        db_session.refresh(role)
    
    return roles


@pytest.fixture
def test_users(db_session, test_roles):
    """
    Crear usuarios de prueba
    """
    users_data = [
        {
            "nombre": "Admin",
            "apellido": "Test",
            "email": "admin@test.com",
            "password": get_password_hash("admin123"),
            "rol_id": 4,  # Administración
            "is_active": True
        },
        {
            "nombre": "Docente",
            "apellido": "Test", 
            "email": "docente@test.com",
            "password": get_password_hash("docente123"),
            "rol_id": 1,  # Docente
            "is_active": True
        },
        {
            "nombre": "RRHH",
            "apellido": "Test",
            "email": "rrhh@test.com", 
            "password": get_password_hash("rrhh123"),
            "rol_id": 2,  # RRHH
            "is_active": True
        },
        {
            "nombre": "Contabilidad",
            "apellido": "Test",
            "email": "contabilidad@test.com",
            "password": get_password_hash("conta123"),
            "rol_id": 3,  # Contabilidad
            "is_active": True
        },
        {
            "nombre": "Area TI",
            "apellido": "Test",
            "email": "areati@test.com",
            "password": get_password_hash("ti123"),
            "rol_id": 5,  # Área TI
            "is_active": True
        }
    ]
    
    users = []
    for user_data in users_data:
        user = User(**user_data)
        db_session.add(user)
        users.append(user)
    
    db_session.commit()
    
    for user in users:
        db_session.refresh(user)
    
    return users


@pytest.fixture
async def auth_headers_admin(client: AsyncClient, test_users):
    """Headers de autenticación para usuario admin"""
    login_data = {
        "username": "admin@test.com",
        "password": "admin123"
    }
    response = await client.post("/auth/login", data=login_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def auth_headers_docente(client: AsyncClient, test_users):
    """Headers de autenticación para usuario docente"""
    login_data = {
        "username": "docente@test.com", 
        "password": "docente123"
    }
    response = await client.post("/auth/login", data=login_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def auth_headers_rrhh(client: AsyncClient, test_users):
    """Headers de autenticación para usuario RRHH"""
    login_data = {
        "username": "rrhh@test.com",
        "password": "rrhh123"
    }
    response = await client.post("/auth/login", data=login_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def auth_headers_contabilidad(client: AsyncClient, test_users):
    """Headers de autenticación para usuario contabilidad"""
    login_data = {
        "username": "contabilidad@test.com",
        "password": "conta123"
    }
    response = await client.post("/auth/login", data=login_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def auth_headers_areati(client: AsyncClient, test_users):
    """Headers de autenticación para usuario Área TI"""
    login_data = {
        "username": "areati@test.com",
        "password": "ti123"
    }
    response = await client.post("/auth/login", data=login_data) 
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}