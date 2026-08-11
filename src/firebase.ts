/// <reference types="vite/client" />

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration using Environment Variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ranbidge-qr-generator.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ranbidge-qr-generator",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ranbidge-qr-generator.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1075941950273",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1075941950273:web:5737751ef76bbae296d7c0",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-EDSB0HLSYM"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
