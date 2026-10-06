/* ============================================================
   GENERAL CAMBIO STILE (sempre attivo)
   ============================================================ */

(function () {

    // Trova il CSS principale della pagina
    const cssLink =
        document.getElementById('theme-style') ||
        document.querySelector('link[rel="stylesheet"]');

    // Se c'è uno stile salvato, lo applica (ripulendo eventuali vecchi stili non validi)
    const savedStyle = localStorage.getItem("userStyle");
    const validStyles = [
        "css/base.css",
        "css/style1500.css",
        "css/style1900.css",
        "css/style1980.css",
        "css/style2000.css",
        "css/style2020.css",
        "css/style2035.css"
    ];

    if (savedStyle && cssLink) {
        if (validStyles.indexOf(savedStyle) !== -1) {
            cssLink.setAttribute("href", savedStyle);
        } else {
            localStorage.setItem("userStyle", "css/base.css");
            cssLink.setAttribute("href", "css/base.css");
        }
    }


    function initBarEvents() {

        const barLinks =
            document.querySelectorAll(".bar-style .bar-item a");

        barLinks.forEach(function (link) {

            link.addEventListener("click", function (e) {

                e.preventDefault();

                const newStyle =
                    this.getAttribute("href");

                if (cssLink && newStyle) {

                    cssLink.setAttribute(
                        "href",
                        newStyle
                    );

                    localStorage.setItem(
                        "userStyle",
                        newStyle
                    );
                }

            });

        });

    }


    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initBarEvents
        );

    } else {

        initBarEvents();

    }

})();


/* ============================================================
   BOTTONE RESTA PREMUTO QUANDO IN FUNZIONE
   ============================================================ */

document.addEventListener('click', function (e) {

    const clickedButton =
        e.target.closest('[onclick]');

    if (!clickedButton) return;


    const container =
        clickedButton.parentElement;

    if (!container) return;


    Array.from(container.children).forEach(
        function (sibling) {

            if (sibling.hasAttribute('onclick')) {

                sibling.classList.remove('active');

            }

        }
    );


    clickedButton.classList.add('active');

});


/* ============================================================
   NARRATIVE (Caricamento dinamico da json/dati_tour.json)
   ============================================================ */

function initStoryPage() {

    const scenes = document.querySelectorAll('.area-immagini');
    if (!scenes.length) {
        return;
    }

    /* ------------------------------------------------------------
       CARICAMENTO E POPOLAMENTO DATI DA JSON
       ------------------------------------------------------------ */

    function populateTourData(data) {
        if (!data || !data.itinerari) return;

        // Identifica l'itinerario attivo per pathname o conteggio massimo delle tappe
        let activeTour = data.itinerari.find(function (it) {
            return window.location.pathname.indexOf(it.source_file) !== -1;
        });

        if (!activeTour) {
            let maxMatches = -1;
            data.itinerari.forEach(function (it) {
                let matches = 0;
                it.tappe.forEach(function (tappa) {
                    if (document.getElementById(tappa.id)) {
                        matches++;
                    }
                });
                if (matches > maxMatches) {
                    maxMatches = matches;
                    activeTour = it;
                }
            });
        }

        if (!activeTour) return;

        activeTour.tappe.forEach(function (tappa) {
            const sceneEl = document.getElementById(tappa.id);
            if (!sceneEl) return;

            // 1. Popola Story (Titolo, Ambiente e Livelli di lettura)
            const storyBox = sceneEl.querySelector('.story-content');
            if (storyBox && tappa.story) {
                const h3 = storyBox.querySelector('h3');
                if (h3 && tappa.story.title) {
                    h3.textContent = tappa.story.title;
                }

                const pEnv = storyBox.querySelector('p.movie-description');
                if (pEnv && tappa.story.environment) {
                    pEnv.textContent = tappa.story.environment;
                }

                if (tappa.story.levels) {
                    ['normal', 'child', 'scholar'].forEach(function (lvl) {
                        const lvlDiv = storyBox.querySelector('.level-' + lvl);
                        const lvlData = tappa.story.levels[lvl];
                        if (lvlDiv && lvlData) {
                            ['text-standard', 'text-more', 'text-less', 'text-didyouknow'].forEach(function (txtType) {
                                const p = lvlDiv.querySelector('.' + txtType);
                                if (p && lvlData[txtType]) {
                                    p.textContent = lvlData[txtType];
                                }
                            });
                        }
                    });
                }
            }

            // 2. Popola Metadati (Cinematic Context, Location, Project)
            const metaBox = sceneEl.querySelector('.metadata-content');
            if (metaBox) {
                const modalBoxes = metaBox.querySelectorAll('.modal-box');
                modalBoxes.forEach(function (mb) {
                    const titleTag = mb.querySelector('h3');
                    if (!titleTag) return;
                    const titleText = titleTag.textContent.toLowerCase();
                    const ul = mb.querySelector('ul');
                    if (!ul) return;

                    let metaObj = null;
                    if (titleText.indexOf('cinematic') !== -1) {
                        metaObj = tappa.cinematic_context;
                    } else if (titleText.indexOf('location') !== -1) {
                        metaObj = tappa.location;
                    } else if (titleText.indexOf('project') !== -1) {
                        metaObj = tappa.project;
                    }

                    if (metaObj) {
                        ul.innerHTML = '';
                        Object.keys(metaObj).forEach(function (key) {
                            const li = document.createElement('li');
                            const strong = document.createElement('strong');
                            strong.textContent = key + ': ';
                            li.appendChild(strong);
                            li.appendChild(document.createTextNode(metaObj[key]));
                            ul.appendChild(li);
                        });
                    }
                });
            }
        });
    }

    // Carica il file json/dati_tour.json
    fetch('json/dati_tour.json')
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Impossibile caricare json/dati_tour.json: ' + response.statusText);
            }
            return response.json();
        })
        .then(function (data) {
            populateTourData(data);
        })
        .catch(function (error) {
            console.error('Errore nel caricamento dei dati del tour:', error);
        });

    /* ------------------------------------------------------------
       GESTIONE LIVELLI E VARIANTI TESTO (TELL ME)
       ------------------------------------------------------------ */

    function getActiveLevel(parentBox) {
        const levels = ['.level-normal', '.level-child', '.level-scholar'];
        for (let i = 0; i < levels.length; i++) {
            const el = parentBox.querySelector(levels[i]);
            if (el && el.style.display !== 'none') {
                return el;
            }
        }
        return parentBox.querySelector('.level-normal');
    }

    function showTextType(buttonElement, targetType) {
        const parentBox = buttonElement.closest('.story-content');
        if (!parentBox) return;
        const activeLevel = getActiveLevel(parentBox);
        if (!activeLevel) return;

        ['text-standard', 'text-more', 'text-less', 'text-didyouknow'].forEach(function (type) {
            const p = activeLevel.querySelector('.' + type);
            if (p) {
                p.style.display = (type === targetType) ? 'block' : 'none';
            }
        });
    }

    window.showLess = function (buttonElement) {
        showTextType(buttonElement, 'text-less');
    };

    window.showMore = function (buttonElement) {
        showTextType(buttonElement, 'text-more');
    };

    window.showDidYouKnow = function (buttonElement) {
        showTextType(buttonElement, 'text-didyouknow');
    };

    function resetToStandard(parentBox) {
        const activeLevel = getActiveLevel(parentBox);
        if (!activeLevel) return;
        ['text-standard', 'text-more', 'text-less', 'text-didyouknow'].forEach(function (type) {
            const p = activeLevel.querySelector('.' + type);
            if (p) {
                p.style.display = (type === 'text-standard') ? 'block' : 'none';
            }
        });
    }

    function showLevel(buttonElement, targetLevel) {
        const parentBox = buttonElement.closest('.story-content');
        if (!parentBox) return;

        ['normal', 'child', 'scholar'].forEach(function (lvl) {
            const div = parentBox.querySelector('.level-' + lvl);
            if (div) {
                div.style.display = (lvl === targetLevel) ? 'block' : 'none';
            }
        });

        resetToStandard(parentBox);
    }

    window.showNormal = function (buttonElement) {
        showLevel(buttonElement, 'normal');
    };

    window.showChild = function (buttonElement) {
        showLevel(buttonElement, 'child');
    };

    window.showScholar = function (buttonElement) {
        showLevel(buttonElement, 'scholar');
    };

    /* ------------------------------------------------------------
       COMMUTAZIONE VISTE (STORY / METADATA / QR)
       ------------------------------------------------------------ */

    function switchView(buttonElement, targetViewClass) {
        const parentBox = buttonElement.closest('.description-container-right');
        if (!parentBox) return;

        ['.story-content', '.metadata-content', '.qr-content'].forEach(function (selector) {
            const el = parentBox.querySelector(selector);
            if (el) {
                el.style.display = (selector === '.' + targetViewClass) ? (targetViewClass === 'story-content' ? 'flex' : 'block') : 'none';
            }
        });
    }

    window.showStoryView = function (buttonElement) {
        switchView(buttonElement, 'story-content');
    };

    window.showMetadataView = function (buttonElement) {
        switchView(buttonElement, 'metadata-content');
    };

    window.showQRView = function (buttonElement) {
        switchView(buttonElement, 'qr-content');
    };

    /* ------------------------------------------------------------
       MODALI
       ------------------------------------------------------------ */

    window.toggleModal = function (modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
        } else {
            document.querySelectorAll('.modal-overlay, [class*="modal-overlay"]').forEach(function (m) {
                m.style.display = 'none';
            });
            modal.style.display = 'flex';
        }
    };

    window.closeOnBackground = function (event, modalId) {
        if (event.target.id === modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
            }
        }
    };

    /* ------------------------------------------------------------
       NAVIGAZIONE SCENE (FRECCE E HASH)
       ------------------------------------------------------------ */

    let current_scene = 0;

    function update_scene() {
        scenes.forEach(function (scena, i) {
            scena.style.display = (i === current_scene) ? 'flex' : 'none';
        });
    }

    window.next_scene = function () {
        current_scene++;
        if (current_scene >= scenes.length) {
            current_scene = 0;
        }
        update_scene();
    };

    window.previous_scene = function () {
        current_scene--;
        if (current_scene < 0) {
            current_scene = scenes.length - 1;
        }
        update_scene();
    };

    const hash = window.location.hash;
    if (hash) {
        const targetScene = document.querySelector(hash);
        if (targetScene) {
            const sceneList = Array.from(scenes);
            const foundIndex = sceneList.indexOf(targetScene);
            if (foundIndex !== -1) {
                current_scene = foundIndex;
            }
        }
    }

    update_scene();
}


/* ============================================================
   PAGINA MAPPA
   ============================================================ */

function initMapPage() {

    // Se questa pagina non contiene la mappa,
    // non eseguo nulla
    if (!document.getElementById('map')) {
        return;
    }


    /* ========================================================
       CREAZIONE MAPPA
       ======================================================== */

    var map =
        L.map('map')
            .setView(
                [41.9028, 12.4964],
                12
            );


    L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    ).addTo(map);


    /* ========================================================
       DATI (caricati dinamicamente da mappa.json e spostamenti.json)
       ======================================================== */

    var locations = [];
    var historicalRoutes = [];
    var womenRoutes = [];



    /* ========================================================
       MARKER
       ======================================================== */

    var markers = [];


    function setupMarkers() {

        markers = [];

        for (var i = 0; i < locations.length; i++) {

            var currentLocation =
                locations[i];


            var marker =
                L.marker([
                    currentLocation.lat,
                    currentLocation.lng
                ])
                .addTo(map)
                .bindPopup(
                    '<strong>' +
                    currentLocation.name +
                    '</strong><br>' +

                    '<em>' +
                    currentLocation.films.join(', ') +
                    '</em><br><br>' +

                    currentLocation.description
                );


            markers.push(marker);

        }

    }


    /* ========================================================
       LINEE DEI PERCORSI
       ======================================================== */

    var historicalLine;
    var womenLine;

    var currentNarrative = 'historical';


    function updateMap() {

        if (!locations || locations.length === 0) {
            return;
        }

        var visibleHistoricalRoute = [];
        var visibleWomenRoute = [];


        for (var i = 0; i < locations.length; i++) {

            var currentLocation =
                locations[i];


            var matchesNarrative =
                currentNarrative === 'all' ||
                currentLocation.narratives.includes(
                    currentNarrative
                );


            if (matchesNarrative) {

                markers[i].addTo(map);


                if (
                    currentLocation.historicalOrder !== null
                ) {

                    visibleHistoricalRoute.push({

                        lat: currentLocation.lat,
                        lng: currentLocation.lng,
                        order:
                            currentLocation.historicalOrder

                    });

                }


                if (
                    currentLocation.womenOrder !== null
                ) {

                    visibleWomenRoute.push({

                        lat: currentLocation.lat,
                        lng: currentLocation.lng,
                        order:
                            currentLocation.womenOrder

                    });

                }

            }

            else {

                map.removeLayer(markers[i]);

            }

        }


        visibleHistoricalRoute.sort(
            function (a, b) {

                return a.order - b.order;

            }
        );


        visibleWomenRoute.sort(
            function (a, b) {

                return a.order - b.order;

            }
        );


        if (historicalLine) {

            map.removeLayer(historicalLine);

        }


        if (womenLine) {

            map.removeLayer(womenLine);

        }


        historicalLine =
            L.polyline(
                visibleHistoricalRoute,
                {
                    color: 'blue'
                }
            );


        womenLine =
            L.polyline(
                visibleWomenRoute,
                {
                    color: 'red'
                }
            );


        if (
            currentNarrative === 'historical'
        ) {

            historicalLine.addTo(map);

        }

        else if (
            currentNarrative === 'women'
        ) {

            womenLine.addTo(map);

        }

        else {

            historicalLine.addTo(map);
            womenLine.addTo(map);

        }


        updateLocationsList();

    }


    /* ========================================================
       ELENCO LOCATION SOTTO LA MAPPA
       ======================================================== */

    function updateLocationsList() {

        var list =
            document.getElementById(
                'locations-list'
            );


        if (!list) {
            return;
        }


        list.innerHTML = '';


        /* ====================================================
           ALL LOCATIONS
           ==================================================== */

        if (currentNarrative === 'all') {

            for (
                var i = 0;
                i < locations.length;
                i++
            ) {

                var location =
                    locations[i];


                var card =
                    document.createElement('div');


                card.className =
                    'location-card';


                var content = '';


                content +=
                    '<div class="location-info">';


                content +=
                    '<h3>' +
                    location.name +
                    '</h3>';


                content +=
                    '<p><em>' +
                    location.films.join(', ') +
                    '</em></p>';


                content +=
                    '<p>' +
                    location.description +
                    '</p>';


                if (location.historicalLink) {

                    content +=
                        '<p><a href="' +
                        location.historicalLink +
                        '">' +
                        'Explore in the Historical Journey →' +
                        '</a></p>';

                }


                if (location.womenLink) {

                    content +=
                        '<p><a href="' +
                        location.womenLink +
                        '">' +
                        'Explore in Women & Urban Space →' +
                        '</a></p>';

                }


                content += '</div>';


                card.innerHTML = content;

                list.appendChild(card);

            }


            return;

        }


        /* ====================================================
           CREO LE TAPPE
           ==================================================== */

        var stops = [];


        for (
            var i = 0;
            i < locations.length;
            i++
        ) {

            var location =
                locations[i];


            if (
                !location.narratives.includes(
                    currentNarrative
                )
            ) {

                continue;

            }


            var order;


            if (
                currentNarrative === 'historical'
            ) {

                order =
                    location.historicalOrder;

            }

            else {

                order =
                    location.womenOrder;

            }


            var existingStop =
                stops.find(
                    function (stop) {

                        return stop.order === order;

                    }
                );


            if (!existingStop) {

                existingStop = {

                    order: order,
                    locations: []

                };


                stops.push(existingStop);

            }


            existingStop.locations.push(
                location
            );

        }


        stops.sort(
            function (a, b) {

                return a.order - b.order;

            }
        );


        /* ====================================================
           CREO LE CARD
           ==================================================== */

        for (
            var i = 0;
            i < stops.length;
            i++
        ) {

            var stop =
                stops[i];


            var card =
                document.createElement('div');


            card.className =
                'location-card';


            var content = '';


            content +=
                '<div class="location-number">' +
                String(stop.order).padStart(2, '0') +
                '</div>';


            content +=
                '<div class="location-info">';


            /* =================================================
               UNA O PIÙ LOCATION NELLA STESSA TAPPA
               ================================================= */

            for (
                var j = 0;
                j < stop.locations.length;
                j++
            ) {

                var location =
                    stop.locations[j];


                if (
                    stop.locations.length > 1
                ) {

                    content +=
                        '<div class="location-subitem">';

                }


                content +=
                    '<h3>' +
                    location.name +
                    '</h3>';


                content +=
                    '<p><em>' +
                    location.films.join(', ') +
                    '</em></p>';


                content +=
                    '<p>' +
                    location.description +
                    '</p>';


                if (
                    currentNarrative ===
                        'historical' &&
                    location.historicalLink
                ) {

                    content +=
                        '<a href="' +
                        location.historicalLink +
                        '">' +
                        'Discover this stop →' +
                        '</a>';

                }


                if (
                    currentNarrative === 'women' &&
                    location.womenLink
                ) {

                    content +=
                        '<a href="' +
                        location.womenLink +
                        '">' +
                        'Discover this location →' +
                        '</a>';

                }


                if (
                    stop.locations.length > 1
                ) {

                    content += '</div>';

                }

            }


            content += '</div>';


            card.innerHTML = content;

            list.appendChild(card);


            /* =================================================
               COLLEGAMENTO ALLA TAPPA SUCCESSIVA
               ================================================= */

            if (
                i < stops.length - 1
            ) {

                var nextStop =
                    stops[i + 1];


                var routes;


                if (
                    currentNarrative ===
                    'historical'
                ) {

                    routes =
                        historicalRoutes;

                }

                else {

                    routes =
                        womenRoutes;

                }


                var route =
                    routes.find(
                        function (route) {

                            return (
                                route.fromOrder ===
                                    stop.order &&
                                route.toOrder ===
                                    nextStop.order
                            );

                        }
                    );


                if (route) {

                    var routeBox =
                        document.createElement(
                            'div'
                        );


                    routeBox.className =
                        'route-connection';


                    var routeContent = '';


                    routeContent +=
                        '<div class="route-main-info">';


                    routeContent +=
                        '↓ &nbsp;' +
                        route.transport +
                        ' · ' +
                        route.time;


                    if (route.distance) {

                        routeContent +=
                            ' · ' +
                            route.distance;

                    }


                    routeContent += '</div>';


                    var nextNames =
                        nextStop.locations
                            .map(
                                function (location) {

                                    return location.name;

                                }
                            )
                            .join(' + ');


                    routeContent +=
                        '<p class="route-directions">' +

                        '<strong>Next stop: ' +
                        nextNames +
                        '</strong><br>' +

                        route.directions +

                        '</p>';


                    routeBox.innerHTML =
                        routeContent;


                    list.appendChild(
                        routeBox
                    );

                }

            }

        }

    }


    /* ========================================================
       FILTRI
       ======================================================== */

    function setActiveFilter(activeButton) {

        document.querySelectorAll('#filters button')
            .forEach(function (button) {
                button.classList.remove('active');
            });

        activeButton.classList.add('active');
    }

    var historicalButton =
        document.getElementById(
            'show-historical'
        );


    if (historicalButton) {

        historicalButton.addEventListener(
            'click',
            function () {

                currentNarrative = 'historical';
                    setActiveFilter(this);
                    updateMap();
            }
        );

    }


    var womenButton =
        document.getElementById(
            'show-women'
        );


    if (womenButton) {

        womenButton.addEventListener(
            'click',
            function () {

                currentNarrative = 'women';
                setActiveFilter(this);
                updateMap();
            }
        );

    }


    var allButton =
        document.getElementById(
            'show-all'
        );


    if (allButton) {

        allButton.addEventListener(
            'click',
            function () {

                currentNarrative = 'all';
                setActiveFilter(this);
                updateMap();

            }
        );

    }


    /* ========================================================
       CARICAMENTO DATI MAPPA (GeoJSON) E SPOSTAMENTI DA JSON
       ======================================================== */

    Promise.all([
        fetch('json/mappa.geojson').then(function (response) {
            if (!response.ok) {
                throw new Error('Impossibile caricare json/mappa.geojson: ' + response.statusText);
            }
            return response.json();
        }),
        fetch('json/spostamenti.json').then(function (response) {
            if (!response.ok) {
                throw new Error('Impossibile caricare json/spostamenti.json: ' + response.statusText);
            }
            return response.json();
        })
    ])
    .then(function (results) {
        var geojsonData = results[0];
        var spostamentiData = results[1];

        // 1. Estrae le location dalle feature GeoJSON RFC 7946
        if (geojsonData.type === 'FeatureCollection' && Array.isArray(geojsonData.features)) {
            locations = geojsonData.features.map(function (f) {
                var loc = Object.assign({}, f.properties);
                // Coordinate GeoJSON: [longitudine, latitudine]
                loc.lng = f.geometry.coordinates[0];
                loc.lat = f.geometry.coordinates[1];
                return loc;
            });
        } else if (Array.isArray(geojsonData)) {
            locations = geojsonData;
        }

        // 2. Assegna i percorsi di spostamento
        historicalRoutes = spostamentiData.historicalRoutes || [];
        womenRoutes = spostamentiData.womenRoutes || [];

        setupMarkers();
        updateMap();
    })
    .catch(function (error) {
        console.error('Errore nel caricamento dei dati della mappa o degli spostamenti:', error);
    });

}


/* ============================================================
   AVVIO
   ============================================================ */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            initStoryPage();
            initMapPage();

        }
    );

}

else {

    initStoryPage();
    initMapPage();

}