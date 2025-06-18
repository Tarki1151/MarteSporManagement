import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  signOut,
  User,
  AuthError
} from 'firebase/auth';

interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Firebase uygulamasını başlat
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Google ile giriş fonksiyonu
export const signInWithGoogle = async (): Promise<AuthResponse> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    const authError = error as AuthError;
    console.error('Google ile giriş hatası:', authError);
    return { 
      success: false, 
      error: authError.message || 'Google ile giriş yapılırken bir hata oluştu.' 
    };
  }
};

// Email/Şifre ile giriş fonksiyonu
export const signInWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    const authError = error as AuthError;
    console.error('Email ile giriş hatası:', authError);
    
    let errorMessage = 'Giriş yapılırken bir hata oluştu.';
    switch (authError.code) {
      case 'auth/user-not-found':
        errorMessage = 'Bu email adresiyle kayıtlı bir kullanıcı bulunamadı.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Hatalı şifre. Lütfen tekrar deneyin.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'Bu hesap devre dışı bırakılmış.';
        break;
    }
    
    return { success: false, error: errorMessage };
  }
};

// Çıkış fonksiyonu
export const logout = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    const authError = error as AuthError;
    console.error('Çıkış yapılırken hata:', authError);
    return { 
      success: false, 
      error: 'Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyin.' 
    };
  }
};

export { auth, googleProvider };
