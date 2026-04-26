import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAFcQ3ywLnPiVURakjoffLWopjs6Km8ONI",
  authDomain: "visualbook-ef1d0.firebaseapp.com",
  projectId: "visualbook-ef1d0",
  storageBucket: "visualbook-ef1d0.firebasestorage.app",
  messagingSenderId: "25249514085",
  appId: "1:25249514085:web:92b5057cdbd26bcaae7c8c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();