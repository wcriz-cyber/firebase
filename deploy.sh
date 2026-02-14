#!/bin/bash

# 🚀 C5X - Script de Deployment Rápido
# Este script te ayuda a configurar y desplegar tu app en minutos

set -e

echo "🚀 C5X - CONFIGURACIÓN RÁPIDA PARA FIREBASE"
echo "=========================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar si estamos en un repositorio Git
if [ ! -d .git ]; then
    echo -e "${YELLOW}⚠️  No estás en un repositorio Git${NC}"
    echo ""
    read -p "¿Inicializar nuevo repositorio Git? (s/n): " init_git
    if [ "$init_git" = "s" ]; then
        git init
        echo -e "${GREEN}✅ Repositorio Git inicializado${NC}"
    else
        echo -e "${RED}❌ Necesitas un repositorio Git para continuar${NC}"
        exit 1
    fi
fi

echo ""
echo "📋 PASO 1: Configurar Firebase Project ID"
echo "==========================================="
echo ""

# Leer Project ID
read -p "Ingresa tu Firebase Project ID (ej: c5x-trading-2024): " project_id

if [ -z "$project_id" ]; then
    echo -e "${RED}❌ Project ID no puede estar vacío${NC}"
    exit 1
fi

# Actualizar .firebaserc
cat > .firebaserc << EOF
{
  "projects": {
    "default": "$project_id"
  },
  "targets": {},
  "etags": {}
}
EOF

echo -e "${GREEN}✅ Archivo .firebaserc actualizado${NC}"

echo ""
echo "📋 PASO 2: Verificar archivos necesarios"
echo "=========================================="
echo ""

required_files=("index.html" "icon.png" "manifest.json" "firebase.json" ".github/workflows/firebase-deploy.yml")
missing_files=()

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${RED}❌${NC} $file ${RED}(falta)${NC}"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}⚠️  Faltan archivos necesarios. Asegúrate de tener todos los archivos del proyecto.${NC}"
    exit 1
fi

echo ""
echo "📋 PASO 3: Configurar Git"
echo "========================="
echo ""

# Verificar si ya hay commits
if ! git rev-parse HEAD >/dev/null 2>&1; then
    echo "Agregando archivos al repositorio..."
    git add .
    git commit -m "🚀 Initial commit: C5X Trading App v25.31"
    echo -e "${GREEN}✅ Commit inicial creado${NC}"
else
    echo -e "${BLUE}ℹ️  Ya tienes commits en el repositorio${NC}"
    read -p "¿Hacer commit de los cambios actuales? (s/n): " do_commit
    if [ "$do_commit" = "s" ]; then
        git add .
        git commit -m "🔧 Update: Firebase configuration" || echo "No hay cambios para commit"
    fi
fi

echo ""
echo "📋 PASO 4: Conectar con GitHub"
echo "==============================="
echo ""

# Verificar si ya tiene remote
if git remote | grep -q origin; then
    echo -e "${BLUE}ℹ️  Remote 'origin' ya configurado:${NC}"
    git remote get-url origin
    echo ""
    read -p "¿Usar este remote? (s/n): " use_remote
    if [ "$use_remote" != "s" ]; then
        read -p "Ingresa nueva URL del repositorio GitHub: " repo_url
        git remote set-url origin "$repo_url"
        echo -e "${GREEN}✅ Remote actualizado${NC}"
    fi
else
    echo "Necesitas conectar con GitHub"
    echo ""
    read -p "Ingresa URL del repositorio GitHub (ej: https://github.com/usuario/repo.git): " repo_url
    
    if [ -z "$repo_url" ]; then
        echo -e "${YELLOW}⚠️  Sin remote configurado. Puedes hacerlo después con:${NC}"
        echo "    git remote add origin <URL>"
    else
        git remote add origin "$repo_url"
        echo -e "${GREEN}✅ Remote configurado${NC}"
    fi
fi

echo ""
echo "📋 PASO 5: GitHub Secrets"
echo "========================="
echo ""

echo -e "${YELLOW}⚠️  IMPORTANTE: Debes configurar estos secrets en GitHub:${NC}"
echo ""
echo "1. Ve a: Settings → Secrets and variables → Actions"
echo "2. Crea estos 2 secrets:"
echo ""
echo -e "${BLUE}Secret #1:${NC} FIREBASE_SERVICE_ACCOUNT"
echo "   → Firebase Console → Configuración → Cuentas de servicio"
echo "   → Generar nueva clave privada → Copiar TODO el JSON"
echo ""
echo -e "${BLUE}Secret #2:${NC} FIREBASE_PROJECT_ID"
echo "   → Valor: $project_id"
echo ""
echo -e "${GREEN}📄 Lee GITHUB_SECRETS_SETUP.md para instrucciones detalladas${NC}"
echo ""

read -p "¿Ya configuraste los secrets? (s/n): " secrets_done

if [ "$secrets_done" != "s" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Configura los secrets antes de hacer push${NC}"
    echo "Cuando estés listo, ejecuta:"
    echo ""
    echo "    git push -u origin main"
    echo ""
    exit 0
fi

echo ""
echo "📋 PASO 6: Push a GitHub"
echo "========================"
echo ""

# Verificar rama actual
current_branch=$(git branch --show-current)
echo "Rama actual: $current_branch"

if [ "$current_branch" != "main" ] && [ "$current_branch" != "master" ]; then
    echo -e "${YELLOW}⚠️  No estás en main/master${NC}"
    read -p "¿Cambiar a main? (s/n): " switch_branch
    if [ "$switch_branch" = "s" ]; then
        git checkout -b main 2>/dev/null || git checkout main
        current_branch="main"
    fi
fi

echo ""
read -p "¿Hacer push a $current_branch? (s/n): " do_push

if [ "$do_push" = "s" ]; then
    echo ""
    echo "Subiendo a GitHub..."
    git push -u origin "$current_branch"
    echo ""
    echo -e "${GREEN}✅ Push exitoso!${NC}"
    echo ""
    echo "🎉 ¡Deployment iniciado automáticamente!"
    echo ""
    echo "Verifica el progreso en:"
    echo "https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\).git/\1/')/actions"
    echo ""
    echo "Tu app estará live en ~3 minutos en:"
    echo -e "${GREEN}https://$project_id.web.app${NC}"
else
    echo ""
    echo "Para hacer push manualmente:"
    echo "    git push -u origin $current_branch"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ CONFIGURACIÓN COMPLETA${NC}"
echo "=========================================="
echo ""
echo "📚 Documentación:"
echo "   - README.md → Guía completa"
echo "   - GITHUB_SECRETS_SETUP.md → Configurar secrets"
echo "   - TROUBLESHOOTING.md → Solucionar problemas"
echo ""
echo "🌐 URLs importantes:"
echo "   - App: https://$project_id.web.app"
echo "   - Firebase Console: https://console.firebase.google.com/project/$project_id"
echo ""
echo -e "${BLUE}¡Éxito en tu trading! 🚀${NC}"
echo ""
