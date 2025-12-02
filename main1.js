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
const nationColorInput = document.getElementById("nation-color");
const colorPickerGrid = document.getElementById("color-picker-grid");
const uiContainer = document.getElementById("ui-container");
const playersPanel = document.getElementById("players-panel");
const playersList = document.getElementById("players-list");

// Variabili globali per tracciare lo stato
let currentGameCode = null;
let currentPlayerName = null;
let currentPlayerColor = null;
let playerColors = {};
let isHost = false;
let gameListener = null;

// Colori disponibili
const AVAILABLE_COLORS = [
  { name: "Rosso Vivo", hex: "#E63946" },
  { name: "Arancione", hex: "#FF8C42" },
  { name: "Giallo", hex: "#FFD60A" },
  { name: "Verde Lime", hex: "#06A77D" },
  { name: "Verde Scuro", hex: "#1B4332" },
  { name: "Turchese", hex: "#00D9FF" },
  { name: "Blu Reale", hex: "#1E40AF" },
  { name: "Blu Profondo", hex: "#0066CC" },
  { name: "Viola", hex: "#7209B7" },
  { name: "Magenta", hex: "#E619E6" },
  { name: "Rosa Acceso", hex: "#FF006E" },
  { name: "Marrone", hex: "#8B4513" }
];

// Inizializza il color picker
function initializeColorPicker() {
  colorPickerGrid.innerHTML = "";
  AVAILABLE_COLORS.forEach((color) => {
    const option = document.createElement("div");
    option.className = "color-option";
    option.setAttribute("style", `background-color: ${color.hex} !important;`);
    option.title = color.name;
    option.dataset.color = color.hex;

    if (color.hex === nationColorInput.value) {
      option.classList.add("selected");
    }

    option.addEventListener("click", () => {
      document.querySelectorAll(".color-option").forEach(opt => opt.classList.remove("selected"));
      option.classList.add("selected");
      nationColorInput.value = color.hex;
    });

    colorPickerGrid.appendChild(option);
  });
}

// --- Gestione Sidebar Informazioni Tile ---
const tileInfoSidebar = document.getElementById("tile-info-sidebar");
const closeSidebarBtn = document.getElementById("close-sidebar-btn");
const tileHexagon = document.getElementById("tile-hexagon");
const tileTerrainButton = document.getElementById("tile-terrain-button");
const tileCoordinates = document.getElementById("tile-coordinates");
const tileOwner = document.getElementById("tile-owner");
const tileResources = document.getElementById("tile-resources");
const tilePopulation = document.getElementById("tile-population");
const tileDefense = document.getElementById("tile-defense");

// Funzione per mostrare le informazioni del tile
window.showTileInfo = function(tileData) {
  // Aggiorna le informazioni del tile
  tileCoordinates.textContent = `${tileData.x || 0}, ${tileData.y || 0}`;
  tileTerrainButton.textContent = tileData.terrain || "Sconosciuto";
  tileOwner.textContent = tileData.owner || "Nessuno";
  tileResources.textContent = tileData.resources || "Nessuna";
  tilePopulation.textContent = tileData.population || "0";
  tileDefense.textContent = tileData.defense || "0";

  // Usa il colore RGB passato dai dati del tile
  const terrainColor = tileData.color || "rgb(144, 238, 144)"; // Fallback a verde pianura

  // Aggiorna il colore dell'esagono e del bottone
  tileHexagon.style.background = terrainColor;
  tileTerrainButton.style.background = terrainColor;
  tileTerrainButton.style.setProperty('background', terrainColor, 'important');

  // Rimuovi la classe closing se presente
  tileInfoSidebar.classList.remove("closing");

  // Mostra la sidebar con animazione
  tileInfoSidebar.classList.add("open");
};

// Funzione per nascondere le informazioni del tile
window.hideTileInfo = function() {
  // Aggiungi classe closing per animazione di uscita
  tileInfoSidebar.classList.add("closing");

  // Dopo l'animazione, rimuovi entrambe le classi
  setTimeout(() => {
    tileInfoSidebar.classList.remove("open");
    tileInfoSidebar.classList.remove("closing");
  }, 400); // Durata dell'animazione
};

// Event listener per il pulsante di chiusura
closeSidebarBtn.addEventListener("click", window.hideTileInfo);

// Esponi le variabili globali per il map-generator.js
window.currentGameCode = null;
window.currentPlayerName = null;
window.db = db;

// Funzione per aggiornare la lista giocatori
function updatePlayersList(giocatori, hostName) {
  playersList.innerHTML = '';
  giocatori.forEach(player => {
    const playerDiv = document.createElement('div');
    playerDiv.className = 'player-item';

    const playerColor = playerColors[player] || '#FFFFFF';
    playerDiv.style.color = playerColor;

    if (player === hostName) {
      playerDiv.classList.add('host');
      const span = document.createElement('span');
      span.textContent = `${player}`;
      playerDiv.appendChild(span);
    } else {
      const span = document.createElement('span');
      span.textContent = player;
      playerDiv.appendChild(span);
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
  const colore = nationColorInput.value;

  if (!nazione) return alert("Inserisci il nome della nazione");

  try {
    const playerColorsMap = {};
    playerColorsMap[nazione] = colore;

    await db.collection("partite").doc(codice).set({
      codice,
      host: nazione,
      giocatori: [nazione],
      playerColors: playerColorsMap,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Aggiorna variabili globali
    currentGameCode = codice;
    currentPlayerName = nazione;
    currentPlayerColor = colore;
    playerColors = playerColorsMap;

    // Aggiorna variabili globali esposte
    window.currentGameCode = codice;
    window.currentPlayerName = nazione;
    window.currentPlayerColor = colore;
    window.playerColors = playerColorsMap;

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
  // Rimuovi listener precedente se esiste
  if (gameListener) {
    gameListener();
  }

  gameListener = db.collection("partite").doc(codice).onSnapshot((doc) => {
    if (doc.exists) {
      const data = doc.data();

      // Sincronizza i colori dei giocatori
      if (data.playerColors) {
        playerColors = { ...data.playerColors };
        window.playerColors = playerColors;
      }

      updatePlayersList(data.giocatori, data.host);
      
      // Aggiorna le nazioni posizionate se esistono
      if (data.nazioni && window.placedNations) {
        // Aggiorna le nazioni globali mantenendo quelle esistenti
        Object.assign(window.placedNations, data.nazioni);
        // Ridisegna la mappa se è visibile
        const canvas = document.getElementById("game-map");
        if (canvas.style.display === "block" && window.redrawMapWithNations) {
          // Usa setTimeout per evitare conflitti di rendering
          setTimeout(() => {
            window.redrawMapWithNations();
          }, 50);
        }
      }
      
      // Mostra il bottone start solo per l'host
      if (isHost) {
        startGameBtn.style.display = "inline-block";
      } else {
        startGameBtn.style.display = "none";
      }
      
      // Se la partita è iniziata, mostra la mappa per tutti
      if (data.gameStarted && data.mapSeed) {
        startGameForAllPlayers(data.mapSeed);
      }
    }
  });
}

// --- Unisciti a Partita ---
joinGameBtn.onclick = () => {
  // Nascondi il form di creazione partita
  const nationForm = document.getElementById("nation-form");
  nationForm.style.display = "none";

  // Nascondi i bottoni di azione
  const actionsDiv = document.querySelector(".actions");
  actionsDiv.style.display = "none";

  // Nascondi il pannello del codice partita e il bottone start se erano visibili
  gameCodePanel.style.display = "none";
  playersPanel.style.display = "none";
  startGameBtn.style.display = "none";

  // Mostra il form di join
  joinForm.style.display = "flex";
};

joinSubmitBtn.onclick = async () => {
  const codice = gameCodeInput.value.trim().toUpperCase();
  const nazione = nationInput.value.trim();
  const colore = nationColorInput.value;

  if (!codice || !nazione) return alert("Inserisci tutti i campi");

  try {
    const partitaRef = db.collection("partite").doc(codice);
    const doc = await partitaRef.get();
    if (!doc.exists) return alert("Partita non trovata");

    const data = doc.data();
    if (data.giocatori.includes(nazione)) return alert("Nome già usato");

    // Verifica se il colore è già usato
    const existingColors = Object.values(data.playerColors || {});
    if (existingColors.includes(colore)) {
      return alert("Colore già scelto da un altro giocatore. Scegline un altro.");
    }

    // Aggiorna la lista giocatori e i colori
    const newPlayerColors = { ...data.playerColors, [nazione]: colore };

    await partitaRef.update({
      giocatori: [...data.giocatori, nazione],
      playerColors: newPlayerColors
    });

    // Aggiorna variabili globali
    currentGameCode = codice;
    currentPlayerName = nazione;
    currentPlayerColor = colore;
    playerColors = newPlayerColors;

    // Aggiorna variabili globali esposte
    window.currentGameCode = codice;
    window.currentPlayerName = nazione;
    window.currentPlayerColor = colore;
    window.playerColors = newPlayerColors;

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
  
  // Genera un seed condiviso per la mappa
  const mapSeed = Math.random();
  
  // Aggiorna il documento della partita con lo stato "iniziata" e il seed
  db.collection("partite").doc(currentGameCode).update({
    gameStarted: true,
    mapSeed: mapSeed,
    startedAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    console.log("Partita iniziata con seed:", mapSeed);
  }).catch((error) => {
    console.error("Errore nell'iniziare la partita:", error);
    alert("Errore nell'iniziare la partita");
  });
};

// Funzione per iniziare il gioco per tutti i giocatori
function startGameForAllPlayers(mapSeed) {
  console.log("Iniziando gioco per tutti i giocatori con seed:", mapSeed);
  
  // Verifica che la funzione esista
  if (typeof window.generateAndShowMapWithSeed !== "function") {
    console.error("Funzione generateAndShowMapWithSeed non trovata!");
    console.log("Funzioni window disponibili:", Object.keys(window).filter(k => k.includes('generate')));
    alert("Errore: Generatore di mappe non caricato correttamente. Ricarica la pagina.");
    return;
  }
  
  // Nascondi UI
  uiContainer.style.display = "none";
  
  // Genera la mappa con il seed condiviso
  try {
    console.log("Chiamando generateAndShowMapWithSeed con seed:", mapSeed);
    window.generateAndShowMapWithSeed(mapSeed);
  } catch (error) {
    console.error("Errore nella generazione della mappa:", error);
    alert("Errore nella generazione della mappa: " + error.message + ". Ricarica la pagina.");
    // Mostra di nuovo l'UI in caso di errore
    uiContainer.style.display = "flex";
  }
}

// Funzione per lasciare la partita (opzionale)
function leaveGame() {
  if (currentGameCode && currentPlayerName) {
    // Implementa la logica per rimuovere il giocatore dalla partita
    // e resettare l'interfaccia
  }
}

// Inizializza il color picker
if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", initializeColorPicker);
} else {
  initializeColorPicker();
}

