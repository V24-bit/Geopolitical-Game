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

// === MULTILINGUA + SERVER ===
const translations = {
  en: {
    title: "Create your Nation",
    labelNation: "Name your Nation:",
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
    createServer: "Create server",
    joinServer: "Join server",
    serverCreated: "Server created!",
    yourServerCode: "Your server code:",
    waitingPlayer: "Waiting for a player to join...",
    insertCode: "Insert server code:",
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
    title: "Crea la tua Nazione",
    labelNation: "Nome della tua Nazione:",
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
    createServer: "Crea server",
    joinServer: "Unisciti a server",
    serverCreated: "Server creato!",
    yourServerCode: "Codice server:",
    waitingPlayer: "In attesa che un giocatore si unisca...",
    insertCode: "Inserisci codice server:",
    join: "Unisciti",
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
    title: "Crea tu Nación",
    labelNation: "Nombre de tu Nación:",
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
    createServer: "Crear servidor",
    joinServer: "Unirse a servidor",
    serverCreated: "¡Servidor creado!",
    yourServerCode: "Código del servidor:",
    waitingPlayer: "Esperando a que un jugador se una...",
    insertCode: "Introduce el código del servidor:",
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
    title: "Créez votre Nation",
    labelNation: "Nom de votre Nation:",
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
    createServer: "Créer un serveur",
    joinServer: "Rejoindre un serveur",
    serverCreated: "Serveur créé !",
    yourServerCode: "Code du serveur :",
    waitingPlayer: "En attente qu'un joueur rejoigne...",
    insertCode: "Insérez le code du serveur :",
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
    title: "Erstelle deine Nation",
    labelNation: "Name deiner Nation:",
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
    createServer: "Server erstellen",
    joinServer: "Server beitreten",
    serverCreated: "Server erstellt!",
    yourServerCode: "Dein Servercode:",
    waitingPlayer: "Warten auf einen Mitspieler...",
    insertCode: "Servercode eingeben:",
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
  document.getElementById('create-server-btn').innerText = t.createServer;
  document.getElementById('join-server-btn').innerText = t.joinServer;
  document.getElementById('server-created-msg').innerText = t.serverCreated;
  document.getElementById('server-code-label').innerText = t.yourServerCode;
  document.getElementById('wait-player-msg').innerText = t.waitingPlayer;
  document.getElementById('insert-code-label').innerText = t.insertCode;
  document.getElementById('submit-join-btn').innerText = t.join;
  document.getElementById('back-btn-1').innerText = t.back;
  document.getElementById('back-btn-2').innerText = t.back;
  document.getElementById('game-title').innerText = t.gameTitle;
  document.getElementById('flag-current').src = `https://flagcdn.com/${flagMap[lang]}.svg`;
  document.getElementById('flag-current').alt = lang;
  if (myServerCode) updatePlayersList(myServerCode);
}

// === SERVER STATE SIMULATION ===
function generateServerCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
}
let serverState = {}; // { code: { creator: {name, gov}, guest: {name, gov} } }
let myServerCode = null;
let myRole = null; // "creator" or "guest"
let myInfo = null;
let pendingJoin = false;

document.getElementById("language-menu").addEventListener('change', function() {
  const lang = this.value;
  setLanguage(lang);
  currentLang = lang;
  document.getElementById("output").innerHTML = "";
});

let currentLang = "en";
setLanguage(currentLang);

document.getElementById('create-server-btn').onclick = function() {
    document.getElementById('server-actions').style.display = 'none';
    document.getElementById('server-panel').style.display = '';
    document.getElementById('server-create-panel').style.display = '';
    document.getElementById('server-join-panel').style.display = 'none';
    myServerCode = generateServerCode();
    document.getElementById('server-code').innerText = myServerCode;
    myRole = "creator";
};

document.getElementById('join-server-btn').onclick = function() {
    document.getElementById('server-actions').style.display = 'none';
    document.getElementById('server-panel').style.display = '';
    document.getElementById('server-create-panel').style.display = 'none';
    document.getElementById('server-join-panel').style.display = '';
    myRole = "guest";
};

document.getElementById('back-btn-1').onclick = document.getElementById('back-btn-2').onclick = function() {
    document.getElementById('server-actions').style.display = '';
    document.getElementById('server-panel').style.display = 'none';
    document.getElementById('server-create-panel').style.display = 'none';
    document.getElementById('server-join-panel').style.display = 'none';
    document.getElementById('join-error').innerText = '';
    myServerCode = null;
    myRole = null;
    pendingJoin = false;
};

document.getElementById('nation-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const nationName = document.getElementById('nation-name').value.trim();
    const government = document.getElementById('government-type').value;
    const t = translations[currentLang];
    if (nationName && government) {
        myInfo = { name: nationName, gov: government };
        if (myRole === "creator" && myServerCode) {
            serverState[myServerCode] = { creator: myInfo, guest: null };
            showGameInterface(myServerCode);
        } else if (myRole === "guest" && pendingJoin && myServerCode) {
            serverState[myServerCode].guest = myInfo;
            showGameInterface(myServerCode);
        } else if (myRole === "guest" && myServerCode) {
            pendingJoin = true;
            document.getElementById('nation-form').style.display = 'none';
            document.getElementById('output').style.display = '';
            document.getElementById('output').innerHTML = "Now click 'Join' to enter the server.";
        } else {
            document.getElementById('output').innerHTML =
                `<h2>${t.createdNation}</h2>
                 <p><strong>${t.name}</strong> ${nationName}</p>
                 <p><strong>${t.government}</strong> ${document.getElementById('government-type').options[document.getElementById('government-type').selectedIndex].text}</p>`;
        }
    }
});

document.getElementById('submit-join-btn').onclick = function() {
    const code = document.getElementById('join-code').value.toUpperCase();
    const t = translations[currentLang];
    if (serverState[code] && !serverState[code].guest) {
        myServerCode = code;
        if (!myInfo) {
            // Chiedi di compilare il form
            document.getElementById('server-panel').style.display = 'none';
            document.getElementById('nation-form').style.display = '';
            document.getElementById('output').style.display = 'none';
            pendingJoin = true;
        } else {
            serverState[code].guest = myInfo;
            showGameInterface(code);
        }
        document.getElementById('join-error').innerText = '';
    } else {
        document.getElementById('join-error').innerText = t.invalidCode;
    }
};

function showGameInterface(code) {
    document.getElementById('server-actions').style.display = 'none';
    document.getElementById('server-panel').style.display = 'none';
    document.getElementById('nation-form').style.display = 'none';
    document.getElementById('output').style.display = 'none';
    document.getElementById('game-interface').style.display = '';
    updatePlayersList(code);
}

function updatePlayersList(code) {
    const t = translations[currentLang];
    const server = serverState[code];
    let html = "";
    if (server.creator) {
        html += `<div>${t.forms[server.creator.gov]} ${server.creator.name}</div>`;
    }
    if (server.guest) {
        html += `<div>${t.forms[server.guest.gov]} ${server.guest.name}</div>`;
    } else if (myRole === "creator") {
        html += `<div style="opacity:.6">${t.waitingPlayer}</div>`;
    }
    document.getElementById('players-list').innerHTML = html;
}
