import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCQ6tQG3cFw8X9tBwUneASnZmXQDt7dVQI",
  authDomain: "test-6afed.firebaseapp.com",
  projectId: "test-6afed",
  storageBucket: "test-6afed.firebasestorage.app",
  messagingSenderId: "914674905742",
  appId: "1:914674905742:web:14e7e1ca20b2c43b770fdf",
  measurementId: "G-RHLJS2XQ49"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only in browser environment
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics }; 