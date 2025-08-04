const firebaseConfig = {
  apiKey: "TUO_API_KEY",
  authDomain: "geopolitical-game-5f135.firebaseapp.com",
  projectId: "geopolitical-game-5f135",
  storageBucket: "geopolitical-game-5f135.appspot.com",
  messagingSenderId: "ID_MESSAGGISTICA",
  appId: "ID_APP"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const createGameBtn = document.getElementById("create-game-btn");
const joinGameBtn = document.getElementById("join-game-btn");
const joinSubmitBtn = document.getElementById("join-submit-btn");
const startGameBtn = document.getElementById("start-game-btn");

const gameCodePanel = document.getElementById("game-code-panel");
const gameCodeValue = document.getElementById("game-code-value");

function generaCodicePartita() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codice = "";
  for (let i = 0; i < 6; i++) {
    codice += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codice;
}

createGameBtn.onclick = async () => {
  const nomeNazione = document.getElementById("nation-name").value.trim();
  if (!nomeNazione) return alert("Inserisci un nome per la tua nazione.");

  const codice = generaCodicePartita();
  const partitaRef = db.collection("partite").doc(codice);

  await partitaRef.set({
    codice,
    nazione: nomeNazione,
    giocatori: [nomeNazione]
  });

  gameCodePanel.style.display = "block";
  gameCodeValue.textContent = codice;
  startGameBtn.style.display = "inline-block";
};

joinGameBtn.onclick = () => {
  document.getElementById("join-form").style.display = "block";
};

joinSubmitBtn.onclick = async () => {
  const codice = document.getElementById("game-code-input").value.trim().toUpperCase();
  const nomeNazione = document.getElementById("nation-name").value.trim();
  if (!codice || !nomeNazione) return alert("Inserisci codice e nome nazione.");

  const partitaRef = db.collection("partite").doc(codice);
  const doc = await partitaRef.get();

  if (!doc.exists) return alert("Partita non trovata.");
  const data = doc.data();
  if (data.giocatori.includes(nomeNazione)) return alert("Nome già usato.");

  await partitaRef.update({
    giocatori: [...data.giocatori, nomeNazione]
  });

  alert("Sei entrato nella partita!");
};

startGameBtn.onclick = () => {
  document.getElementById("ui-container").style.display = "none";

  const canvas = document.getElementById("game-map");
  canvas.style.display = "block";

  window.generateAndShowMapOnStart(canvas);
};
