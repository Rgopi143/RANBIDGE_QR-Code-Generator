// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhYxKm_OxMOY9FQPLeITgw6s7Uv4bwkT0",
  authDomain: "ranbidge-qr-generator.firebaseapp.com",
  projectId: "ranbidge-qr-generator",
  storageBucket: "ranbidge-qr-generator.firebasestorage.app",
  messagingSenderId: "1075941950273",
  appId: "1:1075941950273:web:5737751ef76bbae296d7c0",
  measurementId: "G-EDSB0HLSYM"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
