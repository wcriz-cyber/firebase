# ✅ CHECKLIST DE DEPLOYMENT - C5X v25.31

## 🎯 Pasos Rápidos (15 minutos)

### ✅ PASO 1: Crear Proyecto Firebase (2 min)
1. [ ] Ir a https://console.firebase.google.com/
2. [ ] Click en "Agregar proyecto"
3. [ ] Nombre: `C5X Trading` (o el que prefieras)
4. [ ] Desactivar Google Analytics (opcional)
5. [ ] Click "Crear proyecto"
6. [ ] **IMPORTANTE**: Anota tu Project ID (ej: `c5x-trading-2024`)

---

### ✅ PASO 2: Habilitar Hosting (1 min)
1. [ ] En Firebase Console → Build → Hosting
2. [ ] Click "Comenzar"
3. [ ] Siguiente, Siguiente... (no ejecutes comandos)
4. [ ] Finalizar

---

### ✅ PASO 3: Generar Service Account (2 min)
1. [ ] Firebase Console → ⚙️ Configuración del proyecto
2. [ ] Pestaña "Cuentas de servicio"
3. [ ] Click "Generar nueva clave privada"
4. [ ] Confirmar
5. [ ] Se descarga un archivo `.json`
6. [ ] **IMPORTANTE**: Guarda este archivo (lo usarás en GitHub)

---

### ✅ PASO 4: Configurar Proyecto Localmente (3 min)

Descarga todos los archivos y:

1. [ ] Editar `.firebaserc`:
```json
{
  "projects": {
    "default": "TU-PROJECT-ID-AQUI"  ← Cambiar esto
  }
}
```

**O usa el script automático:**
```bash
chmod +x deploy.sh
./deploy.sh
```

---

### ✅ PASO 5: Crear Repositorio en GitHub (2 min)
1. [ ] Ir a https://github.com/new
2. [ ] Nombre: `c5x-trading` (o el que prefieras)
3. [ ] Privado o Público (tu elección)
4. [ ] **NO** inicializar con README
5. [ ] Click "Create repository"
6. [ ] **Anota la URL**: `https://github.com/TU-USUARIO/c5x-trading.git`

---

### ✅ PASO 6: Configurar GitHub Secrets (3 min)

En tu repositorio de GitHub:

1. [ ] Settings → Secrets and variables → Actions
2. [ ] Click "New repository secret"

**Secret #1:**
```
Name: FIREBASE_SERVICE_ACCOUNT
Value: [Pega TODO el contenido del JSON descargado en PASO 3]
```

**Secret #2:**
```
Name: FIREBASE_PROJECT_ID
Value: tu-project-id (el de PASO 1)
```

3. [ ] Verificar que ambos secrets estén creados

---

### ✅ PASO 7: Subir a GitHub (2 min)

En tu terminal:

```bash
# 1. Inicializar Git (si no lo hiciste)
git init

# 2. Agregar archivos
git add .

# 3. Commit
git commit -m "🚀 Initial commit: C5X v25.31"

# 4. Conectar con GitHub (cambiar URL)
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git

# 5. Subir
git branch -M main
git push -u origin main
```

---

### ✅ PASO 8: Verificar Deployment (3 min)

1. [ ] GitHub → Tu repo → pestaña "Actions"
2. [ ] Ver workflow "Deploy to Firebase Hosting" corriendo
3. [ ] Esperar ✅ verde (~2-3 minutos)
4. [ ] En los logs, buscar:
```
✓ Channel URL: https://tu-proyecto.web.app
```
5. [ ] Abrir la URL en el navegador
6. [ ] 🎉 **¡Tu app está LIVE!**

---

## 🔍 Verificación Final

- [ ] App accesible en `https://tu-proyecto.web.app`
- [ ] PWA se puede instalar en móvil
- [ ] API Keys de Gate.io funcionan (Ajustes → API)
- [ ] Proxies CORS funcionando (F12 → ver logs)
- [ ] No hay errores en consola del navegador

---

## 📋 Archivos del Proyecto

Verifica que tengas estos archivos:

**Esenciales:**
- [x] `index.html` - App principal (238KB)
- [x] `icon.png` - Ícono PWA (67KB)
- [x] `manifest.json` - Config PWA
- [x] `firebase.json` - Config Firebase
- [x] `.firebaserc` - Project ID
- [x] `.gitignore` - Archivos a ignorar

**GitHub Actions:**
- [x] `.github/workflows/firebase-deploy.yml`

**Documentación:**
- [x] `README.md` - Guía completa
- [x] `GITHUB_SECRETS_SETUP.md` - Config secrets
- [x] `TROUBLESHOOTING.md` - Solución de problemas
- [x] `CHECKLIST.md` - Esta guía

**Opcionales:**
- [x] `package.json` - Dependencias (opcional)
- [x] `deploy.sh` - Script automatizado

---

## 🚨 Problemas Comunes

### ❌ Workflow falla con "Permission denied"
**Solución**: Verifica secrets en GitHub (PASO 6)

### ❌ "Project not found"
**Solución**: Verifica Project ID en `.firebaserc` (PASO 4)

### ❌ CORS errors
**Solución**: Abre consola (F12), verifica logs de proxies. Lee `TROUBLESHOOTING.md`

### ❌ API Keys no funcionan
**Solución**: Ajustes → API Configuration → "Probar Conexión"

---

## 🎯 Mejoras Opcionales

Después del deployment inicial:

- [ ] Configurar dominio personalizado (Firebase Hosting → Agregar dominio)
- [ ] Activar Google Analytics (Firebase → Analytics)
- [ ] Configurar Service Worker para PWA offline
- [ ] Agregar backend propio para CORS (Cloudflare Workers)
- [ ] Configurar alertas de trading vía Telegram

---

## 📚 Recursos

- **Firebase Docs**: https://firebase.google.com/docs/hosting
- **GitHub Actions**: https://docs.github.com/actions
- **Gate.io API**: https://www.gate.io/docs/developers/apiv4
- **TradingView**: https://www.tradingview.com/widget/

---

## ✅ Confirmación Final

Cuando hayas completado TODO:

```
✅ Proyecto Firebase creado
✅ Hosting habilitado
✅ Service Account generado
✅ .firebaserc configurado
✅ Repositorio GitHub creado
✅ Secrets configurados en GitHub
✅ Código subido a GitHub
✅ Workflow ejecutado exitosamente
✅ App accesible en web
✅ PWA instalable
```

**URL de tu app**: `https://__________.web.app`

---

🎉 **¡FELICIDADES!** Tu aplicación de trading está LIVE y desplegándose automáticamente desde GitHub.

**Próximos pasos:**
1. Configura tus API Keys de Gate.io en la app
2. Personaliza estrategias de trading
3. Comparte la URL con tu equipo

**Para actualizar la app en el futuro:**
```bash
# Hacer cambios en el código
git add .
git commit -m "✨ Nueva feature"
git push

# Deploy automático en ~3 minutos ⚡
```

---

**¿Problemas?** → Lee `TROUBLESHOOTING.md`  
**¿Dudas sobre secrets?** → Lee `GITHUB_SECRETS_SETUP.md`  
**¿Documentación completa?** → Lee `README.md`
