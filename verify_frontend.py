#!/usr/bin/env python3
"""
Frontend ELP Status Verification Script
Verifica el estado completo del frontend y genera reporte
"""

import os
import json
import subprocess
from pathlib import Path

def check_frontend_status():
    """Verificar estado completo del frontend"""
    frontend_path = Path("frontendELP")
    
    print("🎨 VERIFICACIÓN DEL ESTADO DEL FRONTEND ELP")
    print("=" * 50)
    
    # Verificar estructura de directorios
    print("📁 Verificando estructura de directorios...")
    required_dirs = [
        "src", "src/components", "src/pages", "src/services", 
        "src/hooks", "src/context", "src/layouts", "src/utils",
        "src/components/auth", "src/components/ui", "src/pages/dashboards"
    ]
    
    missing_dirs = []
    existing_dirs = []
    
    for dir_path in required_dirs:
        full_path = frontend_path / dir_path
        if full_path.exists():
            existing_dirs.append(dir_path)
            print(f"  ✅ {dir_path}")
        else:
            missing_dirs.append(dir_path)
            print(f"  ❌ {dir_path}")
    
    # Verificar archivos clave
    print("\n📄 Verificando archivos clave...")
    key_files = [
        "package.json", "tailwind.config.js", "vite.config.js",
        "src/main.jsx", "src/App.jsx", "src/index.css",
        "src/services/api.js"
    ]
    
    missing_files = []
    existing_files = []
    
    for file_path in key_files:
        full_path = frontend_path / file_path
        if full_path.exists():
            existing_files.append(file_path)
            print(f"  ✅ {file_path}")
        else:
            missing_files.append(file_path)
            print(f"  ❌ {file_path}")
    
    # Verificar package.json y dependencias
    print("\n📦 Verificando dependencias...")
    package_json_path = frontend_path / "package.json"
    
    if package_json_path.exists():
        try:
            with open(package_json_path, 'r', encoding='utf-8') as f:
                package_data = json.load(f)
            
            dependencies = package_data.get('dependencies', {})
            dev_dependencies = package_data.get('devDependencies', {})
            
            key_deps = [
                'react', 'react-dom', 'react-router-dom', 'axios',
                'tailwindcss', 'vite', '@vitejs/plugin-react'
            ]
            
            for dep in key_deps:
                if dep in dependencies or dep in dev_dependencies:
                    version = dependencies.get(dep) or dev_dependencies.get(dep)
                    print(f"  ✅ {dep}: {version}")
                else:
                    print(f"  ❌ {dep}: Not found")
                    
        except Exception as e:
            print(f"  ❌ Error reading package.json: {e}")
    
    # Verificar node_modules
    print("\n🔧 Verificando instalación de node_modules...")
    node_modules_path = frontend_path / "node_modules"
    if node_modules_path.exists():
        print("  ✅ node_modules está instalado")
    else:
        print("  ❌ node_modules no encontrado - ejecutar npm install")
    
    # Contar archivos de componentes
    print("\n🧩 Contando componentes implementados...")
    components_path = frontend_path / "src" / "components"
    if components_path.exists():
        component_files = list(components_path.rglob("*.jsx"))
        print(f"  📊 Total de componentes: {len(component_files)}")
        for comp_file in component_files[:10]:  # Mostrar primeros 10
            rel_path = comp_file.relative_to(frontend_path)
            print(f"    - {rel_path}")
        if len(component_files) > 10:
            print(f"    ... y {len(component_files) - 10} más")
    
    # Generar resumen
    print("\n" + "=" * 50)
    print("📊 RESUMEN DEL ESTADO")
    print("=" * 50)
    
    total_dirs = len(required_dirs)
    total_files = len(key_files)
    
    print(f"📁 Directorios: {len(existing_dirs)}/{total_dirs} ({'✅' if not missing_dirs else '⚠️'})")
    print(f"📄 Archivos clave: {len(existing_files)}/{total_files} ({'✅' if not missing_files else '⚠️'})")
    print(f"📦 Node modules: {'✅ Instalado' if node_modules_path.exists() else '❌ Faltante'}")
    
    # Calcular score
    dir_score = (len(existing_dirs) / total_dirs) * 40
    file_score = (len(existing_files) / total_files) * 40
    modules_score = 20 if node_modules_path.exists() else 0
    
    total_score = dir_score + file_score + modules_score
    
    print(f"\n🎯 PUNTUACIÓN TOTAL: {total_score:.1f}/100")
    
    if total_score >= 90:
        status = "🟢 EXCELENTE - Frontend completamente configurado"
    elif total_score >= 70:
        status = "🟡 BUENO - Configuración casi completa"
    elif total_score >= 50:
        status = "🟠 REGULAR - Requiere configuración adicional"
    else:
        status = "🔴 INCOMPLETO - Configuración básica faltante"
    
    print(f"📋 Estado: {status}")
    
    # Recomendaciones
    print(f"\n💡 RECOMENDACIONES:")
    if missing_dirs:
        print("  📁 Crear directorios faltantes:")
        for dir_path in missing_dirs:
            print(f"    mkdir -p frontendELP/{dir_path}")
    
    if missing_files:
        print("  📄 Crear archivos faltantes:")
        for file_path in missing_files:
            print(f"    touch frontendELP/{file_path}")
    
    if not node_modules_path.exists():
        print("  📦 Instalar dependencias:")
        print("    cd frontendELP && npm install")
    
    print(f"\n🚀 PARA EJECUTAR EL FRONTEND:")
    print("  1. cd frontendELP")
    print("  2. npm run dev")
    print("  3. Abrir http://localhost:5173")
    
    return total_score >= 70

def main():
    """Función principal"""
    print("Frontend ELP Status Verification Tool")
    print("=" * 40)
    
    if not Path("frontendELP").exists():
        print("❌ Directorio frontendELP no encontrado")
        return False
    
    success = check_frontend_status()
    
    if success:
        print("\n✅ Frontend ELP está listo para desarrollo!")
    else:
        print("\n⚠️ Frontend ELP requiere configuración adicional")
    
    return success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)