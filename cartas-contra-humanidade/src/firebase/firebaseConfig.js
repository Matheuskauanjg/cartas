// src/firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAhIljaPlzo0WGd84RmKkabhBq_5rNfG6g",
    authDomain: "cartas-b2d5d.firebaseapp.com",
    projectId: "cartas-b2d5d",
    storageBucket: "cartas-b2d5d.firebasestorage.app",
    messagingSenderId: "458255866753",
    appId: "1:458255866753:web:5016e0a9a43b29183fe680"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
