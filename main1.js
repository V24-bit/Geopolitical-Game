// Inizializza Firebase (usa i tuoi valori del progetto!)
const firebaseConfig = {
  apiKey: "API_KEY_TUA",
  authDomain: "DOMINIO.firebaseapp.com",
  projectId: "geopolitical-game-5f135",
  storageBucket: "geopolitical-game-5f135.appspot.com",
  messagingSenderId: "123456789",
  appId: "APP_ID_TUA"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- UI ---
const createGameBtn = document.getElementById("create-game-btn");
const joinGameBtn = document.getElementById("join-game-btn");
const joinForm = document.getElementById("join-form");
const joinSubmitBtn = document.getElementById("join-submit-btn");
const gameCodeInput = document.getElementById("game-code-input");
const startGameBtn = document.getElementById("start-game-btn");
const gameCodePanel = document.getElementById("game-code-panel");
const gameCodeValue = document.getElementById("game-code-value");
const nationInput = document.getElementById("nation-name");
const uiContainer = document.getElementById("ui-container");

// --- Creazione Partita ---
createGameBtn.onclick = async () => {
  // Nascondi form di join se rimasto aperto
  joinForm.style.display = "none";
  // Nascondi il bottone Unisciti a partita
  joinGameBtn.style.display = "none";

  const codice = Math.random().toString(36).substring(2, 6).toUpperCase();
  const nazione = nationInput.value.trim();

  if (!nazione) return alert("Inserisci il nome della nazione");

  await db.collection("partite").doc(codice).set({
    codice,
    nazione,
    giocatori: [nazione]
  });

  gameCodePanel.style.display = "block";
  gameCodeValue.textContent = codice;
  startGameBtn.style.display = "inline-block";
};

// --- Unisciti a Partita ---
joinGameBtn.onclick = () => {
  joinForm.style.display = "block";
};

joinSubmitBtn.onclick = async () => {
  const codice = gameCodeInput.value.trim().toUpperCase();
  const nazione = nationInput.value.trim();

  if (!codice || !nazione) return alert("Inserisci tutti i campi");

  const partitaRef = db.collection("partite").doc(codice);
  const doc = await partitaRef.get();
  if (!doc.exists) return alert("Partita non trovata");

  const data = doc.data();
  if (data.giocatori.includes(nazione)) {
    return alert("Nome nazione già usato in questa partita");
  }

  await partitaRef.update({
    giocatori: [...data.giocatori, nazione]
  });

  gameCodePanel.style.display = "block";
  gameCodeValue.textContent = codice;
  startGameBtn.style.display = "inline-block";
};

// --- Inizia Partita ---
startGameBtn.onclick = () => {
  uiContainer.style.display = "none";
  const canvas = document.getElementById("game-map");
  canvas.style.display = "block";

  if (typeof window.generateAndShowMapOnStart === "function") {
    window.generateAndShowMapOnStart();
  } else {
    console.error("Funzione generateAndShowMapOnStart non trovata");
  }
};
