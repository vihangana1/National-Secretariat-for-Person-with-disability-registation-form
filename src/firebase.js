import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyCcPgSaXgo_uNyBQuyB7WC4Xuqknn4BFX4",
  authDomain: "nspd-85969.firebaseapp.com",
  projectId: "nspd-85969",
  storageBucket: "nspd-85969.firebasestorage.app",
  messagingSenderId: "462284565028",
  appId: "1:462284565028:web:e5b5c18de2defa96dcc6b1",
  measurementId: "G-SJP0DEG1MF"
};

// Initialize Firebases
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };