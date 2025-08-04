// main1.js

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

document.addEventListener('DOMContentLoaded', () => {
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
      box-shadow:0 2px 16px #000a;">${msg}</div>`;
    setTimeout(() => { if (document.getElementById('temp-error-msg')) output.innerHTML = ""; }, 4000);
  }

  function showLobby(doc, myNation) {
    if (!doc.exists) {
      showTempError("Game not found!");
      gameCodePanel.style.display = "none";
      startGameBtn.style.display = "none";
      return;
    }
    const data = doc.data();
    gameCodeLabel.textContent = "Game Code:";
    gameCodeValue.textContent = data.code || currentGameCode;
    gameCodePanel.style.display = "block";

    let html = `Host: <b>${data.nation}</b><br>Players:<ul>`;
    data.players.forEach(p => {
      html += `<li>${p}${p === data.nation ? " (host)" : ""}${p === myNation && p !== data.nation ? " (you)" : ""}</li>`;
    });
    html += "</ul>";
    output.innerHTML = html;
    startGameBtn.style.display = "inline-block";
  }

  // initial state
  joinForm.style.display = "none";
  gameCodePanel.style.display = "none";
  startGameBtn.style.display = "none";

  // Join button
  joinBtn.onclick = () => {
    if (!nationName.value.trim()) return showTempError("Enter your nation’s name first");
    joinForm.style.display = "flex";
    gameCodePanel.style.display = "none";
    output.textContent = "";
    gameCodeInput.value = "";
    startGameBtn.style.display = "none";
  };

  // Create button
  createBtn.onclick = async () => {
    if (!nationName.value.trim()) return showTempError("Enter your nation’s name first");
    joinForm.style.display = "none";
    startGameBtn.style.display = "none";
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    currentGameCode = code;
    try {
      await db.collection("games").doc(code).set({
        code: code,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        nation: nationName.value,
        players: [nationName.value]
      });
      unsubscribeLobby = db.collection("games").doc(code)
        .onSnapshot(doc => showLobby(doc, nationName.value));
    } catch {
      showTempError("Failed to create game. Try again.");
    }
  };

  // Join submit
  joinSubmitBtn.onclick = async () => {
    if (!nationName.value.trim()) return showTempError("Enter your nation’s name first");
    const code = gameCodeInput.value.trim().toUpperCase();
    if (code.length < 4) return showTempError("Invalid code!");
    currentGameCode = code;
    try {
      const ref = db.collection("games").doc(code);
      const doc = await ref.get();
      if (!doc.exists) return showTempError("Game not found!");
      const data = doc.data();
      const players = Array.isArray(data.players) ? [...data.players] : [];
      if (!players.includes(nationName.value)) {
        players.push(nationName.value);
        await ref.update({ players });
      }
      joinForm.style.display = "none";
      unsubscribeLobby = ref.onSnapshot(doc => showLobby(doc, nationName.value));
    } catch {
      showTempError("Connection error. Try again.");
    }
  };

  // Start game
  startGameBtn.onclick = () => {
    uiContainer.remove();
    window.generateAndShowMapOnStart();
  };
});
