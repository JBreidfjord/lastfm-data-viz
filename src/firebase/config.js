import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyD3Ax3FSIh6Jg_V9E-60-fSnRjwVrULk_Q",
  authDomain: "lastfm-data-viz.firebaseapp.com",
  projectId: "lastfm-data-viz",
  storageBucket: "lastfm-data-viz.appspot.com",
  messagingSenderId: "751652618078",
  appId: "1:751652618078:web:c177271aaf078feb69d9cf",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
