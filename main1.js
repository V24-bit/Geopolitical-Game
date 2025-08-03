// main1.js
import { generateAndShowMapOnStart } from './map-generator.js';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC-nxzpcf5I_NHkKbWbLXRFRRzQLv9ilWU",
  authDomain: "geopolitical-game-5f135.firebaseapp.com",
  projectId: "geopolitical-game-5f135",
  storageBucket: "geopolitical-game-5f135.appspot.com",
  messagingSenderId: "537294174901",
  appId: "1:537294174901:web:0c0eebedfd927cc8e65cfc"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function () {
  const joinBtn = document.getElementById('join-game-btn');
  const createBtn = document.getElementById('create-game-btn');
  const joinForm = document.getElementById('join-form');
  const gameCodePanel = document.getElementById('game-code-panel');
  const output = document.getElementById('output');
  const gameCodeLabel = document.getElementById('game-code-label');
  const gameCodeValue = document.getElementById('game-code-value');
  const joinSubmitBtn = document.getElementById('join-submit-btn');
  const gameCodeInput = document.getElementById('game-code-input');
  const nationName = document.getElementById('nation-name');
  const startGameBtn = document.getElementById('start-game-btn');

  let unsubscribeLobby = null;
  let currentGameCode = null;

  function showTempError(msg) {
    output.innerHTML = `<div id="temp-error-msg" style="color:#fff;background:#c00;margin:10px 0;font-weight:bold;text-align:center;padding:14px 18px;border-radius:9px;z-index:1000;font-size:1.14em;box-shadow:0 2px 16px #000a;">${msg}</div>`;
    setTimeout(() => {
      const temp = document.getElementById('temp-error-msg');
      if (temp) temp.remove();
    }, 4000);
  }

  function showLobby(doc, myNation) {
    if (!doc.exists) {
      output.textContent = "Errore: partita non trovata!";
      gameCodePanel?.style.setProperty("display", "none");
      startGameBtn?.style.setProperty("display", "none");
      return;
    }

    const data = doc.data();
    const code = data.codice || currentGameCode || "(codice non trovato)";
    gameCodeLabel.textContent = "Codice partita:";
    gameCodeValue.textContent = code;
    gameCodePanel.style.display = "block";

    let lobbyText = `Creatore: <b>${data.nazione}</b><br>`;
    lobbyText += "Giocatori nella stanza:<ul>";
    if (Array.isArray(data.giocatori)) {
      data.giocatori.forEach(n => {
        lobbyText += `<li>${n}${n === data.nazione ? " (creatore)" : ""}${n === myNation && n !== data.nazione ? " (tu)" : ""}</li>`;
      });
    }
    lobbyText += "</ul>";
    output.innerHTML = lobbyText;
    startGameBtn.style.display = "inline-block";
  }

  // Iniziale reset
  joinForm.style.display = "none";
  gameCodePanel.style.display = "none";
  startGameBtn.style.display = "none";

  joinBtn?.addEventListener('click', () => {
    if (!nationName.value.trim()) return showTempError('Inserisci un nome prima di unirti o creare una partita');
    joinForm.style.display = "flex";
    gameCodePanel.style.display = "none";
    output.textContent = "";
    gameCodeInput.value = "";
    startGameBtn.style.display = "none";
  });

  createBtn?.addEventListener('click', async () => {
    if (!nationName.value.trim()) return showTempError('Inserisci un nome prima di unirti o creare una partita');
    joinForm.style.display = "none";
    startGameBtn.style.display = "none";

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    currentGameCode = code;

    try {
      await db.collection("partite").doc(code).set({
        codice: code,
        creatoIl: firebase.firestore.FieldValue.serverTimestamp(),
        nazione: nationName.value,
        governo: "demo",
        giocatori: [nationName.value]
      });

      gameCodeLabel.textContent = "Codice partita:";
      gameCodeValue.textContent = code;
      gameCodePanel.style.display = "block";
      output.textContent = "";

      if (unsubscribeLobby) unsubscribeLobby();
      unsubscribeLobby = db.collection("partite").doc(code).onSnapshot(doc => {
        showLobby(doc, nationName.value);
      });

    } catch {
      showTempError("Errore salvataggio partita su Firebase!");
    }
  });

  joinSubmitBtn?.addEventListener('click', async () => {
    if (!nationName.value.trim()) return showTempError('Inserisci un nome prima di unirti o creare una partita');
    const code = gameCodeInput.value.trim().toUpperCase();
    if (code.length < 4) return showTempError("Codice non valido!");
    currentGameCode = code;

    try {
      const partitaRef = db.collection("partite").doc(code);
      const doc = await partitaRef.get();

      if (!doc.exists) return showTempError("Codice partita non trovato!");

      const data = doc.data();
      const giocatori = Array.isArray(data.giocatori) ? [...data.giocatori] : [];
      if (!giocatori.includes(nationName.value)) {
        giocatori.push(nationName.value);
        await partitaRef.update({ giocatori });
      }

      output.textContent = "";
      joinForm.style.display = "none";
      gameCodeLabel.textContent = "Codice partita:";
      gameCodeValue.textContent = code;
      gameCodePanel.style.display = "block";

      if (unsubscribeLobby) unsubscribeLobby();
      unsubscribeLobby = partitaRef.onSnapshot(doc => {
        showLobby(doc, nationName.value);
      });

    } catch {
      showTempError("Errore di connessione a Firebase!");
    }
  });

  startGameBtn?.addEventListener('click', () => {
    // Nascondi completamente UI
    document.querySelector('.main-ui')?.classList.add('hidden');
    output.innerHTML = "";
    joinForm.style.display = "none";
    gameCodePanel.style.display = "none";
    startGameBtn.style.display = "none";

    generateAndShowMapOnStart();
  });
});
