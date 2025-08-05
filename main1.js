// ——— Config Firebase ———
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

// ——— Rimozione partite vecchie (client-side) ———
async function cleanupOldGames() {
  const cutoffDate      = new Date(Date.now() - 7*24*60*60*1000);
  const cutoffTimestamp = firebase.firestore.Timestamp.fromDate(cutoffDate);
  const oldSnap = await db.collection('partite')
    .where('createdAt', '<=', cutoffTimestamp)
    .get();
  const batch = db.batch();
  oldSnap.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}
cleanupOldGames().catch(console.error);

// ——— Riferimenti UI ———
const mainUI        = document.getElementById("main-ui");
const lobbyPanel    = document.getElementById("lobby-panel");
const playerList    = document.getElementById("player-list");
const lobbyGameCode = document.getElementById("lobby-game-code");
const createGameBtn = document.getElementById("create-game-btn");
const joinGameBtn   = document.getElementById("join-game-btn");
const joinForm      = document.getElementById("join-form");
const joinSubmitBtn = document.getElementById("join-submit-btn");
const gameCodeInput = document.getElementById("game-code-input");
const startGameBtn  = document.getElementById("start-game-btn");
const nationInput   = document.getElementById("nation-name");
const uiContainer   = document.getElementById("ui-container");

// Variabili di stato
let currentCode = null;
let currentHost = null;

// ——— Crea Partita ———
createGameBtn.onclick = async () => {
  joinForm.style.display    = "none";
  joinGameBtn.style.display = "none";

  const codice  = Math.random().toString(36).substring(2, 6).toUpperCase();
  const nazione = nationInput.value.trim();
  if (!nazione) return alert("Inserisci il nome della nazione");

  // Salva host e timestamp
  await db.collection("partite").doc(codice).set({
    codice,
    host: nazione,
    giocatori: [nazione],
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    started: false
  });

  enterLobby(codice, nazione);
};

// ——— Unisciti a Partita ———
joinGameBtn.onclick = () => joinForm.style.display = "block";

joinSubmitBtn.onclick = async () => {
  const codice  = gameCodeInput.value.trim().toUpperCase();
  const nazione = nationInput.value.trim();
  if (!codice || !nazione) return alert("Inserisci tutti i campi");

  const ref = db.collection("partite").doc(codice);
  const doc = await ref.get();
  if (!doc.exists) return alert("Partita non trovata");

  const data = doc.data();
  if (data.giocatori.includes(nazione))
    return alert("Nome nazione già usato in questa partita");

  await ref.update({
    giocatori: [...data.giocatori, nazione]
  });

  enterLobby(codice, data.host);
};

// ——— Entra in Lobby ———
function enterLobby(codice, host) {
  currentCode = codice;
  currentHost = host;

  // UI
  mainUI.style.display      = "none";
  lobbyPanel.style.display  = "block";
  lobbyGameCode.textContent = codice;
  startGameBtn.style.display = (nationInput.value.trim() === host)
    ? "inline-block" : "none";

  // Ascolta in real-time le modifiche al documento
  db.collection("partite").doc(codice)
    .onSnapshot(snapshot => {
      const data = snapshot.data();
      updatePlayerList(data.giocatori, data.host);
      if (data.started) {
        showMap();
      }
    });
}

// ——— Aggiorna Lista Giocatori ———
function updatePlayerList(players, host) {
  playerList.innerHTML = "";
  players.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p + (p === host ? " (Host)" : "");
    if (p === host) li.style.fontWeight = "bold";
    playerList.appendChild(li);
  });
}

// ——— Inizia Partita (solo host) ———
startGameBtn.onclick = async () => {
  await db.collection("partite").doc(currentCode).update({ started: true });
};

// ——— Mostra la Mappa a Tutti ———
function showMap() {
  uiContainer.style.display = "none";
  const canvas = document.getElementById("game-map");
  canvas.style.display      = "block";
  if (typeof window.generateAndShowMapOnStart === "function") {
    window.generateAndShowMapOnStart();
  } else {
    console.error("Funzione generateAndShowMapOnStart non trovata");
  }
}
