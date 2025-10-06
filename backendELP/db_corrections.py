#!/usr/bin/env python3
"""
Database Corrections Script for BackendELP System
Implements critical fixes identified in the database audit
"""

import os
import sys
from sqlalchemy import create_engine, text
from datetime import datetime

class DatabaseCorrector:
    def __init__(self):
        self.db_url = self._get_database_url()
        self.engine = create_engine(self.db_url)
        
    def _get_database_url(self):
        """Construir URL de base de datos desde variables de entorno"""
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = os.getenv('DB_PORT', '5432')
        db_user = os.getenv('DB_USER', 'postgres')
        db_password = os.getenv('DB_PASSWORD', 'postgres')
        db_name = os.getenv('DB_NAME', 'sistemaelp_db')
        
        return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    def create_app_user(self):
        """Crear usuario dedicado para la aplicación"""
        print("🔐 Creando usuario dedicado para la aplicación...")
        
        try:
            with self.engine.connect() as conn:
                # Verificar si el usuario ya existe
                check_user = text("""
                    SELECT COUNT(*) FROM pg_roles WHERE rolname = 'elp_app'
                """)
                user_exists = conn.execute(check_user).fetchone()[0] > 0
                
                if user_exists:
                    print("  ⚠️ Usuario elp_app ya existe")
                    return
                
                # Crear usuario
                create_user_sql = text("""
                    CREATE USER elp_app WITH PASSWORD 'elp_secure_app_2024!'
                """)
                conn.execute(create_user_sql)
                
                # Otorgar permisos básicos
                grant_connect = text("GRANT CONNECT ON DATABASE sistemaelp_db TO elp_app")
                conn.execute(grant_connect)
                
                grant_schema = text("GRANT USAGE ON SCHEMA public TO elp_app")
                conn.execute(grant_schema)
                
                # Otorgar permisos en tablas
                grant_tables = text("""
                    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO elp_app
                """)
                conn.execute(grant_tables)
                
                # Otorgar permisos en secuencias
                grant_sequences = text("""
                    GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO elp_app
                """)
                conn.execute(grant_sequences)
                
                conn.commit()
                print("  ✅ Usuario elp_app creado exitosamente")
                print("  📝 Credenciales: usuario=elp_app, password=elp_secure_app_2024!")
                
        except Exception as e:
            print(f"  ❌ Error creando usuario: {e}")
    
    def add_check_constraints(self):
        """Agregar constraints de validación"""
        print("✅ Agregando constraints de validación...")
        
        constraints = [
            {
                "name": "check_hours_positive",
                "table": "hours",
                "condition": "horas_totales >= 0 AND horas_totales <= 24",
                "description": "Validar horas entre 0 y 24"
            },
            {
                "name": "check_email_format",
                "table": "users",
                "condition": "correo_institucional ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'",
                "description": "Validar formato de email institucional"
            },
            {
                "name": "check_dni_format", 
                "table": "users",
                "condition": "dni ~ '^[0-9]{8}$'",
                "description": "Validar formato de DNI (8 dígitos)"
            },
            {
                "name": "check_document_size",
                "table": "documents",
                "condition": "tamaño_archivo > 0",
                "description": "Validar tamaño de archivo positivo"
            }
        ]
        
        try:
            with self.engine.connect() as conn:
                for constraint in constraints:
                    try:
                        # Verificar si el constraint ya existe
                        check_exists = text(f"""
                            SELECT COUNT(*) FROM pg_constraint 
                            WHERE conname = '{constraint['name']}'
                        """)
                        
                        if conn.execute(check_exists).fetchone()[0] > 0:
                            print(f"  ⚠️ Constraint {constraint['name']} ya existe")
                            continue
                        
                        # Crear constraint
                        add_constraint_sql = text(f"""
                            ALTER TABLE {constraint['table']} 
                            ADD CONSTRAINT {constraint['name']} 
                            CHECK ({constraint['condition']})
                        """)
                        
                        conn.execute(add_constraint_sql)
                        print(f"  ✅ {constraint['description']}")
                        
                    except Exception as e:
                        print(f"  ❌ Error en constraint {constraint['name']}: {e}")
                
                conn.commit()
                print("  🎯 Constraints de validación aplicados")
                
        except Exception as e:
            print(f"  ❌ Error general aplicando constraints: {e}")
    
    def configure_security_logging(self):
        """Configurar logging de seguridad"""
        print("📊 Configurando logging de seguridad...")
        
        security_settings = [
            ("log_statement", "mod", "Log de sentencias modificadoras"),
            ("log_connections", "on", "Log de conexiones"),
            ("log_disconnections", "on", "Log de desconexiones"),
            ("log_min_duration_statement", "1000", "Log de queries lentas (>1s)")
        ]
        
        try:
            with self.engine.connect() as conn:
                for setting, value, description in security_settings:
                    try:
                        alter_setting = text(f"ALTER SYSTEM SET {setting} = '{value}'")
                        conn.execute(alter_setting)
                        print(f"  ✅ {description}")
                    except Exception as e:
                        print(f"  ⚠️ No se pudo configurar {setting}: {e}")
                
                # Recargar configuración
                reload_config = text("SELECT pg_reload_conf()")
                conn.execute(reload_config)
                print("  🔄 Configuración recargada")
                
        except Exception as e:
            print(f"  ❌ Error configurando logging: {e}")
    
    def optimize_database_settings(self):
        """Optimizar configuraciones de performance"""
        print("⚡ Optimizando configuraciones de performance...")
        
        performance_settings = [
            ("shared_buffers", "256MB", "Buffer compartido"),
            ("effective_cache_size", "1GB", "Caché efectivo estimado"),
            ("maintenance_work_mem", "64MB", "Memoria para mantenimiento"),
            ("checkpoint_completion_target", "0.9", "Target de checkpoint")
        ]
        
        try:
            with self.engine.connect() as conn:
                for setting, value, description in performance_settings:
                    try:
                        alter_setting = text(f"ALTER SYSTEM SET {setting} = '{value}'")
                        conn.execute(alter_setting)
                        print(f"  ✅ {description}: {value}")
                    except Exception as e:
                        print(f"  ⚠️ No se pudo configurar {setting}: {e}")
                
                # Recargar configuración
                reload_config = text("SELECT pg_reload_conf()")
                conn.execute(reload_config)
                print("  🔄 Configuración de performance aplicada")
                
        except Exception as e:
            print(f"  ❌ Error optimizando configuraciones: {e}")
    
    def create_backup_function(self):
        """Crear función para backups automáticos"""
        print("💾 Configurando función de backup...")
        
        backup_script = '''#!/bin/bash
# Script de backup automatizado para Sistema ELP
# Ejecutar diariamente con cron

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup"
DB_NAME="sistemaelp_db"
DB_USER="postgres"
BACKUP_FILE="$BACKUP_DIR/sistemaelp_$DATE.sql"

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Ejecutar backup
pg_dump -h localhost -U $DB_USER -d $DB_NAME -f $BACKUP_FILE

# Comprimir backup
gzip $BACKUP_FILE

# Limpiar backups antiguos (mantener 7 días)
find $BACKUP_DIR -name "sistemaelp_*.sql.gz" -mtime +7 -delete

echo "Backup completado: $BACKUP_FILE.gz"
'''
        
        try:
            with open('/tmp/backup_db.sh', 'w') as f:
                f.write(backup_script)
            
            os.chmod('/tmp/backup_db.sh', 0o755)
            print("  ✅ Script de backup creado en /tmp/backup_db.sh")
            print("  📝 Para automatizar: crontab -e")
            print("  📝 Agregar línea: 0 2 * * * /tmp/backup_db.sh")
            
        except Exception as e:
            print(f"  ❌ Error creando script de backup: {e}")
    
    def validate_corrections(self):
        """Validar que las correcciones fueron aplicadas"""
        print("🔍 Validando correcciones aplicadas...")
        
        validations = []
        
        try:
            with self.engine.connect() as conn:
                # Verificar usuario de aplicación
                check_app_user = text("SELECT COUNT(*) FROM pg_roles WHERE rolname = 'elp_app'")
                app_user_exists = conn.execute(check_app_user).fetchone()[0] > 0
                validations.append(("Usuario de aplicación", app_user_exists))
                
                # Verificar constraints
                check_constraints = text("""
                    SELECT COUNT(*) FROM pg_constraint 
                    WHERE conname IN ('check_hours_positive', 'check_email_format', 'check_dni_format')
                """)
                constraints_count = conn.execute(check_constraints).fetchone()[0]
                validations.append(("CHECK constraints", constraints_count >= 3))
                
                # Verificar configuración de logging
                check_logging = text("SHOW log_statement")
                log_setting = conn.execute(check_logging).fetchone()[0]
                validations.append(("Logging configurado", log_setting != 'none'))
                
                # Mostrar resultados
                passed = 0
                for validation_name, passed_check in validations:
                    status = "✅" if passed_check else "❌"
                    print(f"  {status} {validation_name}")
                    if passed_check:
                        passed += 1
                
                print(f"\n📊 Validaciones: {passed}/{len(validations)} exitosas")
                
                return passed == len(validations)
                
        except Exception as e:
            print(f"  ❌ Error en validaciones: {e}")
            return False
    
    def apply_all_corrections(self):
        """Aplicar todas las correcciones críticas"""
        print("🚀 Aplicando correcciones críticas de la auditoría DB...")
        print("=" * 60)
        
        corrections = [
            self.create_app_user,
            self.add_check_constraints,
            self.configure_security_logging,
            self.optimize_database_settings,
            self.create_backup_function
        ]
        
        for correction in corrections:
            try:
                correction()
                print()
            except Exception as e:
                print(f"❌ Error en corrección: {e}")
                print()
        
        # Validar correcciones
        print("=" * 60)
        success = self.validate_corrections()
        
        if success:
            print("\n🎉 ¡Todas las correcciones aplicadas exitosamente!")
            print("📝 Próximos pasos:")
            print("   1. Configurar Alembic: alembic init alembic")
            print("   2. Actualizar .env con usuario elp_app")
            print("   3. Reiniciar aplicación para aplicar cambios")
            print("   4. Configurar backup automático en cron")
        else:
            print("\n⚠️ Algunas correcciones requieren atención manual")
        
        return success

def main():
    print("Database Corrections Tool for BackendELP System")
    print("=" * 50)
    
    corrector = DatabaseCorrector()
    success = corrector.apply_all_corrections()
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)