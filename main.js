// === FIREBASE CONFIG ===
const firebaseConfig = {
  apiKey: "AIzaSyC-nxzpcf5I_NHkKbWbLXRFRRzQLv9ilWU",
  authDomain: "geopolitical-game-5f135.firebaseapp.com",
  projectId: "geopolitical-game-5f135",
  storageBucket: "geopolitical-game-5f135.appspot.com",
  messagingSenderId: "537294174901",
  appId: "1:537294174901:web:0c0eebedfd927cc8e65cfc"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// === FUNZIONI DI GIOCO ===
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

    if(joinForm) joinForm.style.display = "none";
    if(gameCodePanel) gameCodePanel.style.display = "none";
    centerPanels();

    // Clicca "Join Game": mostra campo codice
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

    // Clicca "Create Game": genera e salva codice
    if(createBtn && joinForm && gameCodePanel && gameCodeLabel && gameCodeValue) {
        createBtn.addEventListener('click', async function() {
            if (nationName && (!nationName.value.trim() || !governmentType.value)) {
                showTempError('Inserire un nome e una forma di governo prima di entrare o creare una partita');
                return;
            }
            joinForm.style.display = "none";
            // Genera codice partita
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();

            // Salva su Firestore
            try {
                await db.collection("partite").doc(code).set({
                    codice: code,
                    creatoIl: firebase.firestore.FieldValue.serverTimestamp(),
                    nazione: nationName.value,
                    governo: governmentType.value
                });
                gameCodeLabel.textContent = "Codice partita:";
                gameCodeValue.textContent = code;
                gameCodePanel.style.display = "flex";
                centerPanels();
                if(output) output.textContent = "";
            } catch (e) {
                showTempError("Errore salvataggio partita su Firebase!");
            }
        });
    }

    // Unisciti a partita: verifica su Firestore
    if(joinSubmitBtn && gameCodeInput && output && joinForm) {
        joinSubmitBtn.addEventListener('click', async function() {
            if (nationName && (!nationName.value.trim() || !governmentType.value)) {
                showTempError('Inserire un nome e una forma di governo prima di entrare o creare una partita');
                return;
            }
            const code = gameCodeInput.value.trim().toUpperCase();
            if(code.length < 4) {
                output.textContent = "Codice non valido!";
                return;
            }
            // Leggi da Firestore
            try {
                const doc = await db.collection("partite").doc(code).get();
                if (doc.exists) {
                    output.textContent = `Unito alla partita: ${code}`;
                    joinForm.style.display = "none";
                    centerPanels();
                    // Qui puoi aggiungere la logica per andare avanti nel gioco
                } else {
                    output.textContent = "Codice partita non trovato!";
                }
            } catch (e) {
                output.textContent = "Errore di connessione a Firebase!";
            }
        });
    }
});
