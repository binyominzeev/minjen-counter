// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRwY9gyFa9fhCdi-vH_DmyzcZm--bNhpc",
  authDomain: "minjen-counter-d3f6e.firebaseapp.com",
  projectId: "minjen-counter-d3f6e",
  storageBucket: "minjen-counter-d3f6e.firebasestorage.app",
  messagingSenderId: "845790723670",
  appId: "1:845790723670:web:88ad75647501263fb605f7",
  measurementId: "G-Z32XMBMKHK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);

export { app, analytics };