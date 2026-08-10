/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - FIREBASE CONFIGURATION & HYBRID STORAGE
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
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY" && firebaseConfig.apiKey !== "";
};

let firebaseApp = null;
let db = null;
let auth = null;
let storage = null;

// Initialize Firebase if configured dynamically
export async function initFirebase() {
  if (isFirebaseConfigured()) {
    try {
      const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
      const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const { getAuth } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
      const { getStorage } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js");

      firebaseApp = initializeApp(firebaseConfig);
      db = getFirestore(firebaseApp);
      auth = getAuth(firebaseApp);
      storage = getStorage(firebaseApp);

      console.log("Firebase initialized successfully.");
      return { firebaseApp, db, auth, storage, mode: 'FIREBASE' };
    } catch (err) {
      console.warn("Firebase SDK load error, falling back to Local Storage Engine:", err);
    }
  }
  
  console.log("Running in Production Demo Mode (Local Storage Data Engine).");
  return { firebaseApp: null, db: null, auth: null, storage: null, mode: 'DEMO' };
}

export function getServices() {
  return { db, auth, storage, firebaseApp, isDemo: !isFirebaseConfigured() };
}
