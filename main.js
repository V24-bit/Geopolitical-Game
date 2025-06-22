// === BANDIERE DI TUTTO IL MONDO, COME PRIMA ===
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
    title: "Create your Nation",
    labelNation: "Name your Nation:",
    labelGovernment: "Form of Government:",
    optionSelect: "Select...",
    optionDictatorship: "Dictatorship",
    optionRepublic: "Republic",
    optionMonarchy: "Monarchy",
    optionTheocracy: "Theocracy",
    optionOligarchy: "Oligarchy",
    optionAnarchy: "Anarchy",
    confirm: "Confirm",
    createdNation: "Nation created:",
    name: "Name:",
    government: "Form of Government:"
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
    optionOligarchy: "Oligarchia",
    optionAnarchy: "Anarchia",
    confirm: "Conferma",
    createdNation: "Nazione creata:",
    name: "Nome:",
    government: "Forma di governo:"
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
    optionOligarchy: "Oligarquía",
    optionAnarchy: "Anarquía",
    confirm: "Confirmar",
    createdNation: "Nación creada:",
    name: "Nombre:",
    government: "Forma de Gobierno:"
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
    optionOligarchy: "Oligarchie",
    optionAnarchy: "Anarchie",
    confirm: "Confirmer",
    createdNation: "Nation créée:",
    name: "Nom:",
    government: "Forme de gouvernement:"
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
    optionOligarchy: "Oligarchie",
    optionAnarchy: "Anarchie",
    confirm: "Bestätigen",
    createdNation: "Nation erstellt:",
    name: "Name:",
    government: "Regierungsform:"
  }
};

// Mappa lingue/codice bandiera
const flagMap = {
  en: "gb",
  it: "it",
  es: "es",
  fr: "fr",
  de: "de"
};

// Funzione per cambiare lingua
function setLanguage(lang) {
  const t = translations[lang];
  document.getElementById('title').innerText = t.title;
  document.getElementById('label-nation-name').innerText = t.labelNation;
  document.getElementById('label-government-type').innerText = t.labelGovernment;

  // Opzioni select
  document.getElementById('option-select').innerText = t.optionSelect;
  document.getElementById('option-dictatorship').innerText = t.optionDictatorship;
  document.getElementById('option-republic').innerText = t.optionRepublic;
  document.getElementById('option-monarchy').innerText = t.optionMonarchy;
  document.getElementById('option-theocracy').innerText = t.optionTheocracy;
  document.getElementById('option-oligarchy').innerText = t.optionOligarchy;
  document.getElementById('option-anarchy').innerText = t.optionAnarchy;

  document.getElementById('confirm-btn').innerText = t.confirm;

  // Aggiorna la bandiera nella tendina
  document.getElementById('flag-current').src = `https://flagcdn.com/${flagMap[lang]}.svg`;
  document.getElementById('flag-current').alt = lang;
}

// Cambia lingua all'avvio
let currentLang = "en";
setLanguage(currentLang);

// Menu a tendina lingue
document.getElementById("language-menu").addEventListener('change', function() {
  const lang = this.value;
  setLanguage(lang);
  currentLang = lang;
  document.getElementById("output").innerHTML = ""; // Pulisci output a cambio lingua
});

// Gestione form (output tradotto)
document.getElementById('nation-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const nationName = document.getElementById('nation-name').value.trim();
    const government = document.getElementById('government-type').value;
    const t = translations[currentLang];
    if (nationName && government) {
        document.getElementById('output').innerHTML =
            `<h2>${t.createdNation}</h2>
             <p><strong>${t.name}</strong> ${nationName}</p>
             <p><strong>${t.government}</strong> ${document.getElementById('government-type').options[document.getElementById('government-type').selectedIndex].text}</p>`;
    }
});
