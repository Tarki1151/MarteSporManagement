import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// .env dosyasındaki değişkenleri import.meta.env objesinden okuyoruz.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// API anahtarının yüklenip yüklenmediğini kontrol edelim.
// Bu kontrol, .env dosyasının okunup okunmadığını anlamanıza yardımcı olur.
if (!firebaseConfig.apiKey) {
  console.error('Firebase API Key (VITE_FIREBASE_API_KEY) bulunamadı. .env dosyanızı ve vite.config.ts ayarlarınızı kontrol edin.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };