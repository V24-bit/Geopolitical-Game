// === BANDIERE DI TUTTO IL MONDO ===
const countryCodes = [
  "ad","ae","af","ag","ai","al","am","ao","aq","ar","as","at","au","aw","ax",
  "az","ba","bb","bd","be","bf","bg","bh","bi","bj","bl","bm","bn","bo","bq",
  "br","bs","bt","bv","bw","by","bz","ca","cc","cd","cf","cg","ch","ci","ck",
  "cl","cm","cn","co","cr","cu","cv","cw","cx","cy","cz","de","dj","dk","dm",
  "do","dz","ec","ee","eg","eh","er","es","et","fi","fj","fk","fm","fo","fr",
  "ga","gb","gd","ge","gf","gg","gh","gi","gl","gm","gn","gp","gq","gr","gs",
  "gt","gu","gw","gy","hk","hm","hn","hr","ht","hu","id","ie","il","im","in",
  "io","iq","ir","is","it","je","jm","jo","jp","ke","kg","kh","ki","km","kn",
  "kp","kr","kw","ky","kz","la","lb","lc","li","lk","lr","ls","lt","lu","lv",
  "ly","ma","mc","md","me","mf","mg","mh","mk","ml","mm","mn","mo","mp","mq",
  "mr","ms","mt","mu","mv","mw","mx","my","mz","na","nc","ne","nf","ng","ni",
  "nl","no","np","nr","nu","nz","om","pa","pe","pf","pg","ph","pk","pl","pm",
  "pn","pr","ps","pt","pw","py","qa","re","ro","rs","ru","rw","sa","sb","sc",
  "sd","se","sg","sh","si","sj","sk","sl","sm","sn","so","sr","ss","st","sv",
  "sx","sy","sz","tc","td","tf","tg","th","tj","tk","tl","tm","tn","to","tr",
  "tt","tv","tw","tz","ua","ug","um","us","uy","uz","va","vc","ve","vg","vi",
  "vn","vu","wf","ws","ye","yt","za","zm","zw"
];
const flags = countryCodes.map(code => `https://flagcdn.com/w320/${code}.png`);
let flagIndex = 0;
function changeFlagBackground() {
  document.body.style.backgroundImage = `url('${flags[flagIndex]}')`;
  flagIndex = (flagIndex + 1) % flags.length;
}
changeFlagBackground();
setInterval(changeFlagBackground, 3000);

// === MULTILINGUA ===
const translations = {
  en: {
    title: "Geopolitical Game",
    labelNation: "Nation name:",
    labelGovernment: "Form of Government:",
    optionSelect: "Select...",
    optionDictatorship: "Dictatorship",
    optionRepublic: "Republic",
    optionMonarchy: "Monarchy",
    optionTheocracy: "Theocracy",
    optionAnarchy: "Anarchy",
    confirm: "Confirm",
    createdNation: "Nation created:",
    name: "Name:",
    government: "Form of Government:",
    createGame: "Create Game",
    joinGame: "Join Game",
    serverCreated: "Game created!",
    yourServerCode: "Your game code:",
    waitingPlayer: "Waiting for a player to join...",
    insertCode: "Insert game code:",
    join: "Join",
    back: "Back",
    invalidCode: "Invalid code. Please try again.",
    gameTitle: "Game Room",
    di: "of",
    forms: {
      dictatorship: "The dictatorship of",
      republic: "The republic of",
      monarchy: "The kingdom of",
      theocracy: "The theocracy of",
      anarchy: "The anarchy of"
    }
  },
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
    confirm: "Conferma",
    createdNation: "Nazione creata:",
    name: "Nome:",
    government: "Forma di governo:",
    createGame: "Crea partita",
    joinGame: "Unisciti a partita",
    serverCreated: "Partita creata!",
    yourServerCode: "Codice partita:",
    waitingPlayer: "In attesa che un giocatore si unisca...",
    insertCode: "Inserisci codice partita:",
    join: "Entra",
    back: "Indietro",
    invalidCode: "Codice non valido. Riprova.",
    gameTitle: "Stanza di gioco",
    di: "di",
    forms: {
      dictatorship: "La dittatura di",
      republic: "La repubblica di",
      monarchy: "Il regno di",
      theocracy: "La teocrazia di",
      anarchy: "L'anarchia di"
    }
  },
  es: {
    title: "Geopolitical Game",
    labelNation: "Nombre de la Nación:",
    labelGovernment: "Forma de Gobierno:",
    optionSelect: "Selecciona...",
    optionDictatorship: "Dictadura",
    optionRepublic: "República",
    optionMonarchy: "Monarquía",
    optionTheocracy: "Teocracia",
    optionAnarchy: "Anarquía",
    confirm: "Confirmar",
    createdNation: "Nación creada:",
    name: "Nombre:",
    government: "Forma de Gobierno:",
    createGame: "Crear partida",
    joinGame: "Unirse a partida",
    serverCreated: "¡Partida creada!",
    yourServerCode: "Código de la partida:",
    waitingPlayer: "Esperando a que un jugador se una...",
    insertCode: "Introduce el código de la partida:",
    join: "Unirse",
    back: "Atrás",
    invalidCode: "Código no válido. Inténtalo de nuevo.",
    gameTitle: "Sala de juego",
    di: "de",
    forms: {
      dictatorship: "La dictadura de",
      republic: "La república de",
      monarchy: "El reino de",
      theocracy: "La teocracia de",
      anarchy: "La anarquía de"
    }
  },
  fr: {
    title: "Geopolitical Game",
    labelNation: "Nom de la Nation:",
    labelGovernment: "Forme de gouvernement:",
    optionSelect: "Sélectionner...",
    optionDictatorship: "Dictature",
    optionRepublic: "République",
    optionMonarchy: "Monarchie",
    optionTheocracy: "Théocratie",
    optionAnarchy: "Anarchie",
    confirm: "Confirmer",
    createdNation: "Nation créée:",
    name: "Nom:",
    government: "Forme de gouvernement:",
    createGame: "Créer une partie",
    joinGame: "Rejoindre une partie",
    serverCreated: "Partie créée !",
    yourServerCode: "Code de la partie :",
    waitingPlayer: "En attente qu'un joueur rejoigne...",
    insertCode: "Insérez le code de la partie :",
    join: "Rejoindre",
    back: "Retour",
    invalidCode: "Code invalide. Veuillez réessayer.",
    gameTitle: "Salle de jeu",
    di: "de",
    forms: {
      dictatorship: "La dictature de",
      republic: "La république de",
      monarchy: "Le royaume de",
      theocracy: "La théocratie de",
      anarchy: "L'anarchie de"
    }
  },
  de: {
    title: "Geopolitical Game",
    labelNation: "Name der Nation:",
    labelGovernment: "Regierungsform:",
    optionSelect: "Auswählen...",
    optionDictatorship: "Diktatur",
    optionRepublic: "Republik",
    optionMonarchy: "Monarchie",
    optionTheocracy: "Theokratie",
    optionAnarchy: "Anarchie",
    confirm: "Bestätigen",
    createdNation: "Nation erstellt:",
    name: "Name:",
    government: "Regierungsform:",
    createGame: "Spiel erstellen",
    joinGame: "Spiel beitreten",
    serverCreated: "Spiel erstellt!",
    yourServerCode: "Dein Spielcode:",
    waitingPlayer: "Warten auf einen Mitspieler...",
    insertCode: "Spielcode eingeben:",
    join: "Beitreten",
    back: "Zurück",
    invalidCode: "Ungültiger Code. Bitte versuche es erneut.",
    gameTitle: "Spielraum",
    di: "von",
    forms: {
      dictatorship: "Die Diktatur von",
      republic: "Die Republik von",
      monarchy: "Das Königreich von",
      theocracy: "Die Theokratie von",
      anarchy: "Die Anarchie von"
    }
  }
};

const flagMap = {
  en: "gb",
  it: "it",
  es: "es",
  fr: "fr",
  de: "de"
};

function setLanguage(lang) {
  const t = translations[lang];
  document.getElementById('title').innerText = t.title;
  document.getElementById('label-nation-name').innerText = t.labelNation;
  document.getElementById('label-government-type').innerText = t.labelGovernment;
  document.getElementById('option-select').innerText = t.optionSelect;
  document.getElementById('option-dictatorship').innerText = t.optionDictatorship;
  document.getElementById('option-republic').innerText = t.optionRepublic;
  document.getElementById('option-monarchy').innerText = t.optionMonarchy;
  document.getElementById('option-theocracy').innerText = t.optionTheocracy;
  document.getElementById('option-anarchy').innerText = t.optionAnarchy;
  document.getElementById('confirm-btn').innerText = t.confirm;
  document.getElementById('create-game-btn').innerText = t.createGame;
  document.getElementById('join-game-btn').innerText = t.joinGame;
  document.getElementById('game-title') && (document.getElementById('game-title').innerText = t.gameTitle);
  document.getElementById('flag-current').src = `https://flagcdn.com/${flagMap[lang]}.svg`;
  document.getElementById('flag-current').alt = lang;
}

let currentLang = "it";
if (localStorage.getItem('lang')) currentLang = localStorage.getItem('lang');
setLanguage(currentLang);

document.getElementById("language-menu").addEventListener('change', function() {
  const lang = this.value;
  setLanguage(lang);
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.getElementById("output").innerHTML = "";
});

// === LOBBY CON FIREBASE ===
function generateGameCode(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

const createBtn = document.getElementById('create-game-btn');
const joinBtn = document.getElementById('join-game-btn');
const joinForm = document.getElementById('join-form');
const codeDisplay = document.getElementById('game-code-display');
const outputDiv = document.getElementById('output');
const playerNameInput = document.getElementById('player-name-input');
const playersListDiv = document.getElementById('players-list');
const playersUl = document.getElementById('players-ul');
let myGameCode = null;
let myPlayerId = null;
let isHost = false;

function updatePlayersList(playersObj) {
    playersUl.innerHTML = '';
    Object.values(playersObj).forEach(p => {
        const li = document.createElement('li');
        li.textContent = p.name || '(senza nome)';
        if (p.isHost) li.textContent += ' (Host)';
        playersUl.appendChild(li);
    });
    playersListDiv.style.display = 'block';
}

createBtn.addEventListener('click', function() {
    const playerName = playerNameInput.value.trim() || 'Host';
    const code = generateGameCode();
    myGameCode = code;
    myPlayerId = "host-" + Math.random().toString(36).substr(2, 9);
    isHost = true;

    firebase.database().ref('games/' + code).set({
        createdAt: Date.now(),
        players: {
            [myPlayerId]: {
                name: playerName,
                joinedAt: Date.now(),
                isHost: true
            }
        }
    }).then(() => {
        codeDisplay.textContent = translations[currentLang].yourServerCode + " " + code;
        codeDisplay.style.display = "block";
        joinForm.style.display = "none";
        outputDiv.textContent = translations[currentLang].serverCreated + " " + translations[currentLang].waitingPlayer;
        localStorage.setItem('gameCode', code);
        localStorage.setItem('playerId', myPlayerId);
        // Ascolta aggiornamenti giocatori
        firebase.database().ref('games/' + code + '/players').on('value', snap => {
            if (snap.exists()) updatePlayersList(snap.val());
        });
    }).catch(err => {
        outputDiv.textContent = "Errore nella creazione della partita: " + err.message;
    });
});

joinBtn.addEventListener('click', function() {
    joinForm.style.display = "flex";
    codeDisplay.style.display = "none";
});

joinForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const code = document.getElementById('game-code-input').value.trim().toUpperCase();
    const playerName = playerNameInput.value.trim() || 'Guest';
    if (!code) {
        outputDiv.textContent = translations[currentLang].invalidCode;
        return;
    }
    firebase.database().ref('games/' + code).once('value').then(snapshot => {
        if (snapshot.exists()) {
            myGameCode = code;
            myPlayerId = "user-" + Math.random().toString(36).substr(2, 9);
            isHost = false;
            // Aggiungi il giocatore con il nome
            firebase.database().ref('games/' + code + '/players/' + myPlayerId).set({
                name: playerName,
                joinedAt: Date.now(),
                isHost: false
            });
            outputDiv.textContent = translations[currentLang].waitingPlayer;
            codeDisplay.style.display = "none";
            joinForm.style.display = "none";
            localStorage.setItem('gameCode', code);
            localStorage.setItem('playerId', myPlayerId);
            // Ascolta aggiornamenti giocatori
            firebase.database().ref('games/' + code + '/players').on('value', snap => {
                if (snap.exists()) updatePlayersList(snap.val());
            });
        } else {
            outputDiv.textContent = translations[currentLang].invalidCode;
        }
    }).catch(err => {
        outputDiv.textContent = "Errore durante la verifica: " + err.message;
    });
});

// NAZIONE
document.getElementById('nation-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const nationName = document.getElementById('nation-name').value.trim();
    const government = document.getElementById('government-type').value;
    const t = translations[currentLang];
    if (nationName && government) {
        outputDiv.innerHTML =
            `<h2>${t.createdNation}</h2>
             <p><strong>${t.name}</strong> ${nationName}</p>
             <p><strong>${t.government}</strong> ${document.getElementById('government-type').options[document.getElementById('government-type').selectedIndex].text}</p>`;
    }
});
