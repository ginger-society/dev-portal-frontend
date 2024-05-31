// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6lsYl7iyJpZ8uF0z79vzIwjae-oLWIUU",
  authDomain: "gingersocietyorg.firebaseapp.com",
  projectId: "gingersocietyorg",
  storageBucket: "gingersocietyorg.appspot.com",
  messagingSenderId: "675766508318",
  appId: "1:675766508318:web:3d9c9811e0c95abc52470f",
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);



export const onAuthChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUserId = (): string | null => {
  return auth.currentUser?.uid || null;
};