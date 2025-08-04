// Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Sign in anonymously
firebase.auth().signInAnonymously().catch((error) => {
  console.error("Auth Error:", error);
});

const createGameBtn = document.getElementById("create-game-btn");
const joinGameBtn = document.getElementById("join-game-btn");
const joinSubmitBtn = document.getElementById("join-submit-btn");
const startGameBtn = document.getElementById("start-game-btn");

const joinForm = document.getElementById("join-form");
const gameCodePanel = document.getElementById("game-code-panel");
const gameCodeValue = document.getElementById("game-code-value");
const output = document.getElementById("output");
const nationNameInput = document.getElementById("nation-name");

let currentGameCode = null;

function generateGameCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

createGameBtn.onclick = async () => {
  const nationName = nationNameInput.value.trim();
  if (!nationName) return alert("Please enter a nation name.");

  const code = generateGameCode();
  currentGameCode = code;

  await db.collection("games").doc(code).set({
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    nations: [{ name: nationName }]
  });

  gameCodeValue.textContent = code;
  gameCodePanel.style.display = "block";
  startGameBtn.style.display = "inline-block";

  output.textContent = "Game created successfully.";
};

joinGameBtn.onclick = () => {
  joinForm.style.display = "block";
};

joinSubmitBtn.onclick = async () => {
  const code = document.getElementById("game-code-input").value.trim();
  const nationName = nationNameInput.value.trim();
  if (!code || !nationName) return alert("Enter both code and nation name.");

  const doc = await db.collection("games").doc(code).get();
  if (!doc.exists) return alert("Game not found.");

  await db.collection("games").doc(code).update({
    nations: firebase.firestore.FieldValue.arrayUnion({ name: nationName })
  });

  output.textContent = "Joined game successfully.";
  currentGameCode = code;
  startGameBtn.style.display = "inline-block";
};

startGameBtn.onclick = () => {
  document.getElementById("ui-container").style.display = "none";
  const canvas = document.getElementById("game-map");
  canvas.style.display = "block";
  if (window.generateAndShowMapOnStart) {
    window.generateAndShowMapOnStart(canvas);
  } else {
    console.error("Map generator function not found.");
  }
};
