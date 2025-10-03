// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBPFwKkXV_yO7GYaFlipS1jaEYal6-5Xko",
  authDomain: "lunar-wishtree.firebaseapp.com",
  projectId: "lunar-wishtree",
  storageBucket: "lunar-wishtree.firebasestorage.app",
  messagingSenderId: "266863222775",
  appId: "1:266863222775:web:9dce897820e6530d8558f2",
  measurementId: "G-MH17BJP57B"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

console.log('🔥 Firebase initialized successfully');
