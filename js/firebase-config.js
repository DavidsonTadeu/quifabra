// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

export { db, collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, onSnapshot };
