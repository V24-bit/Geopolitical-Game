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

    let unsubscribeLobby = null; // Listener della lobby

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

    function showLobby(doc, myNation) {
        // Mostra il codice partita SEMPRE nel pannello
        if (!doc.exists) {
            output.textContent = "Errore: partita non trovata!";
            if (gameCodePanel) gameCodePanel.style.display = "none";
            return;
        }
        const data = doc.data();
        if (gameCodePanel && gameCodeLabel && gameCodeValue) {
            gameCodeLabel.textContent = "Codice partita:";
            gameCodeValue.textContent = data.codice || "";
            gameCodePanel.style.display = "flex";
            centerPanels();
        }
        let lobbyText = `Creatore: <b>${data.nazione}</b><br>`;
        lobbyText += "Giocatori nella stanza:<ul>";
        if (Array.isArray(data.giocatori)) {
            data.giocatori.forEach(n => {
                lobbyText += `<li>${n}${n === data.nazione ? " (creatore)" : ""}${n === myNation && n !== data.nazione ? " (tu)" : ""}</li>`;
            });
        }
        lobbyText += "</ul>";
        output.innerHTML = lobbyText;
    }

    if(joinForm) joinForm.style.display = "none";
    if(gameCodePanel) gameCodePanel.style.display = "none";
    centerPanels();

    // "Unisciti a partita"
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

    // "Crea partita"
    if(createBtn && joinForm && gameCodePanel && gameCodeLabel && gameCodeValue) {
        createBtn.addEventListener('click', async function() {
            if (nationName && (!nationName.value.trim() || !governmentType.value)) {
                showTempError('Inserire un nome e una forma di governo prima di entrare o creare una partita');
                return;
            }
            joinForm.style.display = "none";
            // Genera codice partita
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();

            try {
                await db.collection("partite").doc(code).set({
                    codice: code,
                    creatoIl: firebase.firestore.FieldValue.serverTimestamp(),
                    nazione: nationName.value,
                    governo: governmentType.value,
                    giocatori: [nationName.value]
                });
                // Mostra codice
                gameCodeLabel.textContent = "Codice partita:";
                gameCodeValue.textContent = code;
                gameCodePanel.style.display = "flex";
                centerPanels();
                if(output) output.textContent = "";

                // Avvia lobby in tempo reale
                if (unsubscribeLobby) unsubscribeLobby();
                unsubscribeLobby = db.collection("partite").doc(code).onSnapshot(doc => {
                    showLobby(doc, nationName.value);
                });

            } catch (e) {
                showTempError("Errore salvataggio partita su Firebase!");
            }
        });
    }

    // "Entra" in partita esistente
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
            try {
                const partitaRef = db.collection("partite").doc(code);
                const doc = await partitaRef.get();
                if (doc.exists) {
                    await partitaRef.update({
                        giocatori: firebase.firestore.FieldValue.arrayUnion(nationName.value)
                    });
                    output.textContent = "";
                    joinForm.style.display = "none";
                    // Mostra SEMPRE il codice partita
                    if (gameCodePanel && gameCodeLabel && gameCodeValue) {
                        gameCodeLabel.textContent = "Codice partita:";
                        gameCodeValue.textContent = code;
                        gameCodePanel.style.display = "flex";
                        centerPanels();
                    }

                    // Avvia lobby in tempo reale
                    if (unsubscribeLobby) unsubscribeLobby();
                    unsubscribeLobby = partitaRef.onSnapshot(doc => {
                        showLobby(doc, nationName.value);
                    });

                } else {
                    output.textContent = "Codice partita non trovato!";
                    if (gameCodePanel) gameCodePanel.style.display = "none";
                }
            } catch (e) {
                output.textContent = "Errore di connessione a Firebase!";
                if (gameCodePanel) gameCodePanel.style.display = "none";
            }
        });
    }
});
