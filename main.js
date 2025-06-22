// Questo codice prende i valori inseriti dal giocatore e li mostra a schermo
document.getElementById('nation-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Previene il ricaricamento della pagina
    const name = document.getElementById('nation-name').value.trim();
    const government = document.getElementById('government-type').value;
    if (name && government) {
        document.getElementById('output').innerHTML = 
            `<h2>Nazione creata:</h2>
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>Forma di governo:</strong> ${government.charAt(0).toUpperCase() + government.slice(1)}</p>`;
    }
});
