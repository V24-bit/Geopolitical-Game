// === SFONDO MOSAICO DI BANDIERE ANIMATE ===
const countryCodes = [ "ad","ae","af","ag","ai","al","am","ao","aq","ar","as","at","au","aw","ax",
"az","ba","bb","bd","be","bf","bg","bh","bi","bj","bl","bm","bn","bo","bq","br","bs","bt","bv","bw",
"by","bz","ca","cc","cd","cf","cg","ch","ci","ck","cl","cm","cn","co","cr","cu","cv","cw","cx","cy",
"cz","de","dj","dk","dm","do","dz","ec","ee","eg","eh","er","es","et","fi","fj","fk","fm","fo","fr",
"ga","gb","gd","ge","gf","gg","gh","gi","gl","gm","gn","gp","gq","gr","gs","gt","gu","gw","gy","hk",
"hm","hn","hr","ht","hu","id","ie","il","im","in","io","iq","ir","is","it","je","jm","jo","jp","ke",
"kg","kh","ki","km","kn","kp","kr","kw","ky","kz","la","lb","lc","li","lk","lr","ls","lt","lu","lv",
"ly","ma","mc","md","me","mf","mg","mh","mk","ml","mm","mn","mo","mp","mq","mr","ms","mt","mu","mv",
"mw","mx","my","mz","na","nc","ne","nf","ng","ni","nl","no","np","nr","nu","nz","om","pa","pe","pf",
"pg","ph","pk","pl","pm","pn","pr","ps","pt","pw","py","qa","re","ro","rs","ru","rw","sa","sb","sc",
"sd","se","sg","sh","si","sj","sk","sl","sm","sn","so","sr","ss","st","sv","sx","sy","sz","tc","td",
"tf","tg","th","tj","tk","tl","tm","tn","to","tr","tt","tv","tw","tz","ua","ug","um","us","uy","uz",
"va","vc","ve","vg","vi","vn","vu","wf","ws","ye","yt","za","zm","zw"];
const flags = countryCodes.map(code => `https://flagcdn.com/w320/${code}.png`);

const flagsBg = document.getElementById('animated-flags-bg');

function createFlagGrid() {
    const tileW = 110; // px
    const tileH = 70;  // px
    const cols = Math.ceil(window.innerWidth / tileW);
    const rows = Math.ceil(window.innerHeight / tileH);
    const tileCount = cols * rows;

    flagsBg.innerHTML = '';
    for (let i = 0; i < tileCount; i++) {
        const img = document.createElement('img');
        img.className = 'flag-tile';
        img.src = flags[0];
        flagsBg.appendChild(img);
    }
}

window.addEventListener('resize', createFlagGrid);
createFlagGrid();

let flagIndex = 0;
function updateFlagGrid() {
    const tiles = document.querySelectorAll('.flag-tile');
    for (const img of tiles) {
        img.src = flags[flagIndex];
    }
    flagIndex = (flagIndex + 1) % flags.length;
}
updateFlagGrid();
setInterval(updateFlagGrid, 3400);

// === TRADUZIONI MULTILINGUA ===
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
    createGame: "Create Game",
    joinGame: "Join Game",
    yourServerCode: "Game code:",
    waitingPlayer: "Waiting for another player to join...",
    invalidCode: "Invalid code. Please try again.",
    serverCreated: "Game created!",
    insertNation: "Enter the nation name.",
    insertGov: "Choose a form of government.",
    placeholderNation: "Enter the nation name"
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
    createGame: "Crea partita",
    joinGame: "Unisciti a partita",
    yourServerCode: "Codice partita:",
    waitingPlayer: "In attesa che un giocatore si unisca...",
    invalidCode: "Codice non valido. Riprova.",
    serverCreated: "Partita creata!",
    insertNation: "Inserisci il nome della nazione.",
    insertGov: "Scegli una forma di governo.",
    placeholderNation: "Inserisci il nome della nazione"
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
    createGame: "Crear partida",
    joinGame: "Unirse a partida",
    yourServerCode: "Código de la partida:",
    waitingPlayer: "Esperando a que otro jugador se una...",
    invalidCode: "Código no válido. Inténtalo de nuevo.",
    serverCreated: "¡Partida creada!",
    insertNation: "Introduce el nombre de la nación.",
    insertGov: "Elige una forma de gobierno.",
    placeholderNation: "Introduce el nombre de la nación"
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
    createGame: "Créer une partie",
    joinGame: "Rejoindre une partie",
    yourServerCode: "Code de la partie :",
    waitingPlayer: "En attente qu'un joueur rejoigne...",
    invalidCode: "Code invalide. Veuillez réessayer.",
    serverCreated: "Partie créée !",
    insertNation: "Entrez le nom de la nation.",
    insertGov: "Choisissez une forme de gouvernement.",
    placeholderNation: "Entrez le nom de la nation"
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
    createGame: "Spiel erstellen",
    joinGame: "Spiel beitreten",
    yourServerCode: "Spielcode:",
    waitingPlayer: "Warten auf einen Mitspieler...",
    invalidCode: "Ungültiger Code. Bitte versuche es erneut.",
    serverCreated: "Spiel erstellt!",
    insertNation: "Gib den Namen der Nation ein.",
    insertGov: "Wähle eine Regierungsform.",
    placeholderNation: "Gib den Namen der Nation ein"
  }
};
const flagMap = { en: "gb", it: "it", es: "es", fr: "fr", de: "de" };

// === MULTILINGUA LOGICA ===
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
  document.getElementById('create-game-btn').innerText = t.createGame;
  document.getElementById('join-game-btn').innerText = t.joinGame;
  document.getElementById('nation-name').placeholder = t.placeholderNation;
  // Cambia la bandiera in base alla lingua selezionata
  const flagCode = flagMap[lang];
  document.getElementById('flag-current').src = `https://flagcdn.com/${flagCode}.svg`;
  document.getElementById('flag-current').alt = lang;
  // Aggiorna anche la label del codice se visibile
  if(document.getElementById('game-code-panel').style.display !== "none") {
      document.getElementById('game-code-label').textContent = t.yourServerCode;
  }
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

// === UI ELEMENTS ===
const nationNameInput = document.getElementById('nation-name');
const governmentTypeInput = document.getElementById('government-type');
const createBtn = document.getElementById('create-game-btn');
const joinBtn = document.getElementById('join-game-btn');
const joinForm = document.getElementById('join-form');
const joinSubmitBtn = document.getElementById('join-submit-btn');
const gameCodePanel = document.getElementById('game-code-panel');
const codeLabel = document.getElementById('game-code-label');
const codeValue = document.getElementById('game-code-value');
const outputDiv = document.getElementById('output');
const gameCodeInput = document.getElementById('game-code-input');
let myGameCode = null;
let myPlayerId = null;
let isHost = false;

// === CREA PARTITA ===
createBtn.addEventListener('click', function() {
    const t = translations[currentLang];
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
        codeLabel.textContent = t.yourServerCode;
        codeValue.textContent = code;
        gameCodePanel.style.display = "flex";
        joinForm.style.display = "none";
        outputDiv.textContent = t.serverCreated + " " + t.waitingPlayer;
        localStorage.setItem('gameCode', code);
        localStorage.setItem('playerId', myPlayerId);
    }).catch(err => {
        outputDiv.textContent = "Errore nella creazione della partita: " + err.message;
    });
});

// === MOSTRA FORM JOIN ===
joinBtn.addEventListener('click', function() {
    joinForm.style.display = "flex";
    gameCodePanel.style.display = "none";
    outputDiv.textContent = "";
});

// === SUBMIT JOIN ===
joinSubmitBtn.addEventListener('click', function() {
    const t = translations[currentLang];
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
            gameCodePanel.style.display = "none";
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

// === GENERA CODICE PARTITA ===
function generateGameCode(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
