// Firebase Config
const firebaseConfig = {
  apiKey: "TUO_API_KEY",
  authDomain: "TUO_PROJECT.firebaseapp.com",
  projectId: "TUO_PROJECT",
  storageBucket: "TUO_PROJECT.appspot.com",
  messagingSenderId: "XXX",
  appId: "XXX"
};

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Autenticazione anonima
firebase.auth().signInAnonymously().catch((error) => {
  console.error("Auth error:", error);
});

// Utility
function generateGameCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

// Elementi DOM
const createGameBtn = document.getElementById("create-game-btn");
const joinGameBtn = document.getElementById("join-game-btn");
const joinForm = document.getElementById("join-form");
const joinSubmitBtn = document.getElementById("join-submit-btn");
const gameCodeInput = document.getElementById("game-code-input");
const gameCodePanel = document.getElementById("game-code-panel");
const gameCodeLabel = document.getElementById("game-code-label");
const gameCodeValue = document.getElementById("game-code-value");
const startGameBtn = document.getElementById("start-game-btn");
const output = document.getElementById("output");
const uiContainer = document.getElementById("ui-container");
const mapCanvas = document.getElementById("game-map");

let currentGameCode = null;

createGameBtn.onclick = async () => {
  const nationName = document.getElementById("nation-name").value.trim();
  if (!nationName) {
    alert("Please enter your nation's name.");
    return;
  }

  const gameCode = generateGameCode();
  await db.collection("games").doc(gameCode).set({
    host: nationName,
    players: [nationName],
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    started: false
  });

  currentGameCode = gameCode;
  gameCodeLabel.textContent = "Game Code:";
  gameCodeValue.textContent = gameCode;
  gameCodePanel.style.display = "block";
  startGameBtn.style.display = "inline-block";
  output.textContent = "Game created. Share the code with others to join.";
};

joinGameBtn.onclick = () => {
  joinForm.style.display = "block";
};

joinSubmitBtn.onclick = async () => {
  const gameCode = gameCodeInput.value.trim().toUpperCase();
  const nationName = document.getElementById("nation-name").value.trim();
  if (!gameCode || !nationName) {
    alert("Enter both game code and nation name.");
    return;
  }

  const gameRef = db.collection("games").doc(gameCode);
  const gameDoc = await gameRef.get();

  if (!gameDoc.exists) {
    alert("Game not found.");
    return;
  }

  const gameData = gameDoc.data();
  if (gameData.started) {
    alert("Game already started.");
    return;
  }

  await gameRef.update({
    players: firebase.firestore.FieldValue.arrayUnion(nationName)
  });

  currentGameCode = gameCode;
  gameCodeLabel.textContent = "Joined Game:";
  gameCodeValue.textContent = gameCode;
  gameCodePanel.style.display = "block";
  startGameBtn.style.display = "none";
  output.textContent = "Joined the game.";
};

startGameBtn.onclick = async () => {
  if (!currentGameCode) return;
  await db.collection("games").doc(currentGameCode).update({ started: true });

  // Nasconde la UI e mostra la mappa
  uiContainer.style.display = "none";
  mapCanvas.style.display = "block";

  if (typeof window.generateAndShowMapOnStart === "function") {
    window.generateAndShowMapOnStart();
  } else {
    console.error("Map generator function not found.");
  }
};
