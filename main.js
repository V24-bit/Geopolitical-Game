// Multilingua (puoi aggiungere altre lingue se vuoi)
const translations = {
  it: {
    title: "Geopolitical Game",
    labelNation: "Nome della Nazione:",
    labelGovernment: "Forma di Governo:",
    optionSelect: "Seleziona...",
    optionDictatorship: "Dittatura",
    optionRepublic: "Repubblica",
    optionMonarchy: "Monarchia",
    optionTheocracy: "Teocrazia",
    optionAnarchy: "Anarchia",
    createGame: "Crea partita",
    joinGame: "Unisciti a partita",
    yourServerCode: "Codice partita:",
    waitingPlayer: "In attesa che un giocatore si unisca...",
    invalidCode: "Codice non valido. Riprova.",
    serverCreated: "Partita creata!",
    insertNation: "Inserisci il nome della nazione.",
    insertGov: "Scegli una forma di governo."
  }
};

// --- UI ELEMENTS ---
const nationForm = document.getElementById('nation-form');
const nationNameInput = document.getElementById('nation-name');
const governmentTypeInput = document.getElementById('government-type');
const createBtn = document.getElementById('create-game-btn');
const joinBtn = document.getElementById('join-game-btn');
const joinForm = document.getElementById('join-form');
const joinSubmitBtn = document.getElementById('join-submit-btn');
const codeDisplay = document.getElementById('game-code-display');
const outputDiv = document.getElementById('output');
const gameCodeInput = document.getElementById('game-code-input');

let myGameCode = null;
let myPlayerId = null;
let isHost = false;
let currentLang = "it";
const t = translations[currentLang];

// --- GRADIENT BACKGROUND LOOP SU TUTTO IL BODY (opzionale) ---
// Se vuoi animare anche lo sfondo, puoi attivare questo codice:
/*
let gradPos = 0;
setInterval(() => {
    gradPos = (gradPos + 1) % 360;
    document.body.style.background = `linear-gradient(${gradPos}deg, #141e30 0%, #243b55 100%)`;
}, 50);
*/

// --- CREA PARTITA ---
createBtn.addEventListener('click', function() {
    const nationName = nationNameInput.value.trim();
    const government = governmentTypeInput.value;

    if (!nationName) {
        outputDiv.textContent = t.insertNation;
        return;
    }
    if (!government) {
        outputDiv.textContent = t.insertGov;
        return;
    }
    const code = generateGameCode();
    myGameCode = code;
    myPlayerId = "host-" + Math.random().toString(36).substr(2, 9);
    isHost = true;
    firebase.database().ref('games/' + code).set({
        createdAt: Date.now(),
        players: {
            [myPlayerId]: {
                nationName,
                government,
                joinedAt: Date.now(),
                isHost: true
            }
        }
    }).then(() => {
        codeDisplay.textContent = `${t.yourServerCode} ${code}`;
        codeDisplay.style.display = "block";
        joinForm.style.display = "none";
        outputDiv.textContent = t.serverCreated + " " + t.waitingPlayer;
        localStorage.setItem('gameCode', code);
        localStorage.setItem('playerId', myPlayerId);
    }).catch(err => {
        outputDiv.textContent = "Errore nella creazione della partita: " + err.message;
    });
});

// --- MOSTRA FORM JOIN ---
joinBtn.addEventListener('click', function() {
    joinForm.style.display = "flex";
    codeDisplay.style.display = "none";
    outputDiv.textContent = "";
});

// --- SUBMIT JOIN ---
joinSubmitBtn.addEventListener('click', function() {
    const code = gameCodeInput.value.trim().toUpperCase();
    const nationName = nationNameInput.value.trim();
    const government = governmentTypeInput.value;
    if (!code) {
        outputDiv.textContent = t.invalidCode;
        return;
    }
    if (!nationName) {
        outputDiv.textContent = t.insertNation;
        return;
    }
    if (!government) {
        outputDiv.textContent = t.insertGov;
        return;
    }
    firebase.database().ref('games/' + code).once('value').then(snapshot => {
        if (snapshot.exists()) {
            myGameCode = code;
            myPlayerId = "user-" + Math.random().toString(36).substr(2, 9);
            isHost = false;
            firebase.database().ref('games/' + code + '/players/' + myPlayerId).set({
                nationName,
                government,
                joinedAt: Date.now(),
                isHost: false
            });
            outputDiv.textContent = t.waitingPlayer;
            codeDisplay.style.display = "none";
            joinForm.style.display = "none";
            localStorage.setItem('gameCode', code);
            localStorage.setItem('playerId', myPlayerId);
        } else {
            outputDiv.textContent = t.invalidCode;
        }
    }).catch(err => {
        outputDiv.textContent = "Errore durante la verifica: " + err.message;
    });
});

// --- GENERA CODICE PARTITA ---
function generateGameCode(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// --- MULTILINGUA (solo ITA per ora, puoi aggiungere altre lingue come sopra) ---
document.getElementById('title').innerText = t.title;
document.getElementById('label-nation-name').innerText = t.labelNation;
document.getElementById('label-government-type').innerText = t.labelGovernment;
document.getElementById('option-select').innerText = t.optionSelect;
document.getElementById('option-dictatorship').innerText = t.optionDictatorship;
document.getElementById('option-republic').innerText = t.optionRepublic;
document.getElementById('option-monarchy').innerText = t.optionMonarchy;
document.getElementById('option-theocracy').innerText = t.optionTheocracy;
document.getElementById('option-anarchy').innerText = t.optionAnarchy;
createBtn.innerText = t.createGame;
joinBtn.innerText = t.joinGame;
joinSubmitBtn.innerText = "Entra";
