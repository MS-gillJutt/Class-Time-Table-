// Firebase (free tier: Firestore) — realtime sync + offline persistence.
// If no config is provided (VITE_FIREBASE_* env vars), the app runs in
// DEMO mode with local sample data. See DEPLOY.md for free setup.
import { initializeApp } from 'firebase/app';
import {
  getFirestore, doc, getDoc, setDoc, onSnapshot,
  enableIndexedDbPersistence,
} from 'firebase/firestore';

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const cloudEnabled = Boolean(cfg.apiKey && cfg.projectId);

let db = null;
if (cloudEnabled) {
  try {
    const app = initializeApp(cfg);
    db = getFirestore(app);
    // Offline-first: Firestore caches to IndexedDB, app works without internet.
    enableIndexedDbPersistence(db).catch(() => {});
  } catch (e) {
    console.warn('Firebase init failed, falling back to demo mode:', e);
    db = null;
  }
}

const DOC_PATH = ['classtime', 'live'];

export async function fetchLive() {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, ...DOC_PATH));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.warn('fetchLive failed:', e);
    return null;
  }
}

export function subscribeLive(cb) {
  if (!db) return () => {};
  try {
    return onSnapshot(doc(db, ...DOC_PATH), (snap) => {
      if (snap.exists()) cb(snap.data());
    });
  } catch (e) {
    console.warn('subscribeLive failed:', e);
    return () => {};
  }
}

export async function publishLive(data) {
  if (!db) throw new Error('Cloud not configured');
  const payload = { ...data, updatedAt: new Date().toISOString(), version: (data.version || 0) + 1 };
  await setDoc(doc(db, ...DOC_PATH), payload, { merge: false });
  return payload;
}
