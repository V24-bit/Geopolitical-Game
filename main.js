// === GESTIONE JOIN/CREATE GAME E VALIDAZIONE ===
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
    const nationName = document.getElementById('nation-name');
    const governmentType = document.getElementById('government-type');

    // Centra sempre i pannelli, anche se ci sono override da altri stili
    function centerPanels() {
        [joinForm, gameCodePanel].forEach(panel => {
            if(panel) {
                panel.style.display = panel.style.display || "none";
                panel.style.alignItems = "center";
                panel.style.justifyContent = "center";
                panel.style.marginLeft = "auto";
                panel.style.marginRight = "auto";
                panel.style.position = "relative";
                panel.style.left = "0";
                panel.style.right = "0";
            }
        });
    }

    // Messaggio temporaneo rosso
    function showTempError(msg) {
        let err = document.getElementById('temp-error-msg');
        if (!err) {
            err = document.createElement('div');
            err.id = 'temp-error-msg';
            err.style.color = '#ff3333';
            err.style.margin = '10px 0 0 0';
            err.style.fontWeight = 'bold';
            err.style.textAlign = 'center';
            output.parentNode.insertBefore(err, output);
        }
        err.textContent = msg;
        err.style.opacity = '1';
        setTimeout(() => {
            err.style.transition = 'opacity 0.7s';
            err.style.opacity = '0';
        }, 2000);
        setTimeout(() => {
            if (err && err.parentNode) err.parentNode.removeChild(err);
        }, 3000);
    }

    // Nascondi entrambi all'avvio
    if(joinForm) joinForm.style.display = "none";
    if(gameCodePanel) gameCodePanel.style.display = "none";
    centerPanels();

    // Mostra campo codice al click su "Join Game"
    if(joinBtn && joinForm) {
        joinBtn.addEventListener('click', function() {
            if (nationName && (!nationName.value.trim() || !governmentType.value)) {
                showTempError('Inserire un nome e una forma di governo prima di entrare o creare una partita');
                return;
            }
            joinForm.style.display = "flex";
            if(gameCodePanel) gameCodePanel.style.display = "none";
            if(output) output.textContent = "";
            if(joinForm.querySelector('input')) joinForm.querySelector('input').value = "";
            centerPanels();
        });
    }

    // Nascondi campo codice e mostra codice generato al click su "Create Game"
    if(createBtn && joinForm && gameCodePanel && gameCodeLabel && gameCodeValue) {
        createBtn.addEventListener('click', function() {
            if (nationName && (!nationName.value.trim() || !governmentType.value)) {
                showTempError('Inserire un nome e una forma di governo prima di entrare o creare una partita');
                return;
            }
            joinForm.style.display = "none";
            // Genera codice alfanumerico di 6 caratteri
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            gameCodeLabel.textContent = "Codice partita:";
            gameCodeValue.textContent = code;
            gameCodePanel.style.display = "flex";
            centerPanels();
            if(output) output.textContent = "";
        });
    }

    // Unisciti a partita (simulazione)
    if(joinSubmitBtn && gameCodeInput && output && joinForm) {
        joinSubmitBtn.addEventListener('click', function() {
            if (nationName && (!nationName.value.trim() || !governmentType.value)) {
                showTempError('Inserire un nome e una forma di governo prima di entrare o creare una partita');
                return;
            }
            const code = gameCodeInput.value.trim();
            if(code.length < 4) {
                output.textContent = "Codice non valido!";
                return;
            }
            output.textContent = `Hai richiesto di unirti alla partita: ${code}`;
            joinForm.style.display = "none";
            centerPanels();
        });
    }
});
