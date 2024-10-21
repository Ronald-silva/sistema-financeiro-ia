import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA3XJBxEMblOg1sJOdpU9z3BYjoKwvGowI",
    authDomain: "financial-control-7388a.firebaseapp.com",
    projectId: "financial-control-7388a",
    storageBucket: "financial-control-7388a.appspot.com",
    messagingSenderId: "611667450102",
    appId: "1:611667450102:web:cf30a5e08b480678cbf4d7",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

