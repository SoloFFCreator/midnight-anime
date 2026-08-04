import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyClcy2YXqryJAkg_wy1W4RLqkYMIsEg2Rk",
  authDomain: "mid-night-anime.firebaseapp.com",
  databaseURL: "https://mid-night-anime-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mid-night-anime",
  storageBucket: "mid-night-anime.firebasestorage.app",
  messagingSenderId: "655330045563",
  appId: "1:655330045563:web:3d99e3be8ad7cb2734bcde",
  measurementId: "G-XT3XC7RL7L"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
