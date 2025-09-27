// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
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
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

console.log('🔥 Firebase initialized successfully');

export { db, app };