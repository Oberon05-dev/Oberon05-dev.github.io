// firebase.js
// ===============
// Import Firebase SDK z CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


// >>> Wklejam Twoją konfigurację <<<

const firebaseConfig = {
  apiKey: "AIzaSyALC-aGuPe1Dy-BQFZAVnLzOpE6COD3BTg",
  authDomain: "inmedio-daty.firebaseapp.com",
  projectId: "inmedio-daty",
  storageBucket: "inmedio-daty.appspot.com",
  messagingSenderId: "476033866234",
  appId: "1:476033866234:web:d28987954f6bbf512ec43"
};

// ======================================
// Inicjalizacja Firebase i Firestore
// ======================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ======================================
// ID sklepu (można rozszerzyć później)
// ======================================
const SHOP_ID = "sklep1";

// ======================================
// Integracja z Twoim App.io
// ======================================

window.App = window.App || {};
App.io = App.io || {};


// ------------------------
//  Wczytywanie z chmury
// ------------------------
App.io.loadFromCloud = async function () {
  try {
    const ref = doc(db, "shops", SHOP_ID);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();

      App.state.products = Array.isArray(data.products) ? data.products : [];

      console.log("🔥 Wczytano dane z chmury:", App.state.products);
    } else {
      console.log("⚠️ Dokument nie istnieje – start od pustej listy");
      App.state.products = [];
    }

    // Odśwież tabelę po wczytaniu
    if (App.object?.table?.Products && App.object?.table?.Batch) {
      App.ui.renderTable("product", App.object.table.Products, App.object.table.Batch, App.state.products);
    }
  } catch (err) {
    console.error("Błąd przy loadFromCloud:", err);
  }
};


// ------------------------
//  ZAPIS do chmury
// ------------------------
App.io.saveToCloud = async function () {
  try {
    const ref = doc(db, "shops", SHOP_ID);

    await setDoc(ref, {
      products: App.state.products,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log("💾 Dane zapisane do chmury!");
    alert("Zapisano do chmury! ✔");
  } catch (err) {
    console.error("Błąd przy saveToCloud:", err);
    alert("❌ Błąd zapisu do chmury!");
  }
};
