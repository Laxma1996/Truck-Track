import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkxuBA1gEs_ECxWH0_U2LEgO-hwM01wQc",
  authDomain: "truck-tracking-96f49.firebaseapp.com",
  projectId: "truck-tracking-96f49",
  storageBucket: "truck-tracking-96f49.firebasestorage.app",
  messagingSenderId: "80187412106",
  appId: "1:80187412106:web:3d7a41dcbee6a2ab1b2773",
  measurementId: "G-MX4KH9E33C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Analytics (optional)
const analytics = getAnalytics(app);

export { db, analytics };
export default app;
