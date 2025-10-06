#!/usr/bin/env python3
"""
Database System Settings Configuration
Applies PostgreSQL system-level configurations
"""

import os
import sys
from sqlalchemy import create_engine, text

def configure_postgresql_settings():
    """Configurar settings de PostgreSQL sin transacciones"""
    
    db_url = f"postgresql://{os.getenv('DB_USER', 'postgres')}:{os.getenv('DB_PASSWORD', 'postgres')}@{os.getenv('DB_HOST', 'localhost')}:{os.getenv('DB_PORT', '5432')}/{os.getenv('DB_NAME', 'sistemaelp_db')}"
    
    print("🔧 Configurando settings de PostgreSQL...")
    
    # Settings que requieren autocommit
    system_settings = [
        ("log_statement", "mod", "Log de sentencias modificadoras"),
        ("log_connections", "on", "Log de conexiones"),
        ("log_disconnections", "on", "Log de desconexiones"),
        ("log_min_duration_statement", "1000", "Log de queries lentas"),
        ("shared_buffers", "256MB", "Buffer compartido"),
        ("effective_cache_size", "1GB", "Caché efectivo"),
        ("maintenance_work_mem", "64MB", "Memoria de mantenimiento")
    ]
    
    try:
        engine = create_engine(db_url)
        
        # Usar autocommit para ALTER SYSTEM
        with engine.connect() as conn:
            conn.execution_options(autocommit=True)
            
            applied = 0
            for setting, value, description in system_settings:
                try:
                    # Aplicar configuración
                    alter_sql = f"ALTER SYSTEM SET {setting} = '{value}'"
                    conn.execute(text(alter_sql))
                    print(f"  ✅ {description}")
                    applied += 1
                    
                except Exception as e:
                    print(f"  ⚠️ No se pudo configurar {setting}: {str(e)[:100]}...")
            
            # Recargar configuración
            try:
                conn.execute(text("SELECT pg_reload_conf()"))
                print(f"  🔄 Configuración recargada ({applied}/{len(system_settings)} aplicadas)")
            except Exception as e:
                print(f"  ⚠️ Error recargando configuración: {e}")
    
    except Exception as e:
        print(f"❌ Error general: {e}")

if __name__ == "__main__":
    configure_postgresql_settings()