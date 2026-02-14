# 🔧 Troubleshooting - Solución de Problemas Comunes

---

## 🌐 Problemas de CORS

### ❌ Error: "Access to fetch blocked by CORS policy"

**Síntomas:**
```
Access to fetch at 'https://api.gateio.ws/api/v4/...' from origin 
'https://tu-proyecto.web.app' has been blocked by CORS policy
```

**Diagnóstico:**

Abre la consola del navegador (F12) y busca mensajes como:
```javascript
⚠️ Directo falló, usando proxies...
❌ Proxy 0 falló: TypeError: Failed to fetch
❌ Proxy 1 falló: SyntaxError: Unexpected token
✅ Proxy 2 OK (1250ms)
```

**Soluciones:**

#### 1. Verificar Sistema de Proxies (Automático)

El código ya maneja esto automáticamente. Si ves `✅ Proxy X OK`, todo funciona bien.

#### 2. Agregar Proxy Adicional

Si todos los proxies fallan, agrega uno nuevo:

```javascript
// En index.html, línea ~2535, agrega al array:
proxies = [ 
    'https://corsproxy.io/?', 
    'https://api.allorigins.win/raw?url=', 
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://thingproxy.freeboard.io/fetch/',
    'https://proxy.cors.sh/',  // ← NUEVO
];
```

#### 3. Crear Tu Propio CORS Proxy

**Opción A - Cloudflare Worker** (Gratis, Recomendado):

```javascript
// worker.js en Cloudflare Workers
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')
  
  if (!targetUrl) {
    return new Response('Missing url parameter', { status: 400 })
  }
  
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' ? request.body : undefined
  })
  
  const newResponse = new Response(response.body, response)
  newResponse.headers.set('Access-Control-Allow-Origin', '*')
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  newResponse.headers.set('Access-Control-Allow-Headers', '*')
  
  return newResponse
}
```

**Deploy:**
1. Ve a Cloudflare Workers: https://workers.cloudflare.com/
2. Crea nuevo worker
3. Pega el código
4. Deploy
5. Usa: `https://tu-worker.workers.dev/?url=`

**Opción B - Vercel Function**:

```javascript
// api/proxy.js
module.exports = async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }
  
  const response = await fetch(url);
  const data = await response.json();
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(data);
};
```

---

## 🔥 Problemas de Firebase Deploy

### ❌ Error: "HTTP Error: 403, The caller does not have permission"

**Causa**: La cuenta de servicio no tiene permisos suficientes.

**Solución:**

1. Firebase Console → Configuración del proyecto
2. Cuentas de servicio → IAM y administración
3. Busca tu cuenta: `firebase-adminsdk-xxxxx@...`
4. Editar → Agregar roles:
   - ✅ Firebase Hosting Admin
   - ✅ Service Account User

### ❌ Error: "Project not found"

**Causa**: El `FIREBASE_PROJECT_ID` es incorrecto.

**Solución:**

1. Verifica en `.firebaserc`:
```json
{
  "projects": {
    "default": "c5x-trading-2024"  ← Debe coincidir con Firebase
  }
}
```

2. Verifica el secret en GitHub (Settings → Secrets):
```
FIREBASE_PROJECT_ID = c5x-trading-2024
```

### ❌ Error: "Firebase Hosting not enabled"

**Solución:**

1. Firebase Console → Build → Hosting
2. Click "Comenzar"
3. Completar el wizard (no necesitas ejecutar comandos)

### ❌ GitHub Actions falla en "Setup Node.js"

**Solución:**

El workflow intenta instalar dependencias si existe `package.json`. Opciones:

**Opción A** - Eliminar package.json si no lo necesitas:
```bash
git rm package.json
git commit -m "Remove package.json"
git push
```

**Opción B** - Agregar `.npmrc`:
```
# .npmrc
fund=false
audit=false
```

---

## 📱 Problemas de PWA

### ❌ PWA no se instala en móvil

**Verificaciones:**

1. **HTTPS obligatorio**: Firebase Hosting ya lo tiene ✅
2. **manifest.json accesible**: Verifica en `https://tu-app.web.app/manifest.json`
3. **Service Worker**: La app actual no lo tiene (opcional)

**Agregar Service Worker** (opcional):

```javascript
// sw.js
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
```

```html
<!-- En index.html, antes de </body> -->
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('SW registrado'))
    .catch(err => console.log('SW falló', err));
}
</script>
```

### ❌ Ícono no aparece en PWA

**Solución:**

Verifica que `icon.png` sea:
- ✅ Tamaño: 512x512px mínimo
- ✅ Formato: PNG
- ✅ Accesible en: `https://tu-app.web.app/icon.png`

---

## 🔐 Problemas de API Gate.io

### ❌ Error: "Invalid signature"

**Causas comunes:**

1. **Timestamp desincronizado**

**Solución:**
```javascript
// El código ya sincroniza automáticamente en línea ~2531
// Verifica en consola:
✅ Hora sincronizada con Gate.io
```

Si falla, verifica hora del sistema:
```bash
# En tu computadora
date
```

2. **API Keys incorrectas**

**Verificación:**
- Ajustes → API Configuration → "Probar Conexión"
- Debe mostrar: `✅ OK - Balance: $XXX.XX`

3. **Espacios en API Key/Secret**

**Solución:**
```javascript
// Asegúrate de no tener espacios:
const cleanKey = apiConfig.key.trim();
const cleanSecret = apiConfig.secret.trim();
```

### ❌ Error: "IP not allowed"

**Causa**: Gate.io puede tener restricciones de IP.

**Solución:**

1. Gate.io → API Management → Editar API Key
2. Configuración de IP:
   - **Opción A**: Permitir todas las IPs (menos seguro)
   - **Opción B**: Agregar IPs de Cloudflare (Firebase usa Cloudflare)

---

## 🐛 Debugging Avanzado

### Ver Logs Detallados del Sistema de Proxies

```javascript
// Agregar en consola del navegador (F12):
console.log('📊 Proxy Stats:', proxyStats);

// Output esperado:
{
  0: { success: 15, fail: 2, avgTime: 1250 },
  1: { success: 12, fail: 5, avgTime: 1800 },
  2: { success: 18, fail: 1, avgTime: 950 },   // ⭐ Mejor
  3: { success: 8, fail: 8, avgTime: 2100 }
}
```

### Test Manual de CORS

```javascript
// En consola del navegador:
fetch('https://api.gateio.ws/api/v4/spot/time')
  .then(r => r.json())
  .then(d => console.log('✅ DIRECTO OK:', d))
  .catch(e => console.log('❌ CORS bloqueado:', e));

// Si falla, probar con proxy:
fetch('https://corsproxy.io/?https://api.gateio.ws/api/v4/spot/time')
  .then(r => r.json())
  .then(d => console.log('✅ PROXY OK:', d))
  .catch(e => console.log('❌ PROXY falló:', e));
```

### Forzar Uso de Proxy Específico

```javascript
// Modificar temporalmente en index.html:
currentProxyIndex = 2; // Fuerza uso de proxy #2
```

---

## 📊 Performance Monitoring

### Ver Tiempos de Respuesta

Los logs muestran automáticamente:
```
✅ Proxy 2 OK (950ms)   ← Rápido ✅
✅ Proxy 0 OK (2150ms)  ← Lento ⚠️
```

**Benchmark esperado:**
- 🟢 Excelente: < 1000ms
- 🟡 Aceptable: 1000-2000ms
- 🔴 Lento: > 2000ms

### Optimizar Proxies

Si un proxy es consistentemente lento, elimínalo:

```javascript
// Eliminar proxy lento del array:
proxies = [ 
    'https://corsproxy.io/?',              // Rápido ✅
    // 'https://api.allorigins.win/...',   // ❌ ELIMINADO (muy lento)
    'https://api.codetabs.com/...',        // Rápido ✅
];
```

---

## 🆘 Checklist de Diagnóstico Completo

Usa esta lista cuando tengas problemas:

**Firebase:**
- [ ] Hosting habilitado en Firebase Console
- [ ] Project ID correcto en `.firebaserc`
- [ ] Secrets configurados en GitHub
- [ ] GitHub Actions sin errores (pestaña Actions)
- [ ] App accesible en `https://tu-proyecto.web.app`

**CORS:**
- [ ] Consola del navegador abierta (F12)
- [ ] Ves logs de proxies: `✅ Proxy X OK`
- [ ] `proxyStats` muestra éxitos
- [ ] Al menos 1 proxy funcional

**API Gate.io:**
- [ ] API Keys configuradas
- [ ] Botón "Probar Conexión" → ✅
- [ ] Sincronización de hora exitosa
- [ ] Balance visible en wallet

**PWA:**
- [ ] HTTPS activo (Firebase lo tiene)
- [ ] `manifest.json` accesible
- [ ] `icon.png` 512x512
- [ ] Puede instalarse en móvil

---

## 📞 Última Opción: Logs Completos

Si todo falla, exporta logs completos:

```javascript
// En consola del navegador:
copy(JSON.stringify({
  proxyStats,
  lastError: /* último error capturado */,
  config: { ...appConfig, apiConfig: 'REDACTED' },
  timestamp: new Date().toISOString()
}, null, 2));
```

Pega los logs en un issue de GitHub o soporte técnico.

---

**La mayoría de problemas se resuelven con:**
1. Verificar secrets en GitHub ✅
2. Verificar consola del navegador para errores CORS ✅
3. Probar conexión de API desde ajustes ✅
