import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage'; // Importando o Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyCRAejF0axsoPK69RK3I0NYoverZ7n_wbg",
  authDomain: "gicanas-de-igrejas.firebaseapp.com",
  databaseURL: "https://gicanas-de-igrejas-default-rtdb.firebaseio.com",
  projectId: "gicanas-de-igrejas",
  storageBucket: "gicanas-de-igrejas.appspot.com",
  messagingSenderId: "155613125749",
  appId: "1:155613125749:web:141c76a6fa199528a7ec3c",
  measurementId: "G-82XPRM64FD"
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);

// Inicializando o Realtime Database
const db = getDatabase(app);

// Inicializando o Firebase Storage
const storage = getStorage(app); // Adiciona a inicialização do Firebase Storage

export { db, storage }; // Exporta o `storage` junto com o `db`
