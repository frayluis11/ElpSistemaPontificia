#!/usr/bin/env python3
"""
Database Audit Script for BackendELP System (Standalone Version)
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
            "alembic_status": {},
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
            "query": query,
            "timestamp": datetime.now().isoformat()
        }
        self.audit_results["issues"].append(issue)
        print(f"🔍 [{severity}] {category}: {title}")
        
    def add_recommendation(self, title, description, priority=1):
        """Agregar recomendación"""
        recommendation = {
            "title": title,
            "description": description,
            "priority": priority,  # 1=High, 2=Medium, 3=Low
            "timestamp": datetime.now().isoformat()
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
                    ORDER BY schema_name
                """)).fetchall()
                self.audit_results["database_info"]["schemas"] = [row[0] for row in schemas_result]
                
                # Tamaño de la base de datos
                size_result = conn.execute(text("""
                    SELECT pg_size_pretty(pg_database_size(current_database())) as size
                """)).fetchone()
                self.audit_results["database_info"]["database_size"] = size_result[0]
                
                # Configuración importante
                config_result = conn.execute(text("""
                    SELECT name, setting, unit, context 
                    FROM pg_settings 
                    WHERE name IN ('max_connections', 'shared_buffers', 'effective_cache_size', 
                                  'maintenance_work_mem', 'checkpoint_completion_target',
                                  'wal_buffers', 'default_statistics_target')
                    ORDER BY name
                """)).fetchall()
                
                config_info = {}
                for row in config_result:
                    config_info[row[0]] = {
                        "value": row[1],
                        "unit": row[2],
                        "context": row[3]
                    }
                self.audit_results["database_info"]["configuration"] = config_info
                
                print(f"✅ PostgreSQL Version: {version_result[0][:50]}...")
                print(f"✅ Database Size: {size_result[0]}")
                print(f"✅ Schemas found: {', '.join(self.audit_results['database_info']['schemas'])}")
                
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
                unique_constraints = self.inspector.get_unique_constraints(table_name)
                
                table_info = {
                    "columns": [],
                    "primary_key": pk_constraint,
                    "unique_constraints": unique_constraints,
                    "row_count": 0,
                    "table_size": "N/A"
                }
                
                for column in columns:
                    table_info["columns"].append({
                        "name": column["name"],
                        "type": str(column["type"]),
                        "nullable": column["nullable"],
                        "default": column.get("default"),
                        "autoincrement": column.get("autoincrement", False)
                    })
                
                # Contar filas y obtener tamaño
                try:
                    with self.engine.connect() as conn:
                        count_result = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}")).fetchone()
                        table_info["row_count"] = count_result[0]
                        
                        size_result = conn.execute(text(f"""
                            SELECT pg_size_pretty(pg_total_relation_size('{table_name}')) as size
                        """)).fetchone()
                        table_info["table_size"] = size_result[0]
                        
                except Exception as e:
                    table_info["row_count"] = f"Error: {str(e)}"
                    table_info["table_size"] = "Error"
                
                self.audit_results["schema_analysis"]["tables"][table_name] = table_info
            
            # Verificar tablas esperadas del sistema
            expected_tables = ["users", "roles", "documents", "hours"]
            existing_tables = set(tables)
            missing_tables = set(expected_tables) - existing_tables
            
            if missing_tables:
                self.log_issue("HIGH", "SCHEMA", "Missing Tables", 
                             f"Expected tables not found: {', '.join(missing_tables)}")
            
            print(f"✅ Analizadas {len(tables)} tablas")
            
        except Exception as e:
            self.log_issue("HIGH", "SCHEMA", "Schema Analysis Failed", str(e))
            
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
                        rc.delete_rule,
                        tc.constraint_name
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
                        "delete_rule": row[5],
                        "constraint_name": row[6]
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
        
        # Obtener automáticamente las FK para verificar
        fk_relationships = self.audit_results["foreign_keys"]["relationships"]
        orphans_found = 0
        
        for fk in fk_relationships:
            try:
                orphan_query = text(f"""
                    SELECT COUNT(*) as orphan_count
                    FROM {fk['table']} c
                    LEFT JOIN {fk['references_table']} p ON c.{fk['column']} = p.{fk['references_column']}
                    WHERE p.{fk['references_column']} IS NULL AND c.{fk['column']} IS NOT NULL
                """)
                
                result = conn.execute(orphan_query).fetchone()
                orphan_count = result[0]
                
                if orphan_count > 0:
                    orphans_found += orphan_count
                    self.log_issue("HIGH", "DATA_INTEGRITY", 
                                 f"Orphaned Records: {fk['table']}.{fk['column']}",
                                 f"Found {orphan_count} orphaned records in {fk['table']} referencing {fk['references_table']}",
                                 str(orphan_query))
                    print(f"    ⚠️ {orphan_count} orphans in {fk['table']}.{fk['column']}")
                                 
            except Exception as e:
                print(f"    ❌ Error checking {fk['table']}.{fk['column']}: {e}")
                
        if orphans_found == 0:
            print("  ✅ No se encontraron registros huérfanos")
        else:
            print(f"  ⚠️ Encontrados {orphans_found} registros huérfanos en total")
            
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
                        indexdef,
                        pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
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
                        "definition": row[3],
                        "size": row[4]
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
                
                constraint_types = {'c': 'CHECK', 'f': 'FOREIGN KEY', 'p': 'PRIMARY KEY', 'u': 'UNIQUE', 'x': 'EXCLUDE'}
                
                for row in constraints_result:
                    constraint_info = {
                        "table": str(row[0]),
                        "name": row[1],
                        "type": constraint_types.get(row[2], row[2]),
                        "definition": row[3]
                    }
                    self.audit_results["constraints"]["list"].append(constraint_info)
                    
                print(f"✅ Encontrados {len(constraints_result)} constraints")
                
                # Verificar constraints importantes
                self.check_important_constraints(conn)
                
        except Exception as e:
            self.log_issue("HIGH", "INDEXES", "Index/Constraint Analysis Failed", str(e))
            
    def check_important_constraints(self, conn):
        """Verificar constraints importantes"""
        print("  🔍 Verificando constraints críticos...")
        
        # Verificar constraints NOT NULL en campos importantes
        critical_not_null_checks = [
            ("users", "nombre_usuario"),
            ("users", "password"),
            ("users", "correo_institucional"),
            ("documents", "titulo"),
            ("roles", "nombre")
        ]
        
        for table, column in critical_not_null_checks:
            try:
                null_check = text(f"""
                    SELECT column_name, is_nullable 
                    FROM information_schema.columns 
                    WHERE table_name = '{table}' AND column_name = '{column}'
                """)
                result = conn.execute(null_check).fetchone()
                
                if result and result[1] == 'YES':
                    self.log_issue("MEDIUM", "CONSTRAINTS", 
                                 f"Missing NOT NULL: {table}.{column}",
                                 f"Critical field {table}.{column} allows NULL values")
                    
            except Exception as e:
                print(f"    ❌ Error checking NOT NULL for {table}.{column}: {e}")
                
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
                    ("users", "dni", "DNI numbers"),
                    ("roles", "nombre", "Role names")
                ]
                
                for table, column, description in duplicate_checks:
                    try:
                        # Primero verificar si la tabla y columna existen
                        table_exists = text(f"""
                            SELECT COUNT(*) FROM information_schema.tables 
                            WHERE table_name = '{table}' AND table_schema = 'public'
                        """)
                        
                        if conn.execute(table_exists).fetchone()[0] == 0:
                            continue
                            
                        column_exists = text(f"""
                            SELECT COUNT(*) FROM information_schema.columns 
                            WHERE table_name = '{table}' AND column_name = '{column}' AND table_schema = 'public'
                        """)
                        
                        if conn.execute(column_exists).fetchone()[0] == 0:
                            continue
                        
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
                                         f"Found duplicate values in {table}.{column}: {len(dup_result)} groups")
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
                    ("documents", "titulo", "Document titles"),
                    ("roles", "nombre", "Role names")
                ]
                
                for table, column, description in null_checks:
                    try:
                        # Verificar existencia de tabla y columna
                        table_exists = text(f"""
                            SELECT COUNT(*) FROM information_schema.tables 
                            WHERE table_name = '{table}' AND table_schema = 'public'
                        """)
                        
                        if conn.execute(table_exists).fetchone()[0] == 0:
                            continue
                            
                        column_exists = text(f"""
                            SELECT COUNT(*) FROM information_schema.columns 
                            WHERE table_name = '{table}' AND column_name = '{column}' AND table_schema = 'public'
                        """)
                        
                        if conn.execute(column_exists).fetchone()[0] == 0:
                            continue
                        
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
                
                # Verificar integridad de fechas
                date_checks = [
                    ("users", "created_at", "User creation dates"),
                    ("documents", "fecha_emision", "Document emission dates")
                ]
                
                for table, column, description in date_checks:
                    try:
                        # Verificar existencia
                        table_exists = text(f"""
                            SELECT COUNT(*) FROM information_schema.tables 
                            WHERE table_name = '{table}' AND table_schema = 'public'
                        """)
                        
                        if conn.execute(table_exists).fetchone()[0] == 0:
                            continue
                            
                        column_exists = text(f"""
                            SELECT COUNT(*) FROM information_schema.columns 
                            WHERE table_name = '{table}' AND column_name = '{column}' AND table_schema = 'public'
                        """)
                        
                        if conn.execute(column_exists).fetchone()[0] == 0:
                            continue
                        
                        future_dates_query = text(f"""
                            SELECT COUNT(*) as future_count
                            FROM {table}
                            WHERE {column} > NOW() + INTERVAL '1 day'
                        """)
                        
                        future_result = conn.execute(future_dates_query).fetchone()
                        future_count = future_result[0]
                        
                        if future_count > 0:
                            integrity_checks.append({
                                "check": f"Future dates in {description}",
                                "status": "WARNING",
                                "details": f"{future_count} future dates found"
                            })
                            self.log_issue("LOW", "DATA_INTEGRITY",
                                         f"Future dates in {description}",
                                         f"Found {future_count} future dates in {table}.{column}")
                        else:
                            integrity_checks.append({
                                "check": f"Future dates in {description}",
                                "status": "PASSED",
                                "details": "No future dates"
                            })
                            
                    except Exception as e:
                        integrity_checks.append({
                            "check": f"Future dates in {description}",
                            "status": "ERROR",
                            "details": str(e)
                        })
                
                self.audit_results["data_integrity"]["checks"] = integrity_checks
                
                passed = len([c for c in integrity_checks if c["status"] == "PASSED"])
                failed = len([c for c in integrity_checks if c["status"] == "FAILED"])
                warnings = len([c for c in integrity_checks if c["status"] == "WARNING"])
                errors = len([c for c in integrity_checks if c["status"] == "ERROR"])
                
                print(f"✅ Integrity checks - Passed: {passed}, Failed: {failed}, Warnings: {warnings}, Errors: {errors}")
                
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
                    WHERE schemaname = 'public'
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
                
                # Análisis de queries lentas (simulación con queries básicas)
                sample_queries = [
                    ("SELECT COUNT(*) FROM users", "Count all users"),
                    ("SELECT COUNT(*) FROM documents", "Count all documents"),
                    ("SELECT COUNT(*) FROM hours", "Count all hours"),
                    ("SELECT COUNT(*) FROM roles", "Count all roles")
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
                
                # Verificar configuración de performance
                perf_settings = text("""
                    SELECT name, setting, unit 
                    FROM pg_settings 
                    WHERE name IN ('shared_buffers', 'effective_cache_size', 'maintenance_work_mem',
                                  'checkpoint_completion_target', 'random_page_cost', 'seq_page_cost')
                    ORDER BY name
                """)
                
                perf_result = conn.execute(perf_settings).fetchall()
                performance_config = {}
                for row in perf_result:
                    performance_config[row[0]] = {
                        "value": row[1],
                        "unit": row[2] if row[2] else ""
                    }
                
                self.audit_results["performance"]["configuration"] = performance_config
                
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
                        rolreplication,
                        rolconnlimit
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
                        "can_replicate": row[5],
                        "connection_limit": row[6]
                    }
                    security_roles.append(role_info)
                    
                    # Verificar roles con privilegios excesivos
                    if row[4] and row[0] not in ['postgres']:  # Superuser que no es postgres
                        self.log_issue("HIGH", "SECURITY",
                                     f"Excessive Privileges: {row[0]}",
                                     f"Role {row[0]} has superuser privileges")
                    
                    if row[1] and row[6] == -1:  # Sin límite de conexiones para usuarios login
                        self.log_issue("LOW", "SECURITY",
                                     f"Unlimited Connections: {row[0]}",
                                     f"Role {row[0]} has no connection limit")
                
                self.audit_results["security"]["database_roles"] = security_roles
                
                # Verificar configuraciones de seguridad
                security_settings = [
                    "ssl", "log_connections", "log_disconnections", "log_statement",
                    "password_encryption", "log_min_duration_statement", "log_checkpoints"
                ]
                
                settings_info = []
                for setting in security_settings:
                    try:
                        setting_query = text(f"SHOW {setting}")
                        setting_result = conn.execute(setting_query).fetchone()
                        value = setting_result[0] if setting_result else "Not found"
                        settings_info.append({
                            "setting": setting,
                            "value": value
                        })
                        
                        # Recomendaciones de seguridad
                        if setting == "log_statement" and value == "none":
                            self.log_issue("LOW", "SECURITY",
                                         "Statement Logging Disabled",
                                         "Consider enabling log_statement for security monitoring")
                                         
                    except Exception as e:
                        settings_info.append({
                            "setting": setting,
                            "value": f"Error: {str(e)}"
                        })
                
                self.audit_results["security"]["settings"] = settings_info
                
                # Verificar permisos en tablas
                table_perms_query = text("""
                    SELECT grantee, table_schema, table_name, privilege_type
                    FROM information_schema.role_table_grants
                    WHERE table_schema = 'public'
                    ORDER BY grantee, table_name, privilege_type
                """)
                
                perms_result = conn.execute(table_perms_query).fetchall()
                table_permissions = []
                for row in perms_result:
                    table_permissions.append({
                        "grantee": row[0],
                        "schema": row[1],
                        "table": row[2],
                        "privilege": row[3]
                    })
                
                self.audit_results["security"]["table_permissions"] = table_permissions
                
                print(f"✅ Verificados {len(security_roles)} roles, {len(settings_info)} configuraciones, {len(table_permissions)} permisos")
                
        except Exception as e:
            self.log_issue("HIGH", "SECURITY", "Security Analysis Failed", str(e))
            
    def check_alembic_status(self):
        """Verificar estado de migraciones Alembic"""
        print("🔄 Verificando estado de migraciones Alembic...")
        
        try:
            with self.engine.connect() as conn:
                # Verificar si existe la tabla alembic_version
                alembic_table_query = text("""
                    SELECT COUNT(*) FROM information_schema.tables 
                    WHERE table_name = 'alembic_version' AND table_schema = 'public'
                """)
                
                has_alembic_table = conn.execute(alembic_table_query).fetchone()[0] > 0
                
                if has_alembic_table:
                    # Obtener versión actual
                    version_query = text("SELECT version_num FROM alembic_version")
                    version_result = conn.execute(version_query).fetchone()
                    current_version = version_result[0] if version_result else None
                    
                    self.audit_results["alembic_status"] = {
                        "has_alembic_table": True,
                        "current_version": current_version,
                        "status": "CONFIGURED"
                    }
                    
                    print(f"✅ Alembic configurado, versión actual: {current_version}")
                    
                else:
                    self.audit_results["alembic_status"] = {
                        "has_alembic_table": False,
                        "current_version": None,
                        "status": "NOT_CONFIGURED"
                    }
                    
                    self.log_issue("MEDIUM", "MIGRATIONS", "Alembic Not Configured",
                                 "Alembic migration system is not initialized")
                    print("⚠️ Alembic no está configurado")
                    
        except Exception as e:
            self.audit_results["alembic_status"] = {
                "has_alembic_table": False,
                "current_version": None,
                "status": "ERROR",
                "error": str(e)
            }
            self.log_issue("HIGH", "MIGRATIONS", "Alembic Status Check Failed", str(e))
            
    def generate_recommendations(self):
        """Generar recomendaciones basadas en los hallazgos"""
        print("💡 Generando recomendaciones...")
        
        # Análisis de issues para generar recomendaciones
        high_issues = [i for i in self.audit_results["issues"] if i["severity"] == "HIGH"]
        medium_issues = [i for i in self.audit_results["issues"] if i["severity"] == "MEDIUM"]
        low_issues = [i for i in self.audit_results["issues"] if i["severity"] == "LOW"]
        
        if high_issues:
            self.add_recommendation(
                "Critical Issues Resolution",
                f"Resolve {len(high_issues)} critical issues immediately before production deployment. " +
                "These issues may affect system stability and data integrity.",
                priority=1
            )
            
        if medium_issues:
            self.add_recommendation(
                "Performance and Security Optimization",
                f"Address {len(medium_issues)} medium priority issues for optimal performance and security. " +
                "These should be resolved in the next maintenance window.",
                priority=2
            )
            
        if low_issues:
            self.add_recommendation(
                "Minor Improvements",
                f"Consider addressing {len(low_issues)} low priority issues for best practices compliance.",
                priority=3
            )
            
        # Recomendaciones específicas basadas en estructura
        tables_analysis = self.audit_results["schema_analysis"].get("tables", {})
        if len(tables_analysis) < 4:
            self.add_recommendation(
                "Schema Completeness Check",
                "Verify all required tables (users, roles, documents, hours) are created according to system requirements. " +
                "Missing tables may indicate incomplete database setup.",
                priority=1
            )
            
        # Recomendaciones de índices
        indexes_count = len(self.audit_results["indexes"].get("list", []))
        if indexes_count < 8:  # Assuming we need at least primary keys + some FKs
            self.add_recommendation(
                "Index Optimization",
                "Consider adding indexes on frequently queried foreign key columns and search fields " +
                "(e.g., users.correo_institucional, documents.usuario_id, hours.usuario_id) for better performance.",
                priority=2
            )
            
        # Recomendaciones de constraints
        constraints_analysis = self.audit_results["constraints"].get("list", [])
        check_constraints = [c for c in constraints_analysis if c["type"] == "CHECK"]
        if len(check_constraints) == 0:
            self.add_recommendation(
                "Data Validation Constraints",
                "Implement CHECK constraints for data validation " +
                "(e.g., hours.total_horas >= 0, users.correo_institucional format validation).",
                priority=2
            )
            
        # Recomendaciones de seguridad
        security_roles = self.audit_results["security"].get("database_roles", [])
        app_roles = [r for r in security_roles if r["name"] not in ["postgres", "root"]]
        if len(app_roles) == 0:
            self.add_recommendation(
                "Database User Security",
                "Create dedicated database user for the application with minimal required privileges. " +
                "Avoid using superuser accounts for application connections.",
                priority=1
            )
            
        # Recomendaciones de backup y mantenimiento
        self.add_recommendation(
            "Backup and Maintenance Strategy",
            "Implement automated backup strategy with pg_dump daily backups and WAL archiving for point-in-time recovery. " +
            "Set up monitoring for VACUUM and ANALYZE operations.",
            priority=2
        )
        
        # Recomendaciones de monitoreo
        self.add_recommendation(
            "Database Monitoring",
            "Implement monitoring for database performance metrics, connection counts, slow queries, " +
            "and disk space usage. Consider tools like pg_stat_statements for query analysis.",
            priority=3
        )
        
        # Recomendaciones de Alembic
        if not self.audit_results["alembic_status"].get("has_alembic_table", False):
            self.add_recommendation(
                "Migration System Setup",
                "Initialize Alembic migration system to manage database schema changes systematically. " +
                "This is essential for production deployments and team collaboration.",
                priority=1
            )
        
        print(f"✅ Generadas {len(self.audit_results['recommendations'])} recomendaciones")
        
    def run_full_audit(self):
        """Ejecutar auditoría completa"""
        print("🚀 Iniciando auditoría completa de base de datos...")
        print("=" * 70)
        
        try:
            # Ejecutar todas las verificaciones
            self.get_database_info()
            self.analyze_schema_structure()
            self.analyze_foreign_keys()
            self.analyze_indexes_and_constraints()
            self.check_data_integrity()
            self.analyze_performance()
            self.check_security_configuration()
            self.check_alembic_status()
            self.generate_recommendations()
            
            # Generar resumen final
            total_issues = len(self.audit_results["issues"])
            high_issues = len([i for i in self.audit_results["issues"] if i["severity"] == "HIGH"])
            medium_issues = len([i for i in self.audit_results["issues"] if i["severity"] == "MEDIUM"])
            low_issues = len([i for i in self.audit_results["issues"] if i["severity"] == "LOW"])
            
            print("\n" + "=" * 70)
            print("📊 RESUMEN DE AUDITORÍA DE BASE DE DATOS")
            print("=" * 70)
            
            # Información general
            db_info = self.audit_results["database_info"]
            print(f"🏢 Base de datos: {db_info.get('database_size', 'N/A')}")
            print(f"📊 Tablas analizadas: {len(self.audit_results['schema_analysis'].get('tables', {}))}")
            print(f"🔗 Relaciones FK: {len(self.audit_results['foreign_keys'].get('relationships', []))}")
            print(f"📈 Índices encontrados: {len(self.audit_results['indexes'].get('list', []))}")
            print(f"🔒 Roles de BD: {len(self.audit_results['security'].get('database_roles', []))}")
            
            print(f"\n🔍 Issues encontrados:")
            print(f"  🔴 Críticos (HIGH): {high_issues}")
            print(f"  🟡 Medios (MEDIUM): {medium_issues}")
            print(f"  🟢 Menores (LOW): {low_issues}")
            print(f"  📋 Total: {total_issues}")
            
            print(f"\n💡 Recomendaciones: {len(self.audit_results['recommendations'])}")
            
            # Mostrar top issues por categoría
            if self.audit_results["issues"]:
                print(f"\n🎯 Top Issues por Categoría:")
                categories = {}
                for issue in self.audit_results["issues"]:
                    cat = issue["category"]
                    if cat not in categories:
                        categories[cat] = {"high": 0, "medium": 0, "low": 0}
                    categories[cat][issue["severity"].lower()] += 1
                
                for cat, counts in categories.items():
                    total_cat = sum(counts.values())
                    print(f"  📂 {cat}: {total_cat} issues (H:{counts['high']}, M:{counts['medium']}, L:{counts['low']})")
            
            # Calcular score de auditoría
            if total_issues == 0:
                score = 10.0
            else:
                # Penalización ponderada por severidad
                penalty = (high_issues * 2.0) + (medium_issues * 1.0) + (low_issues * 0.3)
                score = max(0, 10.0 - penalty)
            
            print(f"\n🎯 Puntuación de Auditoría de BD: {score:.1f}/10.0")
            
            # Status de la base de datos
            if score >= 9.0:
                status = "🟢 EXCELENTE - Base de datos optimizada para producción"
            elif score >= 7.0:
                status = "🟡 BUENO - Algunos ajustes recomendados antes de producción"
            elif score >= 5.0:
                status = "🟠 REGULAR - Requiere mejoras significativas"
            else:
                status = "🔴 CRÍTICO - Requiere correcciones inmediatas"
                
            print(f"📊 Estado: {status}")
            
            # Recomendaciones prioritarias
            if self.audit_results["recommendations"]:
                high_priority_recs = [r for r in self.audit_results["recommendations"] if r["priority"] == 1]
                if high_priority_recs:
                    print(f"\n⚠️ Recomendaciones Prioritarias:")
                    for rec in high_priority_recs[:3]:  # Top 3
                        print(f"  • {rec['title']}")
            
            return self.audit_results
            
        except Exception as e:
            print(f"\n❌ Error durante la auditoría: {str(e)}")
            print(traceback.format_exc())
            self.log_issue("HIGH", "AUDIT", "Audit Execution Failed", str(e))
            return self.audit_results

def main():
    """Función principal"""
    print("Database Comprehensive Audit Tool for BackendELP System")
    print("=" * 60)
    
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
    
    # Retornar código de salida basado en issues críticos
    critical_issues = len([i for i in results["issues"] if i["severity"] == "HIGH"])
    return critical_issues == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)