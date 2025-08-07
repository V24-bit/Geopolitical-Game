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
const playersPanel = document.getElementById("players-panel");
const playersList = document.getElementById("players-list");

// Variabili globali per tracciare lo stato
let currentGameCode = null;
let currentPlayerName = null;
let isHost = false;

// Funzione per aggiornare la lista giocatori
function updatePlayersList(giocatori, hostName) {
  playersList.innerHTML = '';
  giocatori.forEach(player => {
    const playerDiv = document.createElement('div');
    playerDiv.className = 'player-item';
    if (player === hostName) {
      playerDiv.classList.add('host');
      playerDiv.textContent = `${player} (Host)`;
    } else {
      playerDiv.textContent = player;
    }
    playersList.appendChild(playerDiv);
  });
}

// --- Crea Partita ---
createGameBtn.onclick = async () => {
  // Nascondi il form di join se era visibile
  joinForm.style.display = "none";
  
  const codice = Math.random().toString(36).substring(2, 6).toUpperCase();
  const nazione = nationInput.value.trim();

  if (!nazione) return alert("Inserisci il nome della nazione");

  try {
    await db.collection("partite").doc(codice).set({
      codice,
      host: nazione,
      giocatori: [nazione],
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Aggiorna variabili globali
    currentGameCode = codice;
    currentPlayerName = nazione;
    isHost = true;

    // Mostra pannelli
    gameCodePanel.style.display = "block";
    gameCodeValue.textContent = codice;
    playersPanel.style.display = "block";
    startGameBtn.style.display = "inline-block";

    // Aggiorna lista giocatori
    updatePlayersList([nazione], nazione);

    // Ascolta cambiamenti nella partita
    listenToGameChanges(codice);
  } catch (error) {
    console.error("Errore nella creazione della partita:", error);
    alert("Errore nella creazione della partita. Controlla la configurazione Firebase.");
  }
};

// Funzione per ascoltare i cambiamenti nella partita
function listenToGameChanges(codice) {
  db.collection("partite").doc(codice).onSnapshot((doc) => {
    if (doc.exists) {
      const data = doc.data();
      updatePlayersList(data.giocatori, data.host);
      
      // Mostra il bottone start solo per l'host
      if (isHost) {
        startGameBtn.style.display = "inline-block";
      } else {
        startGameBtn.style.display = "none";
      }
    }
  });
};

// --- Unisciti a Partita ---
joinGameBtn.onclick = () => {
  // Nascondi il pannello del codice partita e il bottone start se erano visibili
  gameCodePanel.style.display = "none";
  playersPanel.style.display = "none";
  startGameBtn.style.display = "none";
  
  joinForm.style.display = "block";
};

joinSubmitBtn.onclick = async () => {
  const codice = gameCodeInput.value.trim().toUpperCase();
  const nazione = nationInput.value.trim();

  if (!codice || !nazione) return alert("Inserisci tutti i campi");

  try {
    const partitaRef = db.collection("partite").doc(codice);
    const doc = await partitaRef.get();
    if (!doc.exists) return alert("Partita non trovata");

    const data = doc.data();
    if (data.giocatori.includes(nazione)) return alert("Nome già usato");

    await partitaRef.update({
      giocatori: [...data.giocatori, nazione]
    });

    // Aggiorna variabili globali
    currentGameCode = codice;
    currentPlayerName = nazione;
    isHost = false;

    // Nascondi form di join e mostra pannello giocatori
    joinForm.style.display = "none";
    playersPanel.style.display = "block";

    // Aggiorna lista giocatori
    updatePlayersList([...data.giocatori, nazione], data.host);

    // Ascolta cambiamenti nella partita
    listenToGameChanges(codice);

    alert("Ti sei unito alla partita " + codice);
  } catch (error) {
    console.error("Errore nell'unirsi alla partita:", error);
    alert("Errore nell'unirsi alla partita. Controlla la configurazione Firebase.");
  }
};

// --- Inizia partita (solo per l'host) ---
startGameBtn.onclick = () => {
  if (!isHost) {
    alert("Solo l'host può iniziare la partita!");
    return;
  }
  
  uiContainer.style.display = "none";
  const canvas = document.getElementById("game-map");
  canvas.style.display = "block";

  if (typeof window.generateAndShowMapOnStart === "function") {
    window.generateAndShowMapOnStart();
  } else {
    console.error("Funzione generateAndShowMapOnStart non trovata");
  }
};

// Funzione per lasciare la partita (opzionale)
function leaveGame() {
  if (currentGameCode && currentPlayerName) {
    // Implementa la logica per rimuovere il giocatore dalla partita
    // e resettare l'interfaccia
  }
}
  uiContainer.style.display = "none";
  const canvas = document.getElementById("game-map");
  canvas.style.display = "block";

  if (typeof window.generateAndShowMapOnStart === "function") {
    window.generateAndShowMapOnStart();
  } else {
    console.error("Funzione generateAndShowMapOnStart non trovata");
  }
};
