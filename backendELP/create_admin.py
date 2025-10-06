#!/usr/bin/env python3
"""
Script para crear usuario administrador usando bcrypt directamente
"""
import bcrypt
import json

# Generar hash
password = 'admin123'
salt = bcrypt.gensalt()
hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
hash_str = hashed.decode('utf-8')

print(f"Hash generado: {hash_str}")

# Crear SQL
sql = f"""INSERT INTO users (nombre, apellido, dni, correo_institucional, contraseña_hash, rol_id) 
VALUES ('Admin', 'Sistema', '12345678', 'admin@pontificia.edu', '{hash_str}', 5);"""

print("SQL a ejecutar:")
print(sql)

# Guardar en archivo
with open('/tmp/create_admin_user.sql', 'w') as f:
    f.write(sql)
    
print("Archivo SQL creado en /tmp/create_admin_user.sql")