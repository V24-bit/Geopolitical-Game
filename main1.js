// Inizializza Firebase (usa i tuoi valori del progetto!) const firebaseConfig = { apiKey: "API_KEY_TUA", authDomain: "DOMINIO.firebaseapp.com", projectId: "geopolitical-game-5f135", storageBucket: "geopolitical-game-5f135.appspot.com", messagingSenderId: "123456789", appId: "APP_ID_TUA" };

firebase.initializeApp(firebaseConfig); const db = firebase.firestore();

// --- UI --- const createGameBtn = document.getElementById("create-game-btn"); const joinGameBtn = document.getElementById("join-game-btn"); const joinForm = document.getElementById("join-form"); const joinSubmitBtn = document.getElementById("join-submit-btn"); const gameCodeInput = document.getElementById("game-code-input"); const startGameBtn = document.getElementById("start-game-btn"); const gameCodePanel = document.getElementById("game-code-panel"); const gameCodeValue = document.getElementById("game-code-value"); const nationInput = document.getElementById("nation-name"); const nationColorInput = document.getElementById("nation-color"); const colorPickerGrid = document.getElementById("color-picker-grid"); const uiContainer = document.getElementById("ui-container"); const playersPanel = document.getElementById("players-panel"); const playersList = document.getElementById("players-list");

// Variabili globali per tracciare lo stato let currentGameCode = null; let currentPlayerName = null; let currentPlayerColor = null; let playerColors = {}; let isHost = false; let gameListener = null;

// Colori disponibili const AVAILABLE_COLORS = [ { name: "Rosso", hex: "#FF6B6B" }, { name: "Turchese", hex: "#00D4D4" }, { name: "Blu Cielo", hex: "#4DB8FF" }, { name: "Salmone", hex: "#FF8A80" }, { name: "Menta", hex: "#80E8B8" }, { name: "Giallo Oro", hex: "#FFD700" }, { name: "Lavanda", hex: "#D4A5FF" }, { name: "Azzurro", hex: "#5DADE2" }, { name: "Albicocca", hex: "#FFBE99" }, { name: "Blu Pastello", hex: "#A4C8E1" }, { name: "Verde Acqua", hex: "#66CDAA" }, { name: "Rosa Corallo", hex: "#FF9999" } ];

// Inizializza il color picker function initializeColorPicker() { colorPickerGrid.innerHTML = ""; AVAILABLE_COLORS.forEach((color) => { const option = document.createElement("div"); option.className = "color-option"; option.style.backgroundColor = color.hex; option.title = color.name; option.dataset.color = color.hex;

Code
if (color.hex === nationColorInput.value) {
  option.classList.add("selected");
}

option.addEventListener("click", () => {
  document.querySelectorAll(".color-option").forEach(opt => opt.classList.remove("selected"));
  option.classList.add("selected");
  nationColorInput.value = color.hex;
});

colorPickerGrid.appendChild(option);
}); }

// --- Gestione Sidebar Informazioni Tile --- const tileInfoSidebar = document.getElementById("tile-info-sidebar"); const closeSidebarBtn = document.getElementById("close-sidebar-btn"); const tileHexagon = document.getElementById("tile-hexagon"); const tileTerrainButton = document.getElementById("tile-terrain-button"); const tileCoordinates = document.getElementById("tile-coordinates"); const tileOwner = document.getElementById("tile-owner"); const tileResources = document.getElementById("tile-resources"); const tilePopulation = document.getElementById("tile-population"); const tileDefense = document.getElementById("tile-defense");

// Funzione per mostrare le informazioni del tile window.showTileInfo = function(tileData) { // Aggiorna le informazioni del tile tileCoordinates.textContent = ${tileData.x || 0}, ${tileData.y || 0}; tileTerrainButton.textContent = tileData.terrain || "Sconosciuto"; tileOwner.textContent = tileData.owner || "Nessuno"; tileResources.textContent = tileData.resources || "Nessuna"; tilePopulation.textContent = tileData.population || "0"; tileDefense.textContent = tileData.defense || "0";

// Usa il colore RGB passato dai dati del tile const terrainColor = tileData.color || "rgb(144, 238, 144)"; // Fallback a verde pianura

// Aggiorna il colore dell'esagono e del bottone tileHexagon.style.background = terrainColor; tileTerrainButton.style.background = terrainColor; tileTerrainButton.style.setProperty('background', terrainColor, 'important');

// Rimuovi la classe closing se presente tileInfoSidebar.classList.remove("closing");

// Mostra la sidebar con animazione tileInfoSidebar.classList.add("open"); };

// Funzione per nascondere le informazioni del tile window.hideTileInfo = function() { // Aggiungi classe closing per animazione di uscita tileInfoSidebar.classList.add("closing");

// Dopo l'animazione, rimuovi entrambe le classi setTimeout(() => { tileInfoSidebar.classList.remove("open"); tileInfoSidebar.classList.remove("closing"); }, 400); // Durata dell'animazione };

// Event listener per il pulsante di chiusura closeSidebarBtn.addEventListener("click", window.hideTileInfo);

// Esponi le variabili globali per il map-generator.js window.currentGameCode = null; window.currentPlayerName = null; window.db = db;

// Funzione per aggiornare la lista giocatori function updatePlayersList(giocatori, hostName) { playersList.innerHTML = ''; giocatori.forEach(player => { const playerDiv = document.createElement('div'); playerDiv.className = 'player-item';

Code
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
}); }

// --- Crea Partita --- createGameBtn.onclick = async () => { // Nascondi il form di join se era visibile joinForm.style.display = "none";

const codice = Math.random().toString(36).substring(2, 6).toUpperCase(); const nazione = nationInput.value.trim(); const colore = nationColorInput.value;

if (!nazione) return alert("Inserisci il nome della nazione");

try { const playerColorsMap = {}; playerColorsMap[nazione] = colore;

Code
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

// Segnala che siamo l'host
isHost = true;
window.isHost = true;

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
} catch (error) { console.error("Errore nella creazione della partita:", error); alert("Errore nella creazione della partita. Controlla la configurazione Firebase."); } };

// Funzione per ascoltare i cambiamenti nella partita function listenToGameChanges(codice) { // Rimuovi listener precedente se esiste if (gameListener) { gameListener(); }

gameListener = db.collection("partite").doc(codice).onSnapshot((doc) => { if (doc.exists) { const data = doc.data();

Code
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
  
  // Determina se l'utente corrente è l'host basandosi sul documento aggiornato
  // Usa currentPlayerName (aggiornato quando si crea/si unisce) come fonte di verità
  isHost = (data.host === currentPlayerName);
  window.isHost = isHost;

  // Mostra o nascondi il bottone start basandosi su isHost
  startGameBtn.style.display = isHost ? "inline-block" : "none";

  // Log per debug (rimuovere in produzione se non necessario)
  console.log("listenToGameChanges: host in doc:", data.host, "currentPlayerName:", currentPlayerName, "isHost:", isHost);
  
  // Se la partita è iniziata, mostra la mappa per tutti
  if (data.gameStarted && data.mapSeed) {
    startGameForAllPlayers(data.mapSeed);
  }
}
}); }

// --- Unisciti a Partita --- joinGameBtn.onclick = () => { // Nascondi il pannello del codice partita e il pannello giocatori se erano visibili gameCodePanel.style.display = "none"; playersPanel.style.display = "none"; // Non forzare qui la visibilità del bottone Start: lascia che sia il listener a decidere in base allo stato e al nome del giocatore // startGameBtn.style.display = "none";

joinForm.style.display = "block"; };

joinSubmitBtn.onclick = async () => { const codice = gameCodeInput.value.trim().toUpperCase(); const nazione = nationInput.value.trim(); const colore = nationColorInput.value;

if (!codice || !nazione) return alert("Inserisci tutti i campi");

try { const partitaRef = db.collection("partite").doc(codice); const doc = await partitaRef.get(); if (!doc.exists) return alert("Partita non trovata");

Code
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

// Determina se siamo host (probabilmente no quando ci uniamo)
isHost = (data.host === nazione);
window.isHost = isHost;

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
} catch (error) { console.error("Errore nell'unirsi alla partita:", error); alert("Errore nell'unirsi alla partita. Controlla la configurazione Firebase."); } };

// --- Inizia partita (solo per l'host) --- startGameBtn.onclick = () => { if (!isHost) { alert("Solo l'host può iniziare la partita!"); return; }

// Genera un seed condiviso per la mappa const mapSeed = Math.random();

// Aggiorna il documento della partita con lo stato "iniziata" e il seed db.collection("partite").doc(currentGameCode).update({ gameStarted: true, mapSeed: mapSeed, startedAt: firebase.firestore.FieldValue.serverTimestamp() }).then(() => { console.log("Partita iniziata con seed:", mapSeed); }).catch((error) => { console.error("Errore nell'iniziare la partita:", error); alert("Errore nell'iniziare la partita"); }); };

// Funzione per iniziare il gioco per tutti i giocatori function startGameForAllPlayers(mapSeed) { console.log("Iniziando gioco per tutti i giocatori con seed:", mapSeed);

// Verifica che la funzione esista if (typeof window.generateAndShowMapWithSeed !== "function") { console.error("Funzione generateAndShowMapWithSeed non trovata!"); console.log("Funzioni window disponibili:", Object.keys(window).filter(k => k.includes('generate'))); alert("Errore: Generatore di mappe non caricato correttamente. Ricarica la pagina."); return; }

// Nascondi UI uiContainer.style.display = "none";

// Genera la mappa con il seed condiviso try { console.log("Chiamando generateAndShowMapWithSeed con seed:", mapSeed); window.generateAndShowMapWithSeed(mapSeed); } catch (error) { console.error("Errore nella generazione della mappa:", error); alert("Errore nella generazione della mappa: " + error.message + ". Ricarica la pagina."); // Mostra di nuovo l'UI in caso di errore uiContainer.style.display = "flex"; } }

// Funzione per lasciare la partita (opzionale) function leaveGame() { if (currentGameCode && currentPlayerName) { // Implementa la logica per rimuovere il giocatore dalla partita // e resettare l'interfaccia } }

// Inizializza il color picker quando la pagina si carica document.addEventListener("DOMContentLoaded", () => { initializeColorPicker(); });
