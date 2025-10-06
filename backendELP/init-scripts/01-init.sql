-- Script de inicialización de la base de datos Sistema ELP
-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configurar timezone
SET timezone = 'America/Bogota';

-- Crear tablas principales del sistema
-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    dni VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo_institucional VARCHAR(255) NOT NULL UNIQUE,
    contraseña_hash VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    rol_id INTEGER REFERENCES roles(id),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de documentos
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    area_responsable VARCHAR(100),
    propietario_id INTEGER REFERENCES users(id),
    tipo_documento VARCHAR(50),
    archivo_nombre VARCHAR(255),
    archivo_path VARCHAR(500),
    archivo_hash VARCHAR(255),
    archivo_tamaño BIGINT,
    version INTEGER DEFAULT 1,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de horas de trabajo
CREATE TABLE IF NOT EXISTS hours (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES users(id) NOT NULL,
    fecha DATE NOT NULL,
    horas_totales FLOAT CHECK (horas_totales >= 0 AND horas_totales <= 24) NOT NULL,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, fecha)
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_users_dni ON users(dni);
CREATE INDEX IF NOT EXISTS idx_users_correo ON users(correo_institucional);
CREATE INDEX IF NOT EXISTS idx_users_rol ON users(rol_id);
CREATE INDEX IF NOT EXISTS idx_documents_propietario ON documents(propietario_id);
CREATE INDEX IF NOT EXISTS idx_documents_categoria ON documents(categoria);
CREATE INDEX IF NOT EXISTS idx_hours_usuario ON hours(usuario_id);
CREATE INDEX IF NOT EXISTS idx_hours_fecha ON hours(fecha);

-- Insertar roles predeterminados
INSERT INTO roles (nombre_rol, descripcion) VALUES 
    ('Docente', 'Personal docente de la institución'),
    ('RRHH', 'Recursos Humanos - Gestión de personal'),
    ('Contabilidad', 'Área de contabilidad y finanzas'),
    ('Administración', 'Administración general'),
    ('Área TI', 'Tecnologías de la Información - Gestión del sistema')
ON CONFLICT (nombre_rol) DO NOTHING;

-- Crear usuario administrador por defecto
-- Contraseña: admin123 (hash bcrypt)
INSERT INTO users (dni, nombre, apellido, correo_institucional, contraseña_hash, rol_id, activo)
SELECT 
    '12345678',
    'Administrador',
    'Sistema',
    'admin@pontificia.edu.co',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBRRxlHEqk4d5G',
    r.id,
    TRUE
FROM roles r 
WHERE r.nombre_rol = 'Área TI'
ON CONFLICT (dni) DO NOTHING;

-- Actualizar función de timestamp automático
CREATE OR REPLACE FUNCTION update_updated_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para actualización automática de timestamps
DROP TRIGGER IF EXISTS update_users_timestamp ON users;
CREATE TRIGGER update_users_timestamp 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_timestamp();

DROP TRIGGER IF EXISTS update_roles_timestamp ON roles;
CREATE TRIGGER update_roles_timestamp 
    BEFORE UPDATE ON roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_timestamp();

DROP TRIGGER IF EXISTS update_documents_timestamp ON documents;
CREATE TRIGGER update_documents_timestamp 
    BEFORE UPDATE ON documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_timestamp();

DROP TRIGGER IF EXISTS update_hours_timestamp ON hours;
CREATE TRIGGER update_hours_timestamp 
    BEFORE UPDATE ON hours 
    FOR EACH ROW EXECUTE FUNCTION update_updated_timestamp();

-- Mensaje de confirmación
SELECT 'Base de datos inicializada correctamente para Sistema ELP' as status;