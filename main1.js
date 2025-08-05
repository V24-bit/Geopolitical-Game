// Inizializza Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC-nxzpcf5I_NHkKbWbLXRFRRzQLv9ilWU",
  authDomain: "geopolitical-game-5f135.firebaseapp.com",
  projectId: "geopolitical-game-5f135",
  storageBucket: "geopolitical-game-5f135.firebasestorage.app",
  messagingSenderId: "537294174901",
  appId: "1:537294174901:web:0c0eebedfd927cc8e65cfc"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Riferimenti UI
const createGameBtn    = document.getElementById("create-game-btn");
const joinGameBtn      = document.getElementById("join-game-btn");
const joinForm         = document.getElementById("join-form");
const joinSubmitBtn    = document.getElementById("join-submit-btn");
const gameCodeInput    = document.getElementById("game-code-input");
const gameCodePanel    = document.getElementById("game-code-panel");
const gameCodeValue    = document.getElementById("game-code-value");
const playerListPanel  = document.getElementById("player-list-panel");
const startGameBtn     = document.getElementById("start-game-btn");
const nationInput      = document.getElementById("nation-name");
const uiContainer      = document.getElementById("ui-container");

let currentCode = null;
let hostName    = null;

// Crea Partita
createGameBtn.onclick = async () => {
  joinForm.style.display    = "none";
  joinGameBtn.style.display = "none";

  const nazione = nationInput.value.trim();
  if (!nazione) return alert("Inserisci il nome della nazione");

  const codice = Math.random().toString(36).substring(2, 6).toUpperCase();
  hostName = nazione;
  currentCode = codice;

  await db.collection("partite").doc(codice).set({
    codice,
    host: nazione,
    giocatori: [nazione],
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    started: false
  });

  showLobby();
};

// Unisciti a Partita
joinGameBtn.onclick = () => {
  joinForm.style.display = "block";
};

joinSubmitBtn.onclick = async () => {
  const codice = gameCodeInput.value.trim().toUpperCase();
  const nazione = nationInput.value.trim();
  if (!codice || !nazione) return alert("Inserisci tutti i campi");

  const ref = db.collection("partite").doc(codice);
  const doc = await ref.get();
  if (!doc.exists) return alert("Partita non trovata");

  const data = doc.data();
  hostName = data.host;
  currentCode = codice;

  if (data.giocatori.includes(nazione))
    return alert("Nome nazione già usato in questa partita");

  await ref.update({
    giocatori: [...data.giocatori, nazione]
  });

  showLobby();
};

// Mostra Lobby (codice + lista)
function showLobby() {
  // mostra codice e start button
  gameCodePanel.style.display = "flex";
  gameCodeValue.textContent   = currentCode;
  startGameBtn.style.display  = (nationInput.value.trim() === hostName)
    ? "inline-block" : "none";

  // ogni volta che cambiano i dati in Firestore aggiorna lista
  db.collection("partite").doc(currentCode)
    .onSnapshot(snap => {
      const { giocatori, host, started } = snap.data();
      // aggiorna lista
      playerListPanel.innerHTML = "";
      giocatori.forEach(p => {
        const li = document.createElement("li");
        li.textContent = p + (p === host ? " (Host)" : "");
        if (p === host) li.classList.add("host");
        playerListPanel.appendChild(li);
      });
      // se l’host ha già avviato, mostra la mappa
      if (started) {
        uiContainer.style.display    = "none";
        document.getElementById("game-map").style.display = "block";
        window.generateAndShowMapOnStart();
      }
    });
}

// Inizia Partita (solo host)
startGameBtn.onclick = async () => {
  await db.collection("partite")
    .doc(currentCode)
    .update({ started: true });
};
