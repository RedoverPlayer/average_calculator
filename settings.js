// Init the settings inputs from storage
function initSettings() {
    chrome.storage.sync.get('siteUrl').then(function (data) {
        document.getElementById('siteUrl').value = data.siteUrl;
    });

    chrome.storage.sync.get('theme').then(function (data) {
        document.getElementById(data.theme).checked = true;
    });

    // Display categories
    updateCheck('displayRessources');
    updateCheck('displaySaes');
    updateCheck('displayUes');

    // Default developped categories
    updateCheck('ressourcesDevelopped');
    updateCheck('saesDevelopped');
    updateCheck('uesDevelopped');
    updateCheck('uesRessourcesDevelopped');
}

function updateCheck(key) {
    chrome.storage.sync.get(key).then(function (data) {
        document.getElementById(key).checked = data[key];
    });
}

// Setup the event listeners for the settings inputs
function initListeners() {
    // Site URL
    document.getElementById('siteUrl').onchange = function () {
        chrome.storage.sync.set({ 'siteUrl': this.value });
    };

    // Theme
    document.getElementById('dark').onchange = function () { chrome.storage.sync.set({ 'theme': 'dark' }); location.reload(); }
    document.getElementById('light').onchange = function () { chrome.storage.sync.set({ 'theme': 'light' }); location.reload(); }

    // Display categories
    checkUpdateListener('displayRessources');
    checkUpdateListener('displaySaes');
    checkUpdateListener('displayUes');

    // Default developped categories
    checkUpdateListener('ressourcesDevelopped');
    checkUpdateListener('saesDevelopped');
    checkUpdateListener('uesDevelopped');
    checkUpdateListener('uesRessourcesDevelopped');

    // Data request
    document.getElementById('dataRequestButton').onclick = fillSemesterSelect;
}

function fillSemesterSelect() {
    document.getElementById('dataRequestButton').innerHTML = "Chargement des données...";

    if (siteUrl !== undefined) {
        fetch(`https://${siteUrl}/services/data.php?q=dataPremièreConnexion`).then(response => response.json()).then(data => {
            if (data.redirect) {
                alert("Merci de vous connecter pour pouvoir récupérer les données.");
                document.getElementById('dataRequestButton').innerHTML = "Merci de vous connecter pour pouvoir récupérer les données.";
                return;
            }

            document.getElementById('semesterSelection').innerHTML = "";
            document.getElementById('dataRequestButton').innerHTML = "Données récupérées";
            document.getElementById('dataRequestButton').className = "btn btn-success mt-2"
            document.getElementById('semesterSelectionButton').disabled = false;

            for (const semester of data.semestres) {
                const button = document.createElement('button');
                button.className = "dropdown-item"
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

    document.getElementById('semestersLoading').style.display = "block";
    if (siteUrl !== undefined) {
        fetch(`https://${siteUrl}/services/data.php?q=relevéEtudiant&semestre=${event.target.value}`).then(response => response.json()).then(data => {
            if (data.redirect) {
                alert("Merci de vous connecter pour pouvoir récupérer les données.");
                document.getElementById('dataRequestButton').innerHTML = "Merci de vous connecter pour pouvoir récupérer les données.";
                return;
            }
            document.getElementById('semestersLoading').style.display = "none";

            // Load current semester data
            const semesterID = `semesterUEs${event.target.value}`;
            chrome.storage.sync.get(semesterID).then((result) => {
                let ues = result[semesterID];
                if (ues === undefined) { ues = {}; }

                addRessources(data["relevé"]["ressources"], ues);
                addRessources(data["relevé"]["saes"], ues);
    
                let obj = {};
                obj[semesterID] = ues;
                chrome.storage.sync.set(obj);
                
                buildRessourcesWeightSelector(ues, event.target.value);
            });
        });
    }
}

function buildRessourcesWeightSelector(ues, currentSemester) {
    const uesCoefsDiv = document.getElementById('uesCoefs');
    uesCoefsDiv.innerHTML = "";
    uesCoefsDiv.className = "mt-2"

    for (const key of Object.keys(ues).sort()) {
        const ueData = ues[key]
        
        const ueDiv = document.createElement('ul')
        ueDiv.className = "list-group mt-2";

        const ueName = document.createElement('li');
        ueName.className = "list-group-item bg-primary";
        ueName.innerText = ueData.name;

        ueDiv.appendChild(ueName);
        
        for (const key of Object.keys(ueData.ressources).sort()) {
            const ressourceData = ueData.ressources[key];
            
            const ressourceDiv = document.createElement('li');
            ressourceDiv.className = "list-group-item d-flex justify-content-between align-items-center pt-0 pb-0 pe-0";
            
            let ressourceName = document.createElement('div');
            ressourceName.innerText = ressourceData.name + " - " + ressourceData.titre;
            ressourceDiv.appendChild(ressourceName);

            // Input group
            let ressourceWeight = document.createElement('div');
            ressourceWeight.className = "input-group";
            ressourceWeight.style.width = "9rem";

            let ressourceWeightLabel = document.createElement('span');
            ressourceWeightLabel.className = "input-group-text";
            ressourceWeightLabel.innerText = "Coef";
            ressourceWeight.id = `${ueData.name}-${ressourceData.name}`;
            ressourceWeight.appendChild(ressourceWeightLabel);

            let ressourceWeightInput = document.createElement('input');
            ressourceWeightInput.type = "number";
            ressourceWeightInput.className = "form-control";
            ressourceWeightInput.min = 0;
            ressourceWeightInput.value = ues[ueData.name].ressources[ressourceData.name].weight;
            ressourceWeightInput.setAttribute('aria-label', "Coef");
            ressourceWeightInput.setAttribute('aria-describedby', `${ueData.name}-${ressourceData.name}`);
            ressourceWeightInput.onchange = (event) => { ressourceWeightChange(event, ues, ueData.name, ressourceData.name, currentSemester) };
            ressourceWeight.appendChild(ressourceWeightInput);

            ressourceDiv.appendChild(ressourceWeight);

            ueDiv.appendChild(ressourceDiv);
        }

        uesCoefsDiv.appendChild(ueDiv);
    }
}

function ressourceWeightChange(event, ues, ue, ressource, currentSemester) {
    ues[ue].ressources[ressource].weight = parseFloat(event.target.value);

    let obj = {};
    obj[`semesterUEs${currentSemester}`] = ues;
    chrome.storage.sync.set(obj);
}

function checkUpdateListener(key) {
    document.getElementById(key).onchange = function () {
        let checked = this.checked;
        const data = {};
        data[key] = checked;
        chrome.storage.sync.set(data);
    }
}

// Init other things
function initSite() {
    // Theme
    chrome.storage.sync.get('theme').then(function (data) {
        document.body.setAttribute('data-bs-theme', data.theme);
    });
}

initLocalStorage();
setTimeout(initSettings, 100);
setTimeout(initListeners, 100);
setTimeout(initSite, 100);

// Site url
let siteUrl;
chrome.storage.sync.get('siteUrl').then((data) => {
    siteUrl = data.siteUrl;
});
