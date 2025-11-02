// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3-SJYETVljzbeT67q2p14e5pj3FLRT4k",
  authDomain: "pixelmart-ce8ff.firebaseapp.com",
  databaseURL: "https://pixelmart-ce8ff-default-rtdb.firebaseio.com",
  projectId: "pixelmart-ce8ff",
  storageBucket: "pixelmart-ce8ff.firebasestorage.app",
  messagingSenderId: "682768301943",
  appId: "1:682768301943:web:048e946b316abaa3ee6b72"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firebase Realtime Database
export const database = getDatabase(app);

export default app;
