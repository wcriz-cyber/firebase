# 🔐 Guía Rápida: Configuración de GitHub Secrets

Esta guía te muestra exactamente cómo configurar los secrets necesarios para el deploy automático.

---

## ⚡ Pasos Rápidos

### 1. Ir a Settings del Repositorio

```
GitHub.com → Tu Repo → Settings (tab superior derecho)
```

### 2. Navegar a Secrets and Variables

```
Settings → Secrets and variables → Actions
```

### 3. Crear Nuevo Secret

Click en **"New repository secret"**

---

## 🔑 Secret #1: FIREBASE_SERVICE_ACCOUNT

### Obtener el JSON:

1. **Firebase Console**: https://console.firebase.google.com/
2. Click en tu proyecto **C5X**
3. ⚙️ **Configuración del proyecto** (icono engranaje arriba izquierda)
4. Tab **"Cuentas de servicio"**
5. Click **"Generar nueva clave privada"**
6. ⚠️ Confirma el diálogo de seguridad
7. Se descarga un archivo `.json`

### Configurar en GitHub:

```
Name: FIREBASE_SERVICE_ACCOUNT

Value: [Pega TODO el contenido del archivo JSON]
```

**Ejemplo del JSON** (el tuyo será diferente):
```json
{
  "type": "service_account",
  "project_id": "c5x-trading-2024",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@c5x-trading-2024.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

⚠️ **COPIA TODO**, no omitas nada. Son ~20-30 líneas de JSON.

---

## 🔑 Secret #2: FIREBASE_PROJECT_ID

### Obtener el Project ID:

**Opción A - Desde Firebase Console:**
```
Firebase Console → ⚙️ Configuración → "ID del proyecto"
```

**Opción B - Del JSON anterior:**
```json
"project_id": "c5x-trading-2024"  ← Este valor
```

### Configurar en GitHub:

```
Name: FIREBASE_PROJECT_ID

Value: c5x-trading-2024
```

(Reemplaza `c5x-trading-2024` con TU project ID real)

---

## ✅ Verificación

Después de crear ambos secrets, deberías ver:

```
📦 Repository secrets (2)

🔐 FIREBASE_SERVICE_ACCOUNT       Updated X minutes ago
🔐 FIREBASE_PROJECT_ID             Updated X minutes ago
```

---

## 🚀 Trigger del Deploy

Una vez configurados los secrets, el deploy se ejecutará automáticamente cuando:

### Opción 1: Push a Main
```bash
git add .
git commit -m "🚀 Deploy"
git push origin main
```

### Opción 2: Manual Trigger
```
GitHub → Actions → Deploy to Firebase Hosting → Run workflow
```

---

## 🔍 Verificar el Deploy

1. Ve a **Actions** tab en GitHub
2. Verás el workflow corriendo
3. Click en él para ver los logs en tiempo real
4. Espera el ✅ verde (~2-3 minutos)

**Output esperado:**
```
✓ Checkout repository
✓ Setup Node.js  
✓ Install dependencies
✓ Deploy to Firebase Hosting
  ✓ Channel URL: https://c5x-trading-2024.web.app
```

---

## ❌ Errores Comunes

### Error: "FIREBASE_SERVICE_ACCOUNT not found"

**Solución**: Verifica que el nombre del secret sea EXACTAMENTE:
```
FIREBASE_SERVICE_ACCOUNT
```
(todo en mayúsculas, con guión bajo)

### Error: "Invalid service account"

**Soluciones**:
1. ✅ Verifica que copiaste TODO el JSON (incluye las llaves `{ }`)
2. ✅ No agregues espacios extra al inicio/final
3. ✅ Genera una nueva clave privada si persiste

### Error: "Permission denied"

**Solución**: En Firebase Console → IAM y Administración:
- Verifica que la cuenta de servicio tenga rol **"Firebase Hosting Admin"**

---

## 🎯 Checklist Final

- [ ] Secret `FIREBASE_SERVICE_ACCOUNT` creado con JSON completo
- [ ] Secret `FIREBASE_PROJECT_ID` creado con project ID correcto
- [ ] Firebase Hosting habilitado en Firebase Console
- [ ] Archivo `.firebaserc` actualizado con tu project ID
- [ ] GitHub Actions ejecutándose correctamente
- [ ] App desplegada en `https://tu-proyecto.web.app`

---

## 💡 Tips Profesionales

1. **Nunca** compartas el JSON de service account públicamente
2. Puedes regenerar la clave en Firebase si la comprometes
3. Los secrets son encriptados y solo visibles para ti
4. Puedes editar secrets en cualquier momento (Settings → Secrets)
5. El workflow tiene permisos automáticos `GITHUB_TOKEN` (no necesitas configurarlo)

---

**¿Todo listo?** → Haz un `git push` y observa la magia ✨

Tu app estará live en: `https://tu-proyecto.web.app` en ~3 minutos
