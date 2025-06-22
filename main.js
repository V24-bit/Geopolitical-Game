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
  //... [le tue traduzioni, come già presenti] ...
  // -- lascia uguale tutto il blocco delle traduzioni --
  // Copia qui l'intero blocco translations dal tuo file attuale, non serve riscriverlo
  // ...
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
}

document.getElementById("language-menu").addEventListener('change', function() {
  const lang = this.value;
  setLanguage(lang);
  currentLang = lang;
  document.getElementById("output").innerHTML = "";
});

let currentLang = "en";
setLanguage(currentLang);

// === SERVER LOBBY MULTI-DISPOSITIVO CON FIREBASE ===

function generateServerCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
}
let myServerCode = null;
let myRole = null; // "creator" or "guest"
let myInfo = null;
let pendingJoin = false;

// CREA SERVER
document.getElementById('create-server-btn').onclick = function() {
    document.getElementById('server-actions').style.display = 'none';
    document.getElementById('server-panel').style.display = '';
    document.getElementById('server-create-panel').style.display = '';
    document.getElementById('server-join-panel').style.display = 'none';
    myServerCode = generateServerCode();
    document.getElementById('server-code').innerText = myServerCode;
    myRole = "creator";
    // Crea la stanza su Firebase
    firebase.database().ref('games/' + myServerCode).set({
        creator: null,
        guest: null,
        createdAt: Date.now()
    });
};

// UNISCITI SERVER
document.getElementById('join-server-btn').onclick = function() {
    document.getElementById('server-actions').style.display = 'none';
    document.getElementById('server-panel').style.display = '';
    document.getElementById('server-create-panel').style.display = 'none';
    document.getElementById('server-join-panel').style.display = '';
    myRole = "guest";
};

// TORNA INDIETRO
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

// CREA LA NAZIONE
document.getElementById('nation-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const nationName = document.getElementById('nation-name').value.trim();
    const government = document.getElementById('government-type').value;
    const t = translations[currentLang];
    if (nationName && government) {
        myInfo = { name: nationName, gov: government };
        if (myRole === "creator" && myServerCode) {
            // Salva info creator su Firebase
            firebase.database().ref('games/' + myServerCode + '/creator').set(myInfo).then(()=>{
                showGameInterface(myServerCode);
            });
        } else if (myRole === "guest" && pendingJoin && myServerCode) {
            // Salva info guest su Firebase
            firebase.database().ref('games/' + myServerCode + '/guest').set(myInfo).then(()=>{
                showGameInterface(myServerCode);
            });
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

// UNISCITI (VERIFICA IL CODICE E SCRIVI SU FIREBASE)
document.getElementById('submit-join-btn').onclick = function() {
    const code = document.getElementById('join-code').value.toUpperCase();
    const t = translations[currentLang];
    firebase.database().ref('games/' + code).once('value').then(snapshot => {
        if (snapshot.exists() && !snapshot.val().guest) {
            myServerCode = code;
            if (!myInfo) {
                // Chiedi di compilare il form
                document.getElementById('server-panel').style.display = 'none';
                document.getElementById('nation-form').style.display = '';
                document.getElementById('output').style.display = 'none';
                pendingJoin = true;
            } else {
                firebase.database().ref('games/' + code + '/guest').set(myInfo).then(()=>{
                    showGameInterface(code);
                });
            }
            document.getElementById('join-error').innerText = '';
        } else {
            document.getElementById('join-error').innerText = t.invalidCode;
        }
    });
};

// MOSTRA INTERFACCIA DI GIOCO E AGGIORNA IN TEMPO REALE LA LOBBY
function showGameInterface(code) {
    document.getElementById('server-actions').style.display = 'none';
    document.getElementById('server-panel').style.display = 'none';
    document.getElementById('nation-form').style.display = 'none';
    document.getElementById('output').style.display = 'none';
    document.getElementById('game-interface').style.display = '';
    firebase.database().ref('games/' + code).on('value', function(snapshot) {
        updatePlayersList(snapshot.val());
    });
}

function updatePlayersList(server) {
    const t = translations[currentLang];
    let html = "";
    if (server && server.creator) {
        html += `<div>${t.forms[server.creator.gov]} ${server.creator.name}</div>`;
    }
    if (server && server.guest) {
        html += `<div>${t.forms[server.guest.gov]} ${server.guest.name}</div>`;
    } else if (myRole === "creator") {
        html += `<div style="opacity:.6">${t.waitingPlayer}</div>`;
    }
    document.getElementById('players-list').innerHTML = html;
}
