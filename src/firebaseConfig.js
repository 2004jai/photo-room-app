// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDydosMtmrBvV3QYRZxyAO1UB_WnG3NdfQ",
  authDomain: "photo-room-app.firebaseapp.com",
  projectId: "photo-room-app",
  storageBucket: "photo-room-app.firebasestorage.app",
  messagingSenderId: "333203765148",
  appId: "1:333203765148:web:943bdb484903caa7833a59"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const loginAnonymously = () => signInAnonymously(auth);
