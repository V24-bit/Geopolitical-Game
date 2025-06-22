// Array di URL di bandiere (aggiungi altre se vuoi)
const flags = [
  "https://flagcdn.com/w320/it.png", // Italia
  "https://flagcdn.com/w320/us.png", // USA
  "https://flagcdn.com/w320/fr.png", // Francia
  "https://flagcdn.com/w320/de.png", // Germania
  "https://flagcdn.com/w320/jp.png", // Giappone
  "https://flagcdn.com/w320/br.png", // Brasile
  "https://flagcdn.com/w320/ru.png", // Russia
  "https://flagcdn.com/w320/cn.png", // Cina
  "https://flagcdn.com/w320/gb.png", // Regno Unito
  "https://flagcdn.com/w320/in.png"  // India
  // Puoi aggiungere molte altre bandiere usando i codici ISO 3166-1 alpha-2
];

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
    // Qui puoi usare la variabile globale nationName in altri script futuri
});
