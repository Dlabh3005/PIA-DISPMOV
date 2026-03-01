// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDwYU58qUDSM7n-uh6BMDou-yxFp33Fm4A",
  authDomain: "fixmycar-8f6ae.firebaseapp.com",
  projectId: "fixmycar-8f6ae",
  storageBucket: "fixmycar-8f6ae.firebasestorage.app",
  messagingSenderId: "1038016091649",
  appId: "1:1038016091649:web:c47784d0a66d0d8205d200",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);