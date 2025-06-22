// Lista di tutti i codici ISO delle nazioni del mondo
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

// Genera la lista completa delle bandiere
const flags = countryCodes.map(code => `https://flagcdn.com/w320/${code}.png`);

// Cambia la bandiera di sfondo in loop
let flagIndex = 0;
function changeFlagBackground() {
  document.body.style.backgroundImage = `url('${flags[flagIndex]}')`;
  flagIndex = (flagIndex + 1) % flags.length;
}
changeFlagBackground(); // Mostra subito la prima bandiera
setInterval(changeFlagBackground, 1500); // Cambia ogni 1.5 secondi

// Variabile globale per il nome della nazione
let nationName = "";

// Gestione centralizzata della scelta del nome
document.getElementById('nation-form').addEventListener('submit', function(e) {
    e.preventDefault();
    nationName = document.getElementById('nation-name').value.trim();
    const government = document.getElementById('government-type').value;
    if (nationName && government) {
        document.getElementById('output').innerHTML = 
            `<h2>Nazione creata:</h2>
            <p><strong>Nome:</strong> ${nationName}</p>
            <p><strong>Forma di governo:</strong> ${government.charAt(0).toUpperCase() + government.slice(1)}</p>`;
    }
    // Ora puoi usare la variabile globale nationName ovunque nel tuo script
});
