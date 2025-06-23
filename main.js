// === SFONDO MOSAICO DI BANDIERE (OPZIONALE, solo se hai il div animated-flags-bg) ===
// Se vuoi aggiungere lo sfondo animato, assicurati di avere <div id="animated-flags-bg"></div> nel tuo HTML
const flagsBg = document.getElementById('animated-flags-bg');
if (flagsBg) {
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

    let gridCols = 0, gridRows = 0;
    function createFlagGrid() {
        const flagAspect = 3/2;
        const ww = window.innerWidth;
        const wh = window.innerHeight;
        let colWidth = 90, rowHeight = 60;
        gridCols = Math.ceil(ww / colWidth);
        gridRows = Math.ceil(wh / rowHeight);
        colWidth = ww / gridCols;
        rowHeight = wh / gridRows;
        flagsBg.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
        flagsBg.style.gridTemplateRows = `repeat(${gridRows}, 1fr)`;
        flagsBg.innerHTML = '';
        for (let i = 0; i < gridCols * gridRows; i++) {
            const img = document.createElement('img');
            img.className = 'flag-tile';
            img.src = flags[0];
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.aspectRatio = flagAspect;
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
}

// === GESTIONE JOIN/CREATE GAME ===
document.addEventListener('DOMContentLoaded', function() {
    // Pulsanti
    const joinBtn = document.getElementById('join-game-btn');
    const createBtn = document.getElementById('create-game-btn');
    // Form e pannelli
    const joinForm = document.getElementById('join-form');
    const gameCodePanel = document.getElementById('game-code-panel');
    const output = document.getElementById('output');
    const gameCodeLabel = document.getElementById('game-code-label');
    const gameCodeValue = document.getElementById('game-code-value');
    const joinSubmitBtn = document.getElementById('join-submit-btn');
    const gameCodeInput = document.getElementById('game-code-input');

    // Nascondi entrambi all'avvio
    if(joinForm) joinForm.style.display = "none";
    if(gameCodePanel) gameCodePanel.style.display = "none";

    // Mostra campo codice al click su "Join Game"
    if(joinBtn && joinForm) {
        joinBtn.addEventListener('click', function() {
            joinForm.style.display = "flex";
            if(gameCodePanel) gameCodePanel.style.display = "none";
            if(output) output.textContent = "";
            if(joinForm.querySelector('input')) joinForm.querySelector('input').value = "";
        });
    }

    // Nascondi campo codice e mostra codice generato al click su "Create Game"
    if(createBtn && joinForm && gameCodePanel && gameCodeLabel && gameCodeValue) {
        createBtn.addEventListener('click', function() {
            joinForm.style.display = "none";
            // Genera codice alfanumerico di 6 caratteri
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            gameCodeLabel.textContent = "Codice partita:";
            gameCodeValue.textContent = code;
            gameCodePanel.style.display = "block";
            if(output) output.textContent = "";
        });
    }

    // Unisciti a partita (simulazione)
    if(joinSubmitBtn && gameCodeInput && output && joinForm) {
        joinSubmitBtn.addEventListener('click', function() {
            const code = gameCodeInput.value.trim();
            if(code.length < 4) {
                output.textContent = "Codice non valido!";
                return;
            }
            output.textContent = `Hai richiesto di unirti alla partita: ${code}`;
            joinForm.style.display = "none";
        });
    }
});
