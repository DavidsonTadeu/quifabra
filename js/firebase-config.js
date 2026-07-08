// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// TODO: Cole aqui as configurações do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCKWuPwtuIzx4qerSVSGAs82TLGcEe0DU4",
  authDomain: "quifabra-loja.firebaseapp.com",
  projectId: "quifabra-loja",
  storageBucket: "quifabra-loja.firebasestorage.app",
  messagingSenderId: "868652267408",
  appId: "1:868652267408:web:ef369c8441729c33cca515",
  measurementId: "G-R4MVEH63K8"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, onSnapshot };
