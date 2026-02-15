# 🚀 C5X - V25.31

Sistema profesional de trading de criptomonedas con análisis en tiempo real y gestión avanzada de riesgos.

![Bitcoin Logo](icon.png)

## 📋 Características Principales

- ✅ **Trading Multi-Slot**: Gestión simultánea de múltiples posiciones
- 📊 **Análisis en Tiempo Real**: Integración con TradingView y datos de Gate.io
- 💰 **Gestión de Capital**: Estrategias normales y doradas con control de DrawDown
- 📈 **Estadísticas Avanzadas**: Win Rate, PnL, ROI y análisis mensual
- 🔐 **Sistema de Seguridad**: Protección con PIN y encriptación
- 📱 **PWA**: Instalable como aplicación móvil
- 🌐 **Sistema Anti-CORS**: Rotación inteligente de proxies con métricas de rendimiento

---

## 🛠️ Configuración para Firebase Hosting

### Requisitos Previos

1. **Cuenta de Firebase**: Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. **Cuenta de GitHub**: Tu repositorio debe estar en GitHub
3. **Firebase CLI** (opcional para testing local):
   ```bash
   npm install -g firebase-tools
   ```

---

### 📦 Archivos Incluidos

```
📁 Proyecto C5X
├── 📄 index.html          # Aplicación principal
├── 🖼️ icon.png            # Ícono de la PWA (512x512)
├── 📱 manifest.json       # Configuración PWA
├── ⚙️ firebase.json       # Configuración Firebase Hosting
├── 🔧 .firebaserc         # Proyecto Firebase
├── 📚 README.md           # Esta documentación
└── 📁 .github/
    └── 📁 workflows/
        └── 🚀 firebase-deploy.yml  # GitHub Actions
```

---

## 🔧 Configuración Paso a Paso

### 1️⃣ Configurar Firebase Project ID

Edita el archivo `.firebaserc` y reemplaza `"tu-proyecto-firebase-id"` con el ID de tu proyecto:

```json
{
  "projects": {
    "default": "c5x-trading-2024"
  }
}
```

💡 **Encuentra tu Project ID**: Firebase Console → ⚙️ Configuración del proyecto → ID del proyecto

---

### 2️⃣ Configurar GitHub Secrets

Ve a tu repositorio en GitHub: **Settings → Secrets and variables → Actions**

Crea estos 2 secrets obligatorios:

#### 🔑 `FIREBASE_SERVICE_ACCOUNT`

1. Ve a Firebase Console → ⚙️ Configuración del proyecto → Cuentas de servicio
2. Click en **"Generar nueva clave privada"**
3. Se descargará un archivo JSON
4. Copia **TODO** el contenido del JSON en este secret

#### 🔑 `FIREBASE_PROJECT_ID`

Tu Project ID de Firebase (ejemplo: `c5x-trading-2024`)

---

### 3️⃣ Habilitar Firebase Hosting

1. En Firebase Console, ve a **Build → Hosting**
2. Click en **"Comenzar"**
3. Sigue el asistente (no necesitas ejecutar comandos, solo habilitar el servicio)

---

### 4️⃣ Subir Archivos a GitHub

```bash
# Inicializar repositorio
git init
git add .
git commit -m "🚀 Initial commit: C5X Trading App"

# Conectar con GitHub
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git branch -M main
git push -u origin main
```

---

### 5️⃣ Deploy Automático

El deploy se ejecutará **automáticamente** cuando:

- Hagas `git push` a la rama `main` o `master`
- Ejecutes manualmente el workflow desde GitHub Actions

#### Ver el Progreso del Deploy:

1. Ve a tu repo → pestaña **"Actions"**
2. Verás el workflow **"Deploy to Firebase Hosting"** ejecutándose
3. Espera el ✅ verde (tarda ~2-3 minutos)

---

## 🧪 Testing Local (Opcional)

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login a Firebase
firebase login

# Servir localmente
firebase serve
```

Tu app estará en: `http://localhost:5000`

---

## 🔍 Solución de Problemas CORS

### Sistema de Proxies Mejorado

La app incluye un sistema inteligente de rotación de proxies:

```javascript
proxies = [ 
    'https://corsproxy.io/?', 
    'https://api.allorigins.win/raw?url=', 
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://thingproxy.freeboard.io/fetch/'
];
```

**Características**:
- ✅ Rotación automática por rendimiento
- ✅ Métricas de éxito/fallo por proxy
- ✅ Timeout optimizado (6s directo, 10s proxy)
- ✅ Fallback inteligente
- ✅ Logs detallados en consola

### Si los Proxies Fallan

1. **Opción A**: Usar tu propio CORS proxy
   ```javascript
   // Añadir en línea ~2535 de index.html
   proxies.unshift('https://tu-cors-proxy.com/?url=');
   ```

2. **Opción B**: Backend propio con Express
   ```javascript
   // server.js
   const express = require('express');
   const cors = require('cors');
   const axios = require('axios');
   
   const app = express();
   app.use(cors());
   
   app.get('/api/gate/*', async (req, res) => {
       const path = req.params[0];
       const url = `https://api.gateio.ws/api/v4/${path}`;
       const response = await axios.get(url);
       res.json(response.data);
   });
   
   app.listen(3000);
   ```

---

## 🎯 Configuración de la API de Gate.io

1. Crea API Keys en [Gate.io](https://www.gate.io/myaccount/apiv4keys)
2. Permisos necesarios: **Solo lectura** (Spot Trading - Read Only)
3. En la app, ve a ⚙️ Ajustes → API Configuration
4. Ingresa tu API Key y Secret
5. Click en **"Probar Conexión"** para verificar

⚠️ **IMPORTANTE**: Nunca compartas tus API Keys. Usa permisos de solo lectura.

---

## 📱 Instalar como PWA

### Android
1. Abre la app en Chrome
2. Menú (⋮) → "Agregar a pantalla de inicio"
3. ✅ Listo

### iOS
1. Abre la app en Safari
2. Botón compartir → "Añadir a pantalla de inicio"
3. ✅ Listo

---

## 🔄 Actualizar la App

```bash
# Hacer cambios en el código
git add .
git commit -m "✨ Nueva funcionalidad"
git push

# El deploy automático se ejecutará
# La app se actualizará en ~3 minutos
```

---

## 📊 Estructura del Código

### Funciones Principales CORS

```javascript
// Línea ~2530
async function callGateApi(method, endpoint, params = {}, requireAuth = false)
```

**Mejoras implementadas**:
- Sistema de puntuación de proxies
- Métricas de tiempo de respuesta
- Ordenamiento dinámico por rendimiento
- Logs informativos
- Manejo robusto de errores

### Proxies Stats

```javascript
proxyStats = {
  0: { success: 15, fail: 2, avgTime: 1250 },  // corsproxy.io
  1: { success: 12, fail: 5, avgTime: 1800 },  // allorigins
  2: { success: 18, fail: 1, avgTime: 950 },   // codetabs ⭐ Mejor
  3: { success: 8, fail: 8, avgTime: 2100 }    // thingproxy
}
```

---

## 🌐 URLs Importantes

- **Firebase Hosting**: `https://tu-proyecto.web.app` o `https://tu-proyecto.firebaseapp.com`
- **Gate.io API Docs**: https://www.gate.io/docs/developers/apiv4
- **TradingView Widgets**: https://www.tradingview.com/widget/

---

## 📝 Licencia

Proyecto privado. Todos los derechos reservados.

---

## 🆘 Soporte

Si encuentras problemas:

1. **CORS**: Verifica la consola del navegador (F12) para ver qué proxy está fallando
2. **Deploy**: Revisa GitHub Actions → pestaña "Actions"
3. **API**: Usa el botón "Probar Conexión" en ajustes
4. **Firebase**: Verifica que Hosting esté habilitado

---

## 🎉 ¡Todo Listo!

Tu aplicación está configurada profesionalmente para:
- ✅ Deploy automático desde GitHub
- ✅ Hosting ultrarrápido con Firebase
- ✅ Sistema anti-CORS robusto
- ✅ PWA instalable
- ✅ Headers de seguridad configurados

**URL de tu app**: `https://tu-proyecto.web.app`

---

**Desarrollado con ❤️ para traders profesionales**
