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

// Missing function declaration and opening brace
function someFunction() {
  if (true) {
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