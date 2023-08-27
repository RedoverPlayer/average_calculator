// Init the settings inputs from storage
function initSettings() {
    chrome.storage.sync.get('siteUrl').then(data => (document.getElementById('siteUrl').value = data.siteUrl));

    chrome.storage.sync.get('theme').then(data => (document.getElementById(data.theme).checked = true));

    // Display categories
    updateCheck('displayRessources');
    updateCheck('displaySaes');
    updateCheck('displayUes');

    // Padding and gap
    chrome.storage.sync.get('ressourcePadding').then(data => { document.getElementById('ressourcePaddingRange').value = data.ressourcePadding });
    chrome.storage.sync.get('evalPadding').then(data => { document.getElementById('evalPaddingRange').value = data.evalPadding });
    chrome.storage.sync.get('ressourceGap').then(data => { document.getElementById('ressourceGapRange').value = data.ressourceGap });

    // Default developped categories
    updateCheck('ressourcesDevelopped');
    updateCheck('saesDevelopped');
    updateCheck('uesDevelopped');
    updateCheck('uesRessourcesDevelopped');
}

function updateCheck(key) {
    chrome.storage.sync.get(key).then(data => (document.getElementById(key).checked = data[key]));
}

// Setup the event listeners for the settings inputs
function initListeners() {
    // Site URL
    document.getElementById('siteUrl').onchange = event => {
        chrome.storage.sync.set({ 'siteUrl': event.target.value });
    };

    // Theme
    document.getElementById('dark').onchange = () => {
        chrome.storage.sync.set({ theme: 'dark' });
        location.reload();
    };
    document.getElementById('light').onchange = () => {
        chrome.storage.sync.set({ theme: 'light' });
        location.reload();
    };

    // Display categories
    checkUpdateListener('displayRessources');
    checkUpdateListener('displaySaes');
    checkUpdateListener('displayUes');

    // Padding and gap
    document.getElementById('ressourcePaddingRange').onchange = event => {
        chrome.storage.sync.set({ ressourcePadding: event.target.value });
        document.querySelectorAll('button#ressourcePaddingExample').forEach(element => {
            element.className = `list-group-item bg-success d-flex justify-content-between text-light pt-${event.target.value} pb-${event.target.value}`
        })
    };
    document.getElementById('evalPaddingRange').onchange = event => {
        chrome.storage.sync.set({ evalPadding: event.target.value });
        document.querySelectorAll('li#evalPaddingExample').forEach(element => {
            element.className = `list-group-item d-flex gap-5 pt-${event.target.value} pb-${event.target.value} pl-2 pr-2`
        });
    };
    document.getElementById('ressourceGapRange').onchange = event => {
        chrome.storage.sync.set({ ressourceGap: event.target.value });
        document.querySelector('div#ressourceExample').className = `d-flex flex-column gap-${event.target.value}`
    };

    // Default developped categories
    checkUpdateListener('ressourcesDevelopped');
    checkUpdateListener('saesDevelopped');
    checkUpdateListener('uesDevelopped');
    checkUpdateListener('uesRessourcesDevelopped');

    // Data request
    document.getElementById('dataRequestButton').onclick = fillSemesterSelect;
}

function fillSemesterSelect() {
    document.getElementById('dataRequestButton').innerHTML = 'Chargement des données...';

    if (siteUrl !== undefined) {
        fetch(`https://${siteUrl}/services/data.php?q=dataPremièreConnexion`)
            .then(response => response.json())
            .then(data => {
                if (data.redirect) {
                    alert('Merci de vous connecter pour pouvoir récupérer les données.');
                    document.getElementById('dataRequestButton').innerHTML = 'Merci de vous connecter pour pouvoir récupérer les données.';
                    return;
                }

                document.getElementById('semesterSelection').innerHTML = '';
                document.getElementById('dataRequestButton').innerHTML = 'Données récupérées';
                document.getElementById('dataRequestButton').className = 'btn btn-success mt-2';
                document.getElementById('semesterSelectionButton').disabled = false;

                for (const semester of data.semestres) {
                    const button = document.createElement('button');
                    button.className = 'dropdown-item';
                    button.value = semester.formsemestre_id;
                    button.innerText = `${semester.titre} - ${semester.annee_scolaire} - Semestre ${semester.semestre_id}`;
                    button.onclick = semesterSelected;
                    document.getElementById('semesterSelection').appendChild(button);
                }
            });
    }
}

function semesterSelected(event) {
    document.getElementById('semesterSelectionButton').innerText = event.target.innerText;

    document.getElementById('semestersLoading').style.display = 'block';
    if (siteUrl !== undefined) {
        fetch(`https://${siteUrl}/services/data.php?q=relevéEtudiant&semestre=${event.target.value}`)
            .then(response => response.json())
            .then(data => {
                if (data.redirect) {
                    alert('Merci de vous connecter pour pouvoir récupérer les données.');
                    document.getElementById('dataRequestButton').innerHTML = 'Merci de vous connecter pour pouvoir récupérer les données.';
                    return;
                }
                document.getElementById('semestersLoading').style.display = 'none';

                // Load current semester data
                const semesterID = `semesterUEs${event.target.value}`;
                chrome.storage.sync.get(semesterID).then(result => {
                    let ues = result[semesterID] ?? {};

                    addRessources(data['relevé']['ressources'], ues);
                    addRessources(data['relevé']['saes'], ues);

                    const obj = {};
                    obj[semesterID] = ues;
                    chrome.storage.sync.set(obj);

                    buildRessourcesWeightSelector(ues, event.target.value);
                });
            });
    }
}

function buildRessourcesWeightSelector(ues, currentSemester) {
    const uesCoefsDiv = document.getElementById('uesCoefs');
    uesCoefsDiv.innerHTML = '';
    uesCoefsDiv.className = 'mt-2';

    for (const key of Object.keys(ues).sort()) {
        const ueData = ues[key];

        const ueDiv = document.createElement('ul');
        ueDiv.className = 'list-group mt-2';

        const ueName = document.createElement('li');
        ueName.className = 'list-group-item bg-primary';
        ueName.innerText = ueData.name;

        ueDiv.appendChild(ueName);

        for (const key of Object.keys(ueData.ressources).sort()) {
            const ressourceData = ueData.ressources[key];

            const ressourceDiv = document.createElement('li');
            ressourceDiv.className = 'list-group-item d-flex justify-content-between align-items-center pt-0 pb-0 pe-0';

            const ressourceName = document.createElement('div');
            ressourceName.innerText = `${ressourceData.name} - ${ressourceData.titre}`;
            ressourceDiv.appendChild(ressourceName);

            // Input group
            const ressourceWeight = document.createElement('div');
            ressourceWeight.className = 'input-group';
            ressourceWeight.style.width = '9rem';

            const ressourceWeightLabel = document.createElement('span');
            ressourceWeightLabel.className = 'input-group-text';
            ressourceWeightLabel.innerText = 'Coef';
            ressourceWeight.id = `${ueData.name}-${ressourceData.name}`;
            ressourceWeight.appendChild(ressourceWeightLabel);

            const ressourceWeightInput = document.createElement('input');
            ressourceWeightInput.type = 'number';
            ressourceWeightInput.className = 'form-control';
            ressourceWeightInput.min = 0;
            ressourceWeightInput.value = ues[ueData.name].ressources[ressourceData.name].weight;
            ressourceWeightInput.setAttribute('aria-label', 'Coef');
            ressourceWeightInput.setAttribute('aria-describedby', `${ueData.name}-${ressourceData.name}`);
            ressourceWeightInput.onchange = event => {
                ressourceWeightChange(event, ues, ueData.name, ressourceData.name, currentSemester);
            };
            ressourceWeight.appendChild(ressourceWeightInput);

            ressourceDiv.appendChild(ressourceWeight);

            ueDiv.appendChild(ressourceDiv);
        }

        uesCoefsDiv.appendChild(ueDiv);
    }
}

function ressourceWeightChange(event, ues, ue, ressource, currentSemester) {
    ues[ue].ressources[ressource].weight = parseFloat(event.target.value);

    const obj = {};
    obj[`semesterUEs${currentSemester}`] = ues;
    chrome.storage.sync.set(obj);
}

function checkUpdateListener(key) {
    document.getElementById(key).onchange = function () {
        const data = {};
        data[key] = this.checked;
        chrome.storage.sync.set(data);
    };
}

// Init other things
function initSite() {
    // Theme
    chrome.storage.sync.get('theme').then(data => document.body.setAttribute('data-bs-theme', data.theme));

    // Padding and gap
    chrome.storage.sync.get('ressourcePadding').then(data => {
        document.querySelector('button#ressourcePaddingExample').className = `list-group-item bg-success d-flex justify-content-between text-light pt-${data.ressourcePadding} pb-${data.ressourcePadding}`
    });

    chrome.storage.sync.get('evalPadding').then(data => {
        document.querySelectorAll('li#evalPaddingExample').forEach(element => {
            element.className = `list-group-item d-flex gap-5 pt-${data.evalPadding} pb-${data.evalPadding} pl-2 pr-2`
        });
    });

    chrome.storage.sync.get('ressourceGap').then(data => {
        document.querySelector('div#ressourceExample').className = `d-flex flex-column gap-${data.ressourceGap}`
    });
}

let siteUrl;
initLocalStorage().then(() => {
    initSettings();
    initListeners();
    initSite();

    // Site url
    chrome.storage.sync.get('siteUrl').then(data => (siteUrl = data.siteUrl));
});
