// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, setDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

// TODO: Cole aqui as configurações do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyApEIAZnP0vY90FB6lgeqHfLK29xmbRbEI",
  authDomain: "quifabraloja.firebaseapp.com",
  projectId: "quifabraloja",
  storageBucket: "quifabraloja.firebasestorage.app",
  messagingSenderId: "1080972695767",
  appId: "1:1080972695767:web:66afdf99dbee15122ef892",
  measurementId: "G-1MDVV7PKDX"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, storage, ref, uploadBytes, getDownloadURL, googleProvider, signInWithPopup, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, collection, addDoc, setDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot };

