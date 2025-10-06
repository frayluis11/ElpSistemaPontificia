#!/usr/bin/env python3
"""
Database Audit Script for BackendELP System
Comprehensive database structure, integrity and performance audit
"""

import os
import sys
import json
import traceback
from datetime import datetime
from sqlalchemy import create_engine, inspect, text, MetaData
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
import psycopg2
from psycopg2.extras import RealDictCursor

# Agregar el directorio raíz al path para importar modelos
sys.path.append('/app')

from app.models.user import User, Role
from app.models.document import Document
from app.models.hours import Hours

class DatabaseAuditor:
    def __init__(self):
        self.db_url = self._get_database_url()
        self.engine = create_engine(self.db_url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self.inspector = inspect(self.engine)
        self.audit_results = {
            "timestamp": datetime.now().isoformat(),
            "database_info": {},
            "schema_analysis": {},
            "model_comparison": {},
            "foreign_keys": {},
            "indexes": {},
            "constraints": {},
            "data_integrity": {},
            "performance": {},
            "security": {},
            "issues": [],
            "recommendations": []
        }
        
    def _get_database_url(self):
        """Construir URL de base de datos desde variables de entorno"""
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = os.getenv('DB_PORT', '5432')
        db_user = os.getenv('DB_USER', 'postgres')
        db_password = os.getenv('DB_PASSWORD', 'postgres')
        db_name = os.getenv('DB_NAME', 'sistemaelp_db')
        
        return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    def log_issue(self, severity, category, title, description, query=None):
        """Registrar un issue encontrado"""
        issue = {
            "severity": severity,  # HIGH, MEDIUM, LOW
            "category": category,
            "title": title,
            "description": description,
            "query": query
        }
        self.audit_results["issues"].append(issue)
        print(f"🔍 [{severity}] {category}: {title}")
        
    def add_recommendation(self, title, description, priority=1):
        """Agregar recomendación"""
        recommendation = {
            "title": title,
            "description": description,
            "priority": priority  # 1=High, 2=Medium, 3=Low
        }
        self.audit_results["recommendations"].append(recommendation)
        
    def get_database_info(self):
        """Obtener información general de la base de datos"""
        print("📊 Obteniendo información general de la base de datos...")
        
        try:
            with self.engine.connect() as conn:
                # Información de la versión de PostgreSQL
                version_result = conn.execute(text("SELECT version()")).fetchone()
                self.audit_results["database_info"]["postgresql_version"] = version_result[0]
                
                # Información del esquema
                schemas_result = conn.execute(text("""
                    SELECT schema_name FROM information_schema.schemata 
                    WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
                """)).fetchall()
                self.audit_results["database_info"]["schemas"] = [row[0] for row in schemas_result]
                
                # Tamaño de la base de datos
                size_result = conn.execute(text("""
                    SELECT pg_size_pretty(pg_database_size(current_database())) as size
                """)).fetchone()
                self.audit_results["database_info"]["database_size"] = size_result[0]
                
                print(f"✅ PostgreSQL Version: {version_result[0][:50]}...")
                print(f"✅ Database Size: {size_result[0]}")
                
        except Exception as e:
            self.log_issue("HIGH", "CONNECTION", "Database Connection Failed", str(e))
            
    def analyze_schema_structure(self):
        """Analizar estructura completa del esquema"""
        print("🔍 Analizando estructura del esquema...")
        
        try:
            tables = self.inspector.get_table_names()
            self.audit_results["schema_analysis"]["tables"] = {}
            
            for table_name in tables:
                print(f"  📋 Analizando tabla: {table_name}")
                
                # Información de columnas
                columns = self.inspector.get_columns(table_name)
                pk_constraint = self.inspector.get_pk_constraint(table_name)
                
                table_info = {
                    "columns": [],
                    "primary_key": pk_constraint,
                    "row_count": 0
                }
                
                for column in columns:
                    table_info["columns"].append({
                        "name": column["name"],
                        "type": str(column["type"]),
                        "nullable": column["nullable"],
                        "default": column.get("default"),
                        "autoincrement": column.get("autoincrement", False)
                    })
                
                # Contar filas
                try:
                    with self.engine.connect() as conn:
                        count_result = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}")).fetchone()
                        table_info["row_count"] = count_result[0]
                except:
                    table_info["row_count"] = "Error counting"
                
                self.audit_results["schema_analysis"]["tables"][table_name] = table_info
                
            print(f"✅ Analizadas {len(tables)} tablas")
            
        except Exception as e:
            self.log_issue("HIGH", "SCHEMA", "Schema Analysis Failed", str(e))
            
    def compare_models_with_database(self):
        """Comparar modelos SQLAlchemy con estructura real de DB"""
        print("🔄 Comparando modelos SQLAlchemy con base de datos...")
        
        # Mapeo de modelos esperados
        model_mappings = {
            "users": User,
            "roles": Role,
            "documents": Document,
            "hours": Hours
        }
        
        self.audit_results["model_comparison"] = {}
        
        for table_name, model_class in model_mappings.items():
            print(f"  🔍 Verificando modelo: {model_class.__name__} -> {table_name}")
            
            # Verificar si la tabla existe
            if table_name not in self.audit_results["schema_analysis"]["tables"]:
                self.log_issue("HIGH", "MODEL_MISMATCH", 
                             f"Missing Table: {table_name}", 
                             f"Model {model_class.__name__} expects table {table_name} but it doesn't exist")
                continue
                
            # Comparar columnas del modelo con la tabla
            db_columns = {col["name"]: col for col in self.audit_results["schema_analysis"]["tables"][table_name]["columns"]}
            
            # Obtener columnas del modelo (esto requiere inspección del modelo)
            try:
                model_table = model_class.__table__
                model_columns = {col.name: col for col in model_table.columns}
                
                comparison = {
                    "model_columns": list(model_columns.keys()),
                    "db_columns": list(db_columns.keys()),
                    "missing_in_db": [],
                    "missing_in_model": [],
                    "type_mismatches": []
                }
                
                # Verificar columnas faltantes
                for col_name in model_columns:
                    if col_name not in db_columns:
                        comparison["missing_in_db"].append(col_name)
                        self.log_issue("MEDIUM", "MODEL_MISMATCH",
                                     f"Column Missing in DB: {table_name}.{col_name}",
                                     f"Model defines column {col_name} but it's missing in database")
                
                for col_name in db_columns:
                    if col_name not in model_columns:
                        comparison["missing_in_model"].append(col_name)
                        self.log_issue("LOW", "MODEL_MISMATCH",
                                     f"Column Missing in Model: {table_name}.{col_name}",
                                     f"Database has column {col_name} but it's not in model")
                
                self.audit_results["model_comparison"][table_name] = comparison
                
            except Exception as e:
                self.log_issue("MEDIUM", "MODEL_ANALYSIS", 
                             f"Model Analysis Failed: {model_class.__name__}", str(e))
                
    def analyze_foreign_keys(self):
        """Analizar llaves foráneas y relaciones"""
        print("🔗 Analizando llaves foráneas...")
        
        try:
            with self.engine.connect() as conn:
                fk_query = text("""
                    SELECT 
                        tc.table_name AS tabla,
                        kcu.column_name AS columna,
                        ccu.table_name AS referencia_tabla,
                        ccu.column_name AS referencia_columna,
                        rc.update_rule,
                        rc.delete_rule
                    FROM information_schema.table_constraints AS tc
                    JOIN information_schema.key_column_usage AS kcu 
                        ON tc.constraint_name = kcu.constraint_name
                    JOIN information_schema.constraint_column_usage AS ccu 
                        ON ccu.constraint_name = tc.constraint_name
                    JOIN information_schema.referential_constraints AS rc
                        ON tc.constraint_name = rc.constraint_name
                    WHERE constraint_type = 'FOREIGN KEY' 
                        AND tc.table_schema = 'public'
                    ORDER BY tc.table_name, kcu.column_name;
                """)
                
                fk_results = conn.execute(fk_query).fetchall()
                
                self.audit_results["foreign_keys"]["relationships"] = []
                
                for row in fk_results:
                    fk_info = {
                        "table": row[0],
                        "column": row[1],
                        "references_table": row[2],
                        "references_column": row[3],
                        "update_rule": row[4],
                        "delete_rule": row[5]
                    }
                    self.audit_results["foreign_keys"]["relationships"].append(fk_info)
                    print(f"  🔗 {row[0]}.{row[1]} -> {row[2]}.{row[3]} (DEL: {row[5]}, UPD: {row[4]})")
                
                print(f"✅ Encontradas {len(fk_results)} relaciones FK")
                
                # Verificar integridad referencial
                self.check_referential_integrity(conn)
                
        except Exception as e:
            self.log_issue("HIGH", "FOREIGN_KEYS", "FK Analysis Failed", str(e))
            
    def check_referential_integrity(self, conn):
        """Verificar integridad referencial"""
        print("  🔍 Verificando integridad referencial...")
        
        orphan_checks = [
            ("documents", "usuario_id", "users", "id"),
            ("hours", "usuario_id", "users", "id"),
            ("users", "role_id", "roles", "id")
        ]
        
        orphans_found = 0
        
        for child_table, child_col, parent_table, parent_col in orphan_checks:
            try:
                orphan_query = text(f"""
                    SELECT COUNT(*) as orphan_count
                    FROM {child_table} c
                    LEFT JOIN {parent_table} p ON c.{child_col} = p.{parent_col}
                    WHERE p.{parent_col} IS NULL AND c.{child_col} IS NOT NULL
                """)
                
                result = conn.execute(orphan_query).fetchone()
                orphan_count = result[0]
                
                if orphan_count > 0:
                    orphans_found += orphan_count
                    self.log_issue("HIGH", "DATA_INTEGRITY", 
                                 f"Orphaned Records: {child_table}.{child_col}",
                                 f"Found {orphan_count} orphaned records in {child_table}",
                                 orphan_query)
                                 
            except Exception as e:
                print(f"    ❌ Error checking {child_table}.{child_col}: {e}")
                
        if orphans_found == 0:
            print("  ✅ No se encontraron registros huérfanos")
        else:
            print(f"  ⚠️ Encontrados {orphans_found} registros huérfanos")
            
    def analyze_indexes_and_constraints(self):
        """Analizar índices y constraints"""
        print("📊 Analizando índices y constraints...")
        
        try:
            with self.engine.connect() as conn:
                # Obtener índices
                indexes_query = text("""
                    SELECT 
                        schemaname,
                        tablename,
                        indexname,
                        indexdef
                    FROM pg_indexes 
                    WHERE schemaname = 'public'
                    ORDER BY tablename, indexname;
                """)
                
                indexes_result = conn.execute(indexes_query).fetchall()
                self.audit_results["indexes"]["list"] = []
                
                for row in indexes_result:
                    index_info = {
                        "schema": row[0],
                        "table": row[1],
                        "name": row[2],
                        "definition": row[3]
                    }
                    self.audit_results["indexes"]["list"].append(index_info)
                    
                print(f"✅ Encontrados {len(indexes_result)} índices")
                
                # Obtener constraints
                constraints_query = text("""
                    SELECT 
                        conrelid::regclass AS table_name,
                        conname AS constraint_name,
                        contype AS constraint_type,
                        pg_get_constraintdef(oid) AS constraint_definition
                    FROM pg_constraint 
                    WHERE connamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
                    ORDER BY conrelid::regclass, contype;
                """)
                
                constraints_result = conn.execute(constraints_query).fetchall()
                self.audit_results["constraints"]["list"] = []
                
                constraint_types = {'c': 'CHECK', 'f': 'FOREIGN KEY', 'p': 'PRIMARY KEY', 'u': 'UNIQUE'}
                
                for row in constraints_result:
                    constraint_info = {
                        "table": str(row[0]),
                        "name": row[1],
                        "type": constraint_types.get(row[2], row[2]),
                        "definition": row[3]
                    }
                    self.audit_results["constraints"]["list"].append(constraint_info)
                    
                print(f"✅ Encontrados {len(constraints_result)} constraints")
                
        except Exception as e:
            self.log_issue("HIGH", "INDEXES", "Index/Constraint Analysis Failed", str(e))
            
    def check_data_integrity(self):
        """Verificar integridad de datos"""
        print("🔍 Verificando integridad de datos...")
        
        try:
            with self.engine.connect() as conn:
                integrity_checks = []
                
                # Verificar duplicados en campos únicos
                duplicate_checks = [
                    ("users", "nombre_usuario", "Usernames"),
                    ("users", "correo_institucional", "Institutional emails"),
                    ("users", "dni", "DNI numbers")
                ]
                
                for table, column, description in duplicate_checks:
                    try:
                        dup_query = text(f"""
                            SELECT {column}, COUNT(*) as duplicate_count
                            FROM {table}
                            WHERE {column} IS NOT NULL
                            GROUP BY {column}
                            HAVING COUNT(*) > 1
                            LIMIT 5
                        """)
                        
                        dup_result = conn.execute(dup_query).fetchall()
                        
                        if dup_result:
                            duplicates = [{"value": row[0], "count": row[1]} for row in dup_result]
                            integrity_checks.append({
                                "check": f"Duplicate {description}",
                                "status": "FAILED",
                                "details": duplicates
                            })
                            self.log_issue("MEDIUM", "DATA_INTEGRITY",
                                         f"Duplicate {description}",
                                         f"Found duplicate values in {table}.{column}")
                        else:
                            integrity_checks.append({
                                "check": f"Duplicate {description}",
                                "status": "PASSED",
                                "details": []
                            })
                            
                    except Exception as e:
                        integrity_checks.append({
                            "check": f"Duplicate {description}",
                            "status": "ERROR",
                            "details": str(e)
                        })
                
                # Verificar valores nulos en campos críticos
                null_checks = [
                    ("users", "password", "User passwords"),
                    ("users", "nombre_usuario", "Usernames"),
                    ("documents", "titulo", "Document titles")
                ]
                
                for table, column, description in null_checks:
                    try:
                        null_query = text(f"""
                            SELECT COUNT(*) as null_count
                            FROM {table}
                            WHERE {column} IS NULL
                        """)
                        
                        null_result = conn.execute(null_query).fetchone()
                        null_count = null_result[0]
                        
                        if null_count > 0:
                            integrity_checks.append({
                                "check": f"NULL values in {description}",
                                "status": "FAILED",
                                "details": f"{null_count} NULL values found"
                            })
                            self.log_issue("HIGH", "DATA_INTEGRITY",
                                         f"NULL values in {description}",
                                         f"Found {null_count} NULL values in {table}.{column}")
                        else:
                            integrity_checks.append({
                                "check": f"NULL values in {description}",
                                "status": "PASSED",
                                "details": "No NULL values"
                            })
                            
                    except Exception as e:
                        integrity_checks.append({
                            "check": f"NULL values in {description}",
                            "status": "ERROR",
                            "details": str(e)
                        })
                
                self.audit_results["data_integrity"]["checks"] = integrity_checks
                
                passed = len([c for c in integrity_checks if c["status"] == "PASSED"])
                failed = len([c for c in integrity_checks if c["status"] == "FAILED"])
                errors = len([c for c in integrity_checks if c["status"] == "ERROR"])
                
                print(f"✅ Integrity checks - Passed: {passed}, Failed: {failed}, Errors: {errors}")
                
        except Exception as e:
            self.log_issue("HIGH", "DATA_INTEGRITY", "Data Integrity Check Failed", str(e))
            
    def analyze_performance(self):
        """Análisis básico de performance"""
        print("⚡ Analizando performance básica...")
        
        try:
            with self.engine.connect() as conn:
                # Estadísticas de tablas
                stats_query = text("""
                    SELECT 
                        schemaname,
                        tablename,
                        n_tup_ins as inserts,
                        n_tup_upd as updates,
                        n_tup_del as deletes,
                        n_live_tup as live_tuples,
                        n_dead_tup as dead_tuples,
                        last_vacuum,
                        last_autovacuum,
                        last_analyze,
                        last_autoanalyze
                    FROM pg_stat_user_tables
                    ORDER BY n_live_tup DESC;
                """)
                
                stats_result = conn.execute(stats_query).fetchall()
                
                table_stats = []
                for row in stats_result:
                    stat_info = {
                        "schema": row[0],
                        "table": row[1],
                        "inserts": row[2],
                        "updates": row[3],
                        "deletes": row[4],
                        "live_tuples": row[5],
                        "dead_tuples": row[6],
                        "last_vacuum": str(row[7]) if row[7] else None,
                        "last_autovacuum": str(row[8]) if row[8] else None,
                        "last_analyze": str(row[9]) if row[9] else None,
                        "last_autoanalyze": str(row[10]) if row[10] else None
                    }
                    table_stats.append(stat_info)
                    
                    # Verificar si necesita vacuum
                    if row[6] and row[5] and row[6] > (row[5] * 0.2):  # > 20% dead tuples
                        self.log_issue("MEDIUM", "PERFORMANCE", 
                                     f"High Dead Tuples: {row[1]}",
                                     f"Table {row[1]} has {row[6]} dead tuples ({row[5]} live), consider VACUUM")
                
                self.audit_results["performance"]["table_stats"] = table_stats
                
                # Consultas lentas simuladas (ejemplo básico)
                sample_queries = [
                    ("SELECT COUNT(*) FROM users", "Count all users"),
                    ("SELECT COUNT(*) FROM documents", "Count all documents"),
                    ("SELECT COUNT(*) FROM hours", "Count all hours")
                ]
                
                query_performance = []
                for query, description in sample_queries:
                    try:
                        start_time = datetime.now()
                        result = conn.execute(text(query)).fetchone()
                        end_time = datetime.now()
                        duration = (end_time - start_time).total_seconds()
                        
                        query_performance.append({
                            "query": query,
                            "description": description,
                            "duration_seconds": duration,
                            "result": result[0] if result else None
                        })
                        
                        if duration > 1.0:  # Más de 1 segundo
                            self.log_issue("MEDIUM", "PERFORMANCE",
                                         f"Slow Query: {description}",
                                         f"Query took {duration:.2f} seconds: {query}")
                                         
                    except Exception as e:
                        query_performance.append({
                            "query": query,
                            "description": description,
                            "duration_seconds": None,
                            "error": str(e)
                        })
                
                self.audit_results["performance"]["query_samples"] = query_performance
                
                print(f"✅ Analizadas {len(table_stats)} tablas y {len(query_performance)} consultas")
                
        except Exception as e:
            self.log_issue("HIGH", "PERFORMANCE", "Performance Analysis Failed", str(e))
            
    def check_security_configuration(self):
        """Verificar configuración de seguridad"""
        print("🔒 Verificando configuración de seguridad...")
        
        try:
            with self.engine.connect() as conn:
                # Verificar roles y permisos
                roles_query = text("""
                    SELECT 
                        rolname,
                        rolcanlogin,
                        rolcreatedb,
                        rolcreaterole,
                        rolsuper,
                        rolreplication
                    FROM pg_roles
                    WHERE rolname NOT LIKE 'pg_%'
                    ORDER BY rolname;
                """)
                
                roles_result = conn.execute(roles_query).fetchall()
                
                security_roles = []
                for row in roles_result:
                    role_info = {
                        "name": row[0],
                        "can_login": row[1],
                        "can_create_db": row[2],
                        "can_create_role": row[3],
                        "is_superuser": row[4],
                        "can_replicate": row[5]
                    }
                    security_roles.append(role_info)
                    
                    # Verificar roles con privilegios excesivos
                    if row[4] and row[0] not in ['postgres']:  # Superuser que no es postgres
                        self.log_issue("HIGH", "SECURITY",
                                     f"Excessive Privileges: {row[0]}",
                                     f"Role {row[0]} has superuser privileges")
                
                self.audit_results["security"]["database_roles"] = security_roles
                
                # Verificar configuraciones de seguridad
                security_settings = [
                    "ssl",
                    "log_connections",
                    "log_disconnections",
                    "log_statement",
                    "password_encryption"
                ]
                
                settings_info = []
                for setting in security_settings:
                    try:
                        setting_query = text(f"SHOW {setting}")
                        setting_result = conn.execute(setting_query).fetchone()
                        settings_info.append({
                            "setting": setting,
                            "value": setting_result[0] if setting_result else "Not found"
                        })
                    except:
                        settings_info.append({
                            "setting": setting,
                            "value": "Error retrieving"
                        })
                
                self.audit_results["security"]["settings"] = settings_info
                
                print(f"✅ Verificados {len(security_roles)} roles y {len(settings_info)} configuraciones")
                
        except Exception as e:
            self.log_issue("HIGH", "SECURITY", "Security Analysis Failed", str(e))
            
    def generate_recommendations(self):
        """Generar recomendaciones basadas en los hallazgos"""
        print("💡 Generando recomendaciones...")
        
        # Análisis de issues para generar recomendaciones
        high_issues = [i for i in self.audit_results["issues"] if i["severity"] == "HIGH"]
        medium_issues = [i for i in self.audit_results["issues"] if i["severity"] == "MEDIUM"]
        
        if high_issues:
            self.add_recommendation(
                "Critical Issues Resolution",
                f"Resolve {len(high_issues)} critical issues immediately before production deployment",
                priority=1
            )
            
        if medium_issues:
            self.add_recommendation(
                "Performance Optimization",
                f"Address {len(medium_issues)} medium priority issues for optimal performance",
                priority=2
            )
            
        # Recomendaciones específicas basadas en estructura
        tables_count = len(self.audit_results["schema_analysis"].get("tables", {}))
        if tables_count < 4:
            self.add_recommendation(
                "Schema Completeness",
                "Verify all required tables are created according to system requirements",
                priority=1
            )
            
        # Recomendaciones de índices
        indexes_count = len(self.audit_results["indexes"].get("list", []))
        if indexes_count < 10:  # Assuming we need at least some indexes
            self.add_recommendation(
                "Index Optimization",
                "Consider adding indexes on frequently queried columns for better performance",
                priority=2
            )
            
        # Recomendaciones de backup
        self.add_recommendation(
            "Backup Strategy",
            "Implement automated backup strategy with pg_dump and point-in-time recovery",
            priority=2
        )
        
        print(f"✅ Generadas {len(self.audit_results['recommendations'])} recomendaciones")
        
    def run_full_audit(self):
        """Ejecutar auditoría completa"""
        print("🚀 Iniciando auditoría completa de base de datos...")
        print("=" * 60)
        
        try:
            self.get_database_info()
            self.analyze_schema_structure()
            self.compare_models_with_database()
            self.analyze_foreign_keys()
            self.analyze_indexes_and_constraints()
            self.check_data_integrity()
            self.analyze_performance()
            self.check_security_configuration()
            self.generate_recommendations()
            
            # Resumen final
            total_issues = len(self.audit_results["issues"])
            high_issues = len([i for i in self.audit_results["issues"] if i["severity"] == "HIGH"])
            medium_issues = len([i for i in self.audit_results["issues"] if i["severity"] == "MEDIUM"])
            low_issues = len([i for i in self.audit_results["issues"] if i["severity"] == "LOW"])
            
            print("\n" + "=" * 60)
            print("📊 RESUMEN DE AUDITORÍA")
            print("=" * 60)
            print(f"✅ Total de issues encontrados: {total_issues}")
            print(f"🔴 Issues críticos (HIGH): {high_issues}")
            print(f"🟡 Issues medios (MEDIUM): {medium_issues}")
            print(f"🟢 Issues menores (LOW): {low_issues}")
            print(f"💡 Recomendaciones generadas: {len(self.audit_results['recommendations'])}")
            
            # Calcular score de auditoría
            if total_issues == 0:
                score = 10.0
            else:
                penalty = (high_issues * 3) + (medium_issues * 2) + (low_issues * 1)
                score = max(0, 10.0 - (penalty * 0.5))
            
            print(f"🎯 Puntuación de auditoría: {score:.1f}/10.0")
            
            if score >= 9.0:
                print("🟢 Estado: EXCELENTE - Base de datos lista para producción")
            elif score >= 7.0:
                print("🟡 Estado: BUENO - Algunos ajustes recomendados")
            elif score >= 5.0:
                print("🟠 Estado: REGULAR - Requiere mejoras antes de producción")
            else:
                print("🔴 Estado: CRÍTICO - Requiere correcciones inmediatas")
                
            return self.audit_results
            
        except Exception as e:
            print(f"\n❌ Error durante la auditoría: {str(e)}")
            print(traceback.format_exc())
            self.log_issue("HIGH", "AUDIT", "Audit Execution Failed", str(e))
            return self.audit_results

def main():
    """Función principal"""
    print("Database Audit Tool for BackendELP System")
    print("=" * 50)
    
    auditor = DatabaseAuditor()
    results = auditor.run_full_audit()
    
    # Guardar resultados en archivo JSON
    output_file = "/app/db_audit_results.json"
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False, default=str)
        print(f"\n💾 Resultados guardados en: {output_file}")
    except Exception as e:
        print(f"\n❌ Error guardando resultados: {e}")
    
    return len([i for i in results["issues"] if i["severity"] == "HIGH"]) == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)