// Replace everything below with your config from Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyDKc_DVWrgLSmlh5S3ds_siqTyyfwPQUZQ",
  authDomain: "haah-chat.firebaseapp.com",
  projectId: "haah-chat",
  storageBucket: "haah-chat.firebasestorage.app",
  messagingSenderId: "957323289220",
  appId: "1:957323289220:web:c138efa2cd45343dc918d1"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
