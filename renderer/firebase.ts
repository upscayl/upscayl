// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  type DocumentData,
  CollectionReference,
  collection,
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwD3AM0XKRsHnA0YU-CKTSSD4xcfDu9wU",
  authDomain: "upscayl.firebaseapp.com",
  projectId: "upscayl",
  storageBucket: "upscayl.appspot.com",
  messagingSenderId: "1096660154086",
  appId: "1:1096660154086:web:ec1872e9ceb11dad686d27",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const createCollection = <T = DocumentData>(collectionName: string) => {
  return collection(db, collectionName) as CollectionReference<T>;
};

export const waitlistCollection = createCollection<{
  name: string;
  email: string;
}>("waitlist");
