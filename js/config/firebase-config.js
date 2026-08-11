/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - FIREBASE CONFIGURATION (PARALLEL INIT ENGINE)
   ========================================================================== */

// Firebase Live Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBXhlnkaJwEzREjdLlMfATsH2JVtOlG_2M",
  authDomain: "printing-app-9a63f.firebaseapp.com",
  databaseURL: "https://printing-app-9a63f-default-rtdb.firebaseio.com",
  projectId: "printing-app-9a63f",
  storageBucket: "printing-app-9a63f.firebasestorage.app",
  messagingSenderId: "10036391737",
  appId: "1:10036391737:web:ef9686abd9655defbf82e8"
};

// Check if Firebase keys are set to real values
export const isFirebaseConfigured = () =>
  firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY" && firebaseConfig.apiKey !== "";

let firebaseApp = null;
let db          = null;
let auth        = null;
let storage     = null;
let _initPromise = null;  // Singleton promise — prevents double-init

// Initialize Firebase — all 4 SDK modules loaded in PARALLEL
export async function initFirebase() {
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    if (!isFirebaseConfigured()) {
      console.log('Running in Production Demo Mode (Local Storage Data Engine).');
      return { firebaseApp: null, db: null, auth: null, storage: null, mode: 'DEMO' };
    }

    try {
      // Load all Firebase modules in parallel (4x faster than sequential awaits)
      const [
        { initializeApp },
        { getFirestore },
        { getAuth },
        { getStorage }
      ] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js'),
        import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js')
      ]);

      firebaseApp = initializeApp(firebaseConfig);
      db          = getFirestore(firebaseApp);
      auth        = getAuth(firebaseApp);
      storage     = getStorage(firebaseApp);

      console.log('⚡ Firebase initialized (parallel load).');
      return { firebaseApp, db, auth, storage, mode: 'FIREBASE' };
    } catch (err) {
      console.warn('Firebase SDK load error, falling back to Local Storage Engine:', err);
      return { firebaseApp: null, db: null, auth: null, storage: null, mode: 'DEMO' };
    }
  })();

  return _initPromise;
}

export function getServices() {
  return { db, auth, storage, firebaseApp, isDemo: !isFirebaseConfigured() };
}
