import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDVK78GcJyHjoT_tNgmVh_0mxtJkVtv5C8",
  authDomain: "lovefinder-55885.firebaseapp.com",
  projectId: "lovefinder-55885",
  storageBucket: "lovefinder-55885.firebasestorage.app",
  messagingSenderId: "764689238457",
  appId: "1:764689238457:web:e31aa4c4511641f6894e68",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


export { auth, db, storage };
