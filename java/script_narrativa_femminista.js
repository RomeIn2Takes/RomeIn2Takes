/*PULSANTI CHE TELL ME LESS, MORE, DID YOU KNOW 
    buttonElement: rappresenta esattamente il bottone su cui si clicca.
    .closest('.story-content'): guarda alla struttura HTML a partire dal bottone per trovare il box che contiene tutto il testo di quella specifica scena (evitando di modificare per errore i testi delle altre scene).
    querySelector(...): Cerca un elemento specifico all'interno di quel box e ne modifica la proprietà CSS (style.display) per renderlo visibile (block) o nasconderlo (none). */


function getActiveLevel(parentBox) {
    // Trova quale dei tre livelli ha display 'block' in questo momento
    if (parentBox.querySelector('.level-normal').style.display !== 'none') {
        return parentBox.querySelector('.level-normal');
    } else if (parentBox.querySelector('.level-child').style.display !== 'none') {
        return parentBox.querySelector('.level-child');
    } else {
        return parentBox.querySelector('.level-scholar');
    }
}

function showLess(buttonElement) {
    const parentBox = buttonElement.closest('.story-content'); //trova lo story-content più vicino al button cliccato
    const activeLevel = getActiveLevel(parentBox); // Prende il livello visibile
    activeLevel.querySelector('.text-less').style.display = 'block'; //rende visibile il text less impostando il display su block
    activeLevel.querySelector('.text-standard').style.display = 'none';
    activeLevel.querySelector('.text-more').style.display = 'none';  //nasconde il text more impostando il display su none
    activeLevel.querySelector('.text-didyouknow').style.display = 'none'; //nasconde il text did you know impostando il display su none
}

function showMore(buttonElement) {
    const parentBox = buttonElement.closest('.story-content');
    const activeLevel = getActiveLevel(parentBox);
    activeLevel.querySelector('.text-less').style.display = 'none';
    activeLevel.querySelector('.text-standard').style.display = 'none';
    activeLevel.querySelector('.text-more').style.display = 'block';
    activeLevel.querySelector('.text-didyouknow').style.display = 'none';
}

function showDidYouKnow(buttonElement) {
    const parentBox = buttonElement.closest('.story-content');
    const activeLevel = getActiveLevel(parentBox);
    activeLevel.querySelector('.text-less').style.display = 'none';
    activeLevel.querySelector('.text-standard').style.display = 'none';
    activeLevel.querySelector('.text-more').style.display = 'none';
    activeLevel.querySelector('.text-didyouknow').style.display = 'block';
}

/*FRECCE PER ANDARE AVANTI E INDIETRO
    i = numero d'ordine 
    current_scene = scena corrente che si aggiorna ogni volta che si va avanti o indietro */

let current_scene = 0;

function update_scene() {   //prende tutti gli elementi che hanno la classe '.area-immagini' e li mette in una lista 'scene' 
    const scene = document.querySelectorAll('.area-immagini');
    scene.forEach((scena, i) => {   //ciclo foreach che guarda ogni scena 
       
        scena.style.display = (i === current_scene) ? 'flex' : 'none';     //il "i===current_scene" crea un confronto, che se risulta vero (se l'indice della scena che sto guardando è uguale alla scena corrente imposra il display flex (la mostra), altrimenti none(la nasconde))
    });
}

function next_scene() {
    const scene = document.querySelectorAll('.area-immagini');
    current_scene++; //crea un elenco di tutte le scene presenti nella paginaq
    if (current_scene >= scene.length) {
        current_scene = 0; // Se vuole andare avanti e si trova già all'ultima scena, si ricomincia 
    }
    update_scene();
}

function previous_scene() {
    const scene = document.querySelectorAll('.area-immagini'); // crea un elenco di tutte le scene presenti nella pagina 
    current_scene--; //diminuisce di 1 il numero della scena attuale tornando alla precedente
    if (current_scene < 0) {
        current_scene = scene.length - 1; // Se è alla prima scena, torna all'ultima
    }
    update_scene();
}

/*FUNZIONE PER MOSTRARE SOLO IL CONTENUTO METADATI */
function showMetadataView(buttonElement) {
    const parentBox = buttonElement.closest('.description-container-right');
    parentBox.querySelector('.story-content').style.display = 'none';
    parentBox.querySelector('.qr-content').style.display = 'none';
    parentBox.querySelector('.metadata-content').style.display = 'block';
}

/*FUNZIONE PER MOSTRARE SOLO IL CONTENUTO STORY */
function showStoryView(buttonElement) {
    const parentBox = buttonElement.closest('.description-container-right');
    parentBox.querySelector('.story-content').style.display = 'block';
    parentBox.querySelector('.metadata-content').style.display = 'none';
    parentBox.querySelector('.qr-content').style.display = 'none';
}

/* FUNZIONE PER MOSTRARE SOLO IL CONTENUTO QR */
function showQRView(buttonElement) {
    const parentBox = buttonElement.closest('.description-container-right');
    parentBox.querySelector('.story-content').style.display = 'none';
    parentBox.querySelector('.metadata-content').style.display = 'none';
    parentBox.querySelector('.qr-content').style.display = 'block';
}

/* DIFFICOLTÀ: NORMAL, CHILD, SCHOLAR */
function showNormal(buttonElement) {
    const parentBox = buttonElement.closest('.story-content');
    parentBox.querySelector('.level-normal').style.display = 'block';
    parentBox.querySelector('.level-child').style.display = 'none';
    parentBox.querySelector('.level-scholar').style.display = 'none';
    resetToStandard(parentBox); // Riporta al testo standard di default
}

function showChild(buttonElement) {
    const parentBox = buttonElement.closest('.story-content');
    parentBox.querySelector('.level-normal').style.display = 'none';
    parentBox.querySelector('.level-child').style.display = 'block';
    parentBox.querySelector('.level-scholar').style.display = 'none';
    resetToStandard(parentBox); // Riporta al testo standard di default
}

function showScholar(buttonElement) {
    const parentBox = buttonElement.closest('.story-content');
    parentBox.querySelector('.level-normal').style.display = 'none';
    parentBox.querySelector('.level-child').style.display = 'none';
    parentBox.querySelector('.level-scholar').style.display = 'block';
    resetToStandard(parentBox); // Riporta al testo standard di default
}

function resetToStandard(parentBox) {
    const activeLevel = getActiveLevel(parentBox);
    activeLevel.querySelector('.text-less').style.display = 'none';
    activeLevel.querySelector('.text-standard').style.display = 'block'; // lo standard di default
    activeLevel.querySelector('.text-more').style.display = 'none';
    activeLevel.querySelector('.text-didyouknow').style.display = 'none';
}


/* FUNZIONI PER APRIRE/CHIUDERE LE FINESTRE METADATI*/
function toggleModal(modalId) {     // dichiara la funzione per aprire o chiudere una finestra specifica per l'id scelto
    const modal = document.getElementById(modalId);    // recupera da HTML l'elemento della finestra corrispondente all'ID e lo memorizza in una costante
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';    // se la finestra è aperta (display: flex) allora la chiude impostando none 
    } else {
        // altrimenti chiude eventuali altre modali aperte prima di aprire questa evitando sovrapposizioni 
        document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
        modal.style.display = 'flex';     // Apre la finestra specifica richiesta impostando il suo display su 'flex'
    }
}

/* FUNZIONE PER CHIUDERE LA FINESTRA CLICCANDO SULLO SFONDO */
function closeOnBackground(event, modalId) {
    if (event.target.id === modalId) {   // se il punto esatto in cui si è fatto clic (event.target) corrisponde esattamente all'ID dello sfondo 
        document.getElementById(modalId).style.display = 'none';   // se il click è appunto fuori, allora chiude la finestra impostando il display su none
    }
}

/* FUNZIONE PER RIMANDARE DALLA MAPPA DIRETTAMENTE ALLA SCENA GIUSTA */
window.addEventListener('DOMContentLoaded', () => { 
    const hash = window.location.hash;             // prende tutto ciò che c'è dall'# in poi 
    if (hash) {                                    // se l'# c'è
        const targetScene = document.querySelector(hash); // allora cerca nell'HTML il blocco con quell'ID esatto 
        if (targetScene) {                         // Controlla se la scena è stata trovata con successo nell'HTML
            const scenes = Array.from(document.querySelectorAll('.area-immagini')); // crea una lista di tutte le scene presenti nella pagina
            current_scene = scenes.indexOf(targetScene); // posizione numerica (indice) di quella specifica scena nella lista
            if (current_scene === -1) current_scene = 0; // se non la trova, imposta la scena 0 (la prima) come sicurezza
        }
    }
    update_scene();                                // esegue la funzione grafica che mostra solo la scena giusta e nasconde le altre
});    





/* aggiunta codice x cambio stili */

(function () {
    // 1. Trova il link CSS principale nell'head
    const cssLink = document.querySelector('link[rel="stylesheet"]');

    // 2. Se c'è uno stile salvato, lo applica subito
    const savedStyle = localStorage.getItem("userStyle");
    if (savedStyle && cssLink) {
        cssLink.setAttribute("href", savedStyle);
    }

    // Funzione che attiva i click sui link della barra
    function initBarEvents() {
        const barLinks = document.querySelectorAll(".bar-style .bar-item a");

        barLinks.forEach(link => {
            // Rimuoviamo eventuali listener precedenti per evitare duplicazioni
            link.addEventListener("click", function (e) {
                e.preventDefault(); // BLOCCA l'apertura diretta del file CSS

                const newStyle = this.getAttribute("href");

                if (cssLink && newStyle) {
                    cssLink.setAttribute("href", newStyle);
                    localStorage.setItem("userStyle", newStyle);
                }
            });
        });
    }

    // 3. Esegue la funzione sia se il DOM è già pronto, sia se si sta ancora caricando
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initBarEvents);
    } else {
        initBarEvents();
    }
})();