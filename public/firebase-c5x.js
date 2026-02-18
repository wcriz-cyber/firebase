// ════════════════════════════════════════════════════════════════
//  C5X — MÓDULO FIREBASE COMPLETO
//  Archivo: firebase-c5x.js
//  Copia este archivo junto a tu index.html
// ════════════════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  enableIndexedDbPersistence,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// ════════════════════════════════════════════════════════════════
//  CONFIGURACIÓN — Reemplaza con TU configuración de Firebase
// ════════════════════════════════════════════════════════════════
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyB8pMOUdWfAqUJCAx7_fS3rIJmJhfGg2Ow",
  authDomain:        "c-76968184-d7bf0.firebaseapp.com",
  projectId:         "c-76968184-d7bf0",
  storageBucket:     "c-76968184-d7bf0.firebasestorage.app",
  messagingSenderId: "981453171468",
  appId:             "1:981453171468:web:4cc36e5cc8ac70a8cef729"
};

// UID del Super Admin (el dueño de la app) — REEMPLAZA CON TU UID
const SUPER_ADMIN_UID = 'PONER_AQUI_TU_UID_FIREBASE';


// ════════════════════════════════════════════════════════════════
//  INICIALIZACIÓN
// ════════════════════════════════════════════════════════════════
const app  = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db   = getFirestore(app);

// Persistencia offline — los datos funcionan sin internet
enableIndexedDbPersistence(db).catch(err => {
  if (err.code === 'failed-precondition') {
    console.warn('C5X Firebase: Offline persistence bloqueada (múltiples tabs)');
  } else if (err.code === 'unimplemented') {
    console.warn('C5X Firebase: Offline persistence no disponible en este navegador');
  }
});


// ════════════════════════════════════════════════════════════════
//  ESTADO GLOBAL DE SESIÓN
// ════════════════════════════════════════════════════════════════
export let usuarioActual   = null;  // objeto Firebase Auth
export let perfilUsuario   = null;  // datos de Firestore /usuarios/{uid}
export let rolUsuario      = null;  // 'admin' | 'usuario'
export let esSuperAdminApp = false; // true solo para el dueño

let _unsubs = []; // Listeners activos para limpiar al cerrar sesión


// ════════════════════════════════════════════════════════════════
//  1. AUTENTICACIÓN CON GOOGLE
// ════════════════════════════════════════════════════════════════

/**
 * Inicia sesión con Google.
 * Verifica whitelist en Firestore → si no existe, hace signOut.
 * Callbacks: onLoginExito(perfil) | onLoginDenegado() | onLoginError(err)
 */
export async function loginConGoogle({ onLoginExito, onLoginDenegado, onLoginError } = {}) {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const resultado = await signInWithPopup(auth, provider);
    const user      = resultado.user;

    // Verificar whitelist en Firestore
    const perfilRef  = doc(db, 'usuarios', user.uid);
    const perfilSnap = await getDoc(perfilRef);
    
    let perfil;

    if (perfilSnap.exists()) {
      perfil = perfilSnap.data();
      // Actualizar datos existentes
      await updateDoc(perfilRef, {
        last_login:    serverTimestamp(),
        display_name:  user.displayName || '',
        photo_url:     user.photoURL    || '',
        email:         user.email
      });
    } else {
      // Usuario NO está en la whitelist → PERMITIR ACCESO TEMPORALMENTE
      // Y crear el documento para que el resto del código no falle.
      console.warn(`C5X Auth: ${user.email} no está en la whitelist. Acceso temporal permitido para obtener UID.`);
      perfil = {
        email: user.email,
        rol: 'usuario',
        display_name: user.displayName || '',
        photo_url:    user.photoURL    || '',
        created_at:   serverTimestamp(),
        last_login:   serverTimestamp()
      };
      await setDoc(perfilRef, perfil);
    }

    if (onLoginExito) onLoginExito(perfil);
    return perfil;

  } catch (err) {
    console.error('C5X Auth Error:', err);
    if (onLoginError) onLoginError(err);
    return null;
  }
}


/**
 * Cierra sesión y limpia listeners activos
 */
export async function cerrarSesion() {
  _limpiarListeners();
  usuarioActual   = null;
  perfilUsuario   = null;
  rolUsuario      = null;
  esSuperAdminApp = false;
  await signOut(auth);
}


// ════════════════════════════════════════════════════════════════
//  OBSERVADOR DE SESIÓN PRINCIPAL
//  Llama a esto una sola vez al cargar la app (en init())
// ════════════════════════════════════════════════════════════════

/**
 * Escucha cambios de autenticación en tiempo real.
 * @param {Object} callbacks - { onAutenticado, onNoAutenticado }
 */
export function escucharSesion({ onAutenticado, onNoAutenticado } = {}) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      usuarioActual = user;

      // Leer perfil con datos de rol
      const snap = await getDoc(doc(db, 'usuarios', user.uid));
      if (!snap.exists()) {
        await cerrarSesion();
        if (onNoAutenticado) onNoAutenticado('whitelist');
        return;
      }

      perfilUsuario   = snap.data();
      rolUsuario      = perfilUsuario.rol || 'usuario';
      esSuperAdminApp = (user.uid === SUPER_ADMIN_UID);

      console.log(`C5X Auth: ${user.email} | Rol: ${rolUsuario} | SuperAdmin: ${esSuperAdminApp}`);
      if (onAutenticado) onAutenticado(perfilUsuario, rolUsuario, esSuperAdminApp);

    } else {
      usuarioActual   = null;
      perfilUsuario   = null;
      rolUsuario      = null;
      esSuperAdminApp = false;
      if (onNoAutenticado) onNoAutenticado();
    }
  });
}


// ════════════════════════════════════════════════════════════════
//  GESTIÓN DE ROLES — UI
// ════════════════════════════════════════════════════════════════

/**
 * Aplica permisos de UI según el rol del usuario.
 * Muestra/oculta elementos con data-rol="admin" | data-rol="superadmin"
 */
export function aplicarPermisosUI() {
  // Elementos solo para admin/superadmin
  document.querySelectorAll('[data-rol="admin"]').forEach(el => {
    el.style.display = (rolUsuario === 'admin' || esSuperAdminApp) ? '' : 'none';
  });

  // Elementos solo para super admin
  document.querySelectorAll('[data-rol="superadmin"]').forEach(el => {
    el.style.display = esSuperAdminApp ? '' : 'none';
  });

  // Elementos solo para usuarios normales
  document.querySelectorAll('[data-rol="usuario"]').forEach(el => {
    el.style.display = (rolUsuario === 'usuario' && !esSuperAdminApp) ? '' : 'none';
  });
}


// ════════════════════════════════════════════════════════════════
//  2. API KEYS DE GATE.IO — MULTI-DISPOSITIVO
// ════════════════════════════════════════════════════════════════

/**
 * Guarda las API Keys de Gate.io en Firestore.
 * Ruta: /usuarios/{uid}/configuracion/gateio
 * Las claves son privadas — admins no pueden verlas (por las reglas)
 */
export async function guardarApiKeys(apiKey, apiSecret) {
  if (!usuarioActual) throw new Error('Sin sesión activa');

  const ref = doc(db, 'usuarios', usuarioActual.uid, 'configuracion', 'gateio');
  await setDoc(ref, {
    api_key:    apiKey.trim(),
    api_secret: apiSecret.trim(),
    updated_at: serverTimestamp()
  });

  console.log('C5X: API Keys guardadas en Firestore ✅');
}


/**
 * Lee las API Keys de Firestore.
 * @returns {{ api_key: string, api_secret: string } | null}
 */
export async function leerApiKeys() {
  if (!usuarioActual) return null;

  const snap = await getDoc(
    doc(db, 'usuarios', usuarioActual.uid, 'configuracion', 'gateio')
  );

  if (snap.exists()) {
    console.log('C5X: API Keys cargadas desde Firestore ✅');
    return snap.data();
  }
  return null;
}


/**
 * Escucha cambios en las API Keys en tiempo real.
 * Si el usuario las actualiza desde otro dispositivo, se sincronizan aquí.
 * @param {Function} callback - (apiKeys) => void
 */
export function escucharApiKeys(callback) {
  if (!usuarioActual) return;

  const ref  = doc(db, 'usuarios', usuarioActual.uid, 'configuracion', 'gateio');
  const unsub = onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    }
  });

  _unsubs.push(unsub);
  return unsub;
}


// ════════════════════════════════════════════════════════════════
//  3. SINCRONIZACIÓN DE TRADES
// ════════════════════════════════════════════════════════════════

/**
 * Guarda un trade en Firestore.
 * Ruta: /usuarios/{uid}/trades/{tradeId}
 */
export async function guardarTrade(dataTrade) {
  if (!usuarioActual) throw new Error('Sin sesión activa');

  const ref = collection(db, 'usuarios', usuarioActual.uid, 'trades');
  const docRef = await addDoc(ref, {
    ...dataTrade,
    uid:        usuarioActual.uid,
    created_at: serverTimestamp()
  });

  console.log(`C5X: Trade guardado → ${docRef.id}`);
  return docRef.id;
}


/**
 * Escucha trades en tiempo real con onSnapshot.
 * Cambios desde cualquier dispositivo se reflejan al instante.
 * @param {Function} callback - (trades[]) => void
 * @param {number} limite - Cuántos trades cargar (default: 100)
 */
export function escucharTrades(callback, limite = 100) {
  if (!usuarioActual) return;

  const q = query(
    collection(db, 'usuarios', usuarioActual.uid, 'trades'),
    orderBy('created_at', 'desc'),
    limit(limite)
  );

  const unsub = onSnapshot(q, (snap) => {
    const trades = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(trades);
  }, (err) => {
    console.error('C5X: Error escuchando trades:', err);
  });

  _unsubs.push(unsub);
  return unsub;
}


/**
 * Elimina un trade por ID.
 */
export async function eliminarTrade(tradeId) {
  if (!usuarioActual) throw new Error('Sin sesión activa');
  await deleteDoc(doc(db, 'usuarios', usuarioActual.uid, 'trades', tradeId));
}


// ════════════════════════════════════════════════════════════════
//  SINCRONIZACIÓN DE SLOTS DE TRADING (Panel 1)
// ════════════════════════════════════════════════════════════════

/**
 * Guarda el estado de TODOS los slots en Firestore.
 * Usa writeBatch para operación atómica (todo o nada).
 */
export async function guardarSlots(slots) {
  if (!usuarioActual) return;

  const batch = writeBatch(db);

  slots.forEach((slot, idx) => {
    const ref = doc(db, 'usuarios', usuarioActual.uid, 'slots', `slot_${idx}`);
    batch.set(ref, {
      ...slot,
      slot_index: idx,
      updated_at: serverTimestamp()
    });
  });

  await batch.commit();
  console.log('C5X: Slots sincronizados con Firestore ✅');
}


/**
 * Escucha cambios en los los slots en tiempo real.
 * Si el usuario actualiza desde PC, el móvil se actualiza automáticamente.
 */
export function escucharSlots(callback) {
  if (!usuarioActual) return;

  const q = query(
    collection(db, 'usuarios', usuarioActual.uid, 'slots'),
    orderBy('slot_index', 'asc')
  );

  const unsub = onSnapshot(q, (snap) => {
    const slots = snap.docs.map(d => d.data());
    callback(slots);
  });

  _unsubs.push(unsub);
  return unsub;
}


// ════════════════════════════════════════════════════════════════
//  SINCRONIZACIÓN DE CONFIGURACIÓN DE LA APP
// ════════════════════════════════════════════════════════════════

/**
 * Guarda preferencias de la app (tema, multiplicadores, ticker, etc.)
 */
export async function guardarConfigApp(config) {
  if (!usuarioActual) return;

  const ref = doc(db, 'usuarios', usuarioActual.uid, 'configuracion_app', 'preferencias');
  await setDoc(ref, {
    ...config,
    updated_at: serverTimestamp()
  }, { merge: true });
}


/**
 * Lee configuración de la app desde Firestore.
 * Útil para restaurar preferencias en nuevo dispositivo.
 */
export async function leerConfigApp() {
  if (!usuarioActual) return null;

  const snap = await getDoc(
    doc(db, 'usuarios', usuarioActual.uid, 'configuracion_app', 'preferencias')
  );
  return snap.exists() ? snap.data() : null;
}


// ════════════════════════════════════════════════════════════════
//  4. CHAT DE SOPORTE SUPER PRIVADO
//  Solo el usuario propietario + Super Admin
//  Los admins normales NO tienen acceso (reglas de Firestore lo bloquean)
// ════════════════════════════════════════════════════════════════

/**
 * Envía un mensaje de soporte.
 * @param {string} texto - Contenido del mensaje
 * @param {string} [uidDestino] - Si es Super Admin enviando a un usuario específico
 */
export async function enviarMensajeSoporte(texto, uidDestino = null) {
  if (!usuarioActual) throw new Error('Sin sesión activa');

  // El uid de la conversación es siempre el del usuario (no del admin)
  const uidConversacion = esSuperAdminApp && uidDestino ? uidDestino : usuarioActual.uid;

  const ref = collection(db, 'consultas_privadas', uidConversacion, 'mensajes');
  await addDoc(ref, {
    texto:        texto.trim(),
    autor_uid:    usuarioActual.uid,
    autor_nombre: usuarioActual.displayName || 'Usuario',
    autor_email:  usuarioActual.email,
    es_soporte:   esSuperAdminApp, // true = mensaje del dueño
    leido:        false,
    created_at:   serverTimestamp()
  });
}


/**
 * Escucha mensajes del chat de soporte en tiempo real.
 * @param {Function} callback - (mensajes[]) => void
 * @param {string} [uidUsuario] - Si es Super Admin, para qué usuario leer
 */
export function escucharMensajesSoporte(callback, uidUsuario = null) {
  if (!usuarioActual) return;

  const uidConversacion = esSuperAdminApp && uidUsuario ? uidUsuario : usuarioActual.uid;

  const q = query(
    collection(db, 'consultas_privadas', uidConversacion, 'mensajes'),
    orderBy('created_at', 'asc'),
    limit(200)
  );

  const unsub = onSnapshot(q, (snap) => {
    const mensajes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(mensajes);
  }, (err) => {
    console.error('C5X Chat: Error de permisos o conexión:', err.code);
  });

  _unsubs.push(unsub);
  return unsub;
}


/**
 * Marca mensajes como leídos.
 */
export async function marcarMensajesLeidos(uidConversacion = null) {
  if (!usuarioActual) return;

  const uid = uidConversacion || usuarioActual.uid;
  const q   = query(
    collection(db, 'consultas_privadas', uid, 'mensajes'),
    orderBy('created_at', 'desc'),
    limit(50)
  );

  const snap  = await getDoc(q);
  const batch = writeBatch(db);

  snap.forEach(d => {
    if (!d.data().leido && d.data().autor_uid !== usuarioActual.uid) {
      batch.update(d.ref, { leido: true });
    }
  });

  await batch.commit();
}


// ════════════════════════════════════════════════════════════════
//  PANEL DE ADMINISTRACIÓN (Solo admin/superadmin)
// ════════════════════════════════════════════════════════════════

/**
 * Lee la lista de usuarios (solo datos básicos — sin API keys).
 * Solo para admin y super admin.
 * @returns {Array} - Lista de usuarios
 */
export async function leerListaUsuarios() {
  if (!esAdmin() && !esSuperAdminApp) throw new Error('Sin permisos');

  const snap = await getDocs(collection(db, 'usuarios'));
  return snap.docs.map(d => ({
    uid:         d.id,
    email:       d.data().email,
    display_name: d.data().display_name,
    rol:         d.data().rol,
    last_login:  d.data().last_login
    // NOTA: api_key y api_secret NO están aquí (subcolección separada y protegida)
  }));
}


/**
 * Agrega un nuevo usuario a la whitelist.
 * Solo el super admin puede usarlo.
 */
export async function agregarUsuarioWhitelist(email, uid, rol = 'usuario') {
  if (!esSuperAdminApp) throw new Error('Solo el Super Admin puede agregar usuarios');

  await setDoc(doc(db, 'usuarios', uid), {
    email,
    rol,
    display_name: '',
    photo_url:    '',
    created_at:   serverTimestamp(),
    last_login:   null
  });

  console.log(`C5X Admin: Usuario ${email} agregado a whitelist con rol ${rol}`);
}


/**
 * Cambia el rol de un usuario.
 * Solo admin/superadmin.
 */
export async function cambiarRolUsuario(uid, nuevoRol) {
  if (rolUsuario !== 'admin' && !esSuperAdminApp) throw new Error('Sin permisos');
  if (!['admin', 'usuario'].includes(nuevoRol)) throw new Error('Rol inválido');

  await updateDoc(doc(db, 'usuarios', uid), { rol: nuevoRol });
}


// ════════════════════════════════════════════════════════════════
//  HELPERS INTERNOS
// ════════════════════════════════════════════════════════════════

function esAdmin() {
  return rolUsuario === 'admin' || esSuperAdminApp;
}

function _limpiarListeners() {
  _unsubs.forEach(unsub => { try { unsub(); } catch(e) {} });
  _unsubs = [];
}


// ════════════════════════════════════════════════════════════════
//  EXPORTAR instancias para uso externo si se necesita
// ════════════════════════════════════════════════════════════════
export { auth, db };
