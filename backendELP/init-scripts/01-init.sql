-- Script de inicialización de la base de datos
-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configurar timezone
SET timezone = 'America/Bogota';

-- Mensaje de confirmación
SELECT 'Base de datos inicializada correctamente para Sistema ELP' as status;