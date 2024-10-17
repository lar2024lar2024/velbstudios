import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'; // Importando o Firestore
import { getStorage } from 'firebase/storage'; // Importando o Firebase Storage
import { getDatabase } from 'firebase/database'; // Importando o Realtime Database

const firebaseConfig = {
  apiKey: "AIzaSyCRAejF0axsoPK69RK3I0NYoverZ7n_wbg",
  authDomain: "gicanas-de-igrejas.firebaseapp.com",
  databaseURL: "https://gicanas-de-igrejas-default-rtdb.firebaseio.com", // Adicione a URL do Realtime Database aqui
  projectId: "gicanas-de-igrejas",
  storageBucket: "gicanas-de-igrejas.appspot.com",
  messagingSenderId: "155613125749",
  appId: "1:155613125749:web:141c76a6fa199528a7ec3c",
  measurementId: "G-82XPRM64FD"
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);

// Inicializando o Firestore
const db = getFirestore(app);

// Inicializando o Firebase Storage
const storage = getStorage(app);

// Inicializando o Realtime Database
const realtimeDb = getDatabase(app); // Configuração do Realtime Database

// Exporta o Firestore `db`, o Firebase Storage `storage`, e o Realtime Database `realtimeDb`
export { db, storage, realtimeDb };
