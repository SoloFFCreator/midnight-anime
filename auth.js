import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  applyActionCode
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyClcy2YXqryJAkg_wy1W4RLqkYMIsEg2Rk",
  authDomain: "dipamalla.com.np",
  databaseURL: "https://mid-night-anime-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mid-night-anime",
  storageBucket: "mid-night-anime.firebasestorage.app",
  messagingSenderId: "655330045563",
  appId: "1:655330045563:web:3d99e3be8ad7cb2734bcde",
  measurementId: "G-XT3XC7RL7L"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Google OAuth Configuration
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("profile");
googleProvider.addScope("email");

googleProvider.setCustomParameters({
  client_id: "655330045563-3jtu25b6fq1hiof0nknode8av2mpej5f.apps.googleusercontent.com",
  prompt: "select_account"
});

// Auth Export Helpers
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithGoogleRedirect = () => signInWithRedirect(auth, googleProvider);
export const logoutUser = () => signOut(auth);
export const subscribeToAuth = (callback) => onAuthStateChanged(auth, callback);

// Password Reset Email Trigger
export const sendResetEmail = (email) => {
  return sendPasswordResetEmail(auth, email, {
    url: 'https://dipamalla.com.np/auth/handler'
  });
};

// Action Code Processor (for /auth/handler page)
export const processAuthCode = async (mode, oobCode, extraData = null) => {
  if (!oobCode) throw new Error("Missing verification code.");

  switch (mode) {
    case "resetPassword": {
      const email = await verifyPasswordResetCode(auth, oobCode);
      if (extraData) {
        await confirmPasswordReset(auth, oobCode, extraData);
        return { success: true, message: "Password updated successfully!" };
      }
      return { success: true, email };
    }
    case "verifyEmail": {
      await applyActionCode(auth, oobCode);
      return { success: true, message: "Email address verified successfully!" };
    }
    default:
      throw new Error("Invalid or unsupported action link.");
  }
};
