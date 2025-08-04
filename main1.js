// Non usiamo import, ci affidiamo alle funzioni globali di map-generator.js

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
  const joinBtn       = document.getElementById('join-game-btn');
  const createBtn     = document.getElementById('create-game-btn');
  const joinForm      = document.getElementById('join-form');
  const gameCodePanel = document.getElementById('game-code-panel');
  const output        = document.getElementById('output');
  const gameCodeLabel = document.getElementById('game-code-label');
  const gameCodeValue = document.getElementById('game-code-value');
  const joinSubmitBtn = document.getElementById('join-submit-btn');
  const gameCodeInput = document.getElementById('game-code-input');
  const nationName    = document.getElementById('nation-name');
  const startGameBtn  = document.getElementById('start-game-btn');
  const uiContainer   = document.getElementById('ui-container');

  let unsubscribeLobby = null, currentGameCode = null;

  function showTempError(msg) {
    output.innerHTML = `<div id="temp-error-msg" style="
      color:#fff;background:#c00;margin:10px 0;font-weight:bold;
      text-align:center;padding:14px 18px;border-radius:9px;
      z-index:1000;font-size:1.14em;box-shadow:0 2px 16px #000a;">
      ${msg}</div>`;
    setTimeout(() => output.innerHTML = "", 4000);
  }

  function showLobby(doc, myNation) {
    if (!doc.exists) return showTempError("Partita non trovata!");
    const data = doc.data();
    gameCodeLabel.textContent = "Codice partita:";
    gameCodeValue.textContent = data.codice || currentGameCode;
    gameCodePanel.style.display = "block";

    let html = `Creatore: <b>${data.nazione}</b><br>Giocatori:<ul>`;
    data.giocatori.forEach(n => {
      html += `<li>${n}${n===data.nazione?" (creatore)":""}${n===myNation&&n!==data.nazione?" (tu)":""}</li>`;
    });
    html += "</ul>";
    output.innerHTML = html;
    startGameBtn.style.display = "inline-block";
  }

  joinForm.style.display = "none";
  gameCodePanel.style.display = "none";
  startGameBtn.style.display = "none";

  joinBtn.onclick = () => {
    if (!nationName.value.trim()) return showTempError("Inserisci un nome");
    joinForm.style.display = "flex";
    gameCodePanel.style.display = "none";
    output.textContent = ""; gameCodeInput.value = "";
    startGameBtn.style.display = "none";
  };

  createBtn.onclick = async () => {
    if (!nationName.value.trim()) return showTempError("Inserisci un nome");
    joinForm.style.display = "none"; startGameBtn.style.display = "none";
    const code = Math.random().toString(36).substring(2,8).toUpperCase();
    currentGameCode = code;
    try {
      await db.collection("partite").doc(code).set({
        codice: code,
        creatoIl: firebase.firestore.FieldValue.serverTimestamp(),
        nazione: nationName.value,
        governo: "demo",
        giocatori: [nationName.value]
      });
      unsubscribeLobby = db.collection("partite").doc(code)
        .onSnapshot(doc => showLobby(doc, nationName.value));
    } catch {
      showTempError("Errore Firebase!");
    }
  };

  joinSubmitBtn.onclick = async () => {
    if (!nationName.value.trim()) return showTempError("Inserisci un nome");
    const code = gameCodeInput.value.trim().toUpperCase();
    if (code.length < 4) return showTempError("Codice non valido");
    currentGameCode = code;
    try {
      const ref = db.collection("partite").doc(code);
      const doc = await ref.get();
      if (!doc.exists) return showTempError("Partita non trovata");
      const data = doc.data();
      const p = Array.isArray(data.giocatori)?data.giocatori.slice():[];
      if (!p.includes(nationName.value)) {
        p.push(nationName.value);
        await ref.update({ giocatori: p });
      }
      joinForm.style.display = "none";
      unsubscribeLobby = ref.onSnapshot(doc => showLobby(doc, nationName.value));
    } catch {
      showTempError("Errore Firebase!");
    }
  };

  startGameBtn.onclick = () => {
    uiContainer.remove();
    window.generateAndShowMapOnStart();
  };
});
