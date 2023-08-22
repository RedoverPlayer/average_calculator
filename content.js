// ---- Semesters ----
function displaySemester(data, semestres) {
    data = data["relev\u00e9"];
    buildSemesterMenu(data.formsemestre_id, semestres);
    displaySemesterInfo(data);
    chrome.storage.sync.get('displayRessources').then(function (result) {
        if (result.displayRessources) {
            document.getElementById("ressources-container").style.display = "block";
            displayRessources(data.ressources); // Display the Ressources
        } else {
            document.getElementById("ressources-container").style.display = "none";
        }
    });
    chrome.storage.sync.get('displaySaes').then(function (result) {
        if (result.displaySaes) {
            document.getElementById("saes-container").style.display = "block";
            displayRessources(data.saes, true); // Display the SAEs (Situations d'Apprentissage et d'Evaluation)
        } else {
            document.getElementById("saes-container").style.display = "none";
        }
    });
    chrome.storage.sync.get('displayUes').then(function (result) {
        if (result.displayUes) {
            document.getElementById("ues-container").style.display = "block";
            displayUEs(data.ressources, data.saes); // Display the UEs (Unités d'Enseignement)
        } else {
            document.getElementById("ues-container").style.display = "none";
        }
    });
    loaded();
}

// Display the semester's info (average, rank, ECTS, etc.)
function displaySemesterInfo(data) {
    document.getElementById("semester_title").innerText = `Semestre ${data.semestre.numero} - ${data.semestre.groupes[0].group_name}`
    document.getElementById("average").innerText = `${data.semestre.notes.value}`;
    document.getElementById("minPromo").innerHTML = `<span class="badge bg-danger">Min</span> ${data.semestre.notes.min}`;
    document.getElementById("moyPromo").innerHTML = `<span class="badge bg-secondary">Moy</span> ${data.semestre.notes.moy}`;
    document.getElementById("maxPromo").innerHTML = `<span class="badge bg-success">Max</span> ${data.semestre.notes.max}`;
    document.getElementById("rank").innerText = `${data.semestre.rang.value}/${data.semestre.rang.total}`;
    document.getElementById("ects").innerText = `${data.semestre["ECTS"].acquis}/${data.semestre["ECTS"].total}`;
}

// ---- Ressources & SAEs ----
function displayRessources(ressources, isSAE = false) {
    let ressourcesDiv = document.getElementById("ressources");
    let saesDiv = document.getElementById("saes");

    if (!isSAE) { ressourcesDiv.innerHTML = "" } else { saesDiv.innerHTML = "" }

    for (let ressource of Object.entries(ressources)) {
        let ressourceUl = document.createElement("ul");
        ressourceUl.className = "list-group";

        // Ressource title
        let ressourceLi = document.createElement("button");
        ressourceLi.className = "list-group-item bg-success d-flex justify-content-between text-light";
        ressourceLi.onclick = (event) => { toggleEvals(event) };

        let ressourceTitle = document.createElement("div");
        ressourceTitle.innerText = `${ressource[0]} - ${ressource[1].titre}`
        ressourceLi.appendChild(ressourceTitle);

        let ressourceAverage = document.createElement("div");

        // add to DOM
        ressourceLi.appendChild(ressourceAverage);
        ressourceUl.appendChild(ressourceLi);

        displayEvals(ressource[1].evaluations, ressourceAverage, ressourceUl, ressourceLi, isSAE);

        // Add ressource to DOM
        if (!isSAE) { ressourcesDiv.appendChild(ressourceUl) } else { saesDiv.appendChild(ressourceUl) }
    }
}

function displayEvals(evals, ressourceAverage, ressourceUl, ressourceLi, isSAE) {
    let total = 0;
    let coefTotal = 0;

    for (let eval of evals) {
        // Add eval to ressource average
        if (!isNaN(parseFloat(eval.note.value)) && !isNaN(parseFloat(eval.coef))) {
            total += parseFloat(eval.note.value) * parseFloat(eval.coef);
            coefTotal += parseFloat(eval.coef);
        }

        // Create eval elem
        let evalLi = document.createElement("li");
        evalLi.className = "list-group-item d-flex gap-5 pt-1 pb-1 pl-2 pr-2";
        evalLi.title = `Min. ${eval.note.min}, Max ${eval.note.max}`;

        // Eval title
        let evalTitle = document.createElement("div");
        evalTitle.innerText = eval.description;
        evalLi.appendChild(evalTitle);

        // Eval note
        let evalNote = document.createElement("div");
        evalNote.innerText = eval.note.value;
        // Display badges indicating if the note is the max or min of the promo
        if (eval.note.value == eval.note.max) {
            evalNote.innerHTML = `<span class="badge bg-success">Max</span> ${eval.note.value}`;
        } else if (eval.note.value == eval.note.min) {
            evalNote.innerHTML = `<span class="badge bg-danger">Min</span> ${eval.note.value}`;
        }
        evalNote.style.marginLeft = "auto";
        evalNote.style.minWidth = "2.4rem";
        evalNote.className = "d-flex align-items-center gap-2";
        evalLi.appendChild(evalNote);

        // Eval moy
        let evalMoy = document.createElement("div");
        evalMoy.innerText = `Moy. ${eval.note.moy}`;
        evalMoy.className = "text-secondary d-flex align-items-center";
        evalMoy.style.minWidth = "4.9rem";
        evalLi.appendChild(evalMoy);

        // Eval coef
        let evalCoef = document.createElement("div");
        evalCoef.innerText = `Coef. ${eval.coef}`;
        evalCoef.className = "text-secondary d-flex align-items-center";
        evalCoef.style.minWidth = "5rem";
        evalLi.appendChild(evalCoef);

        // Default collapse
        if (!isSAE) {
            chrome.storage.sync.get('ressourcesDevelopped').then(function (result) {
                if (!result.ressourcesDevelopped) {
                    evalLi.style.setProperty('display', 'none', 'important');
                }
            }); 
        } else {
            chrome.storage.sync.get('saesDevelopped').then(function (result) {
                if (!result.saesDevelopped) {
                    evalLi.style.setProperty('display', 'none', 'important');
                }
            });
        }

        ressourceUl.appendChild(evalLi);
    }

    let average = (total / coefTotal).toFixed(2);
    ressourceAverage.innerText = `${average}`;

    // Set ressource color depending on average. Orange between 8 and 10, red under 8
    // The colors have been picked to be as readable as possible but if you have suggestions, feel free to open an issue
    if (average < 8) {
        ressourceLi.style.setProperty('background-color', '#b40000', 'important');
    } else if (average < 10) {
        ressourceLi.style.setProperty('background-color', '#b67500', 'important');
    }
}

function toggleEvals(event) {
    let target = event.target;
    if (event.target.nodeName == "DIV") target = event.target.parentNode;

    for (let child of target.parentNode.childNodes) {
        if (child.nodeName == "LI" && child.style.display != "none") {
            child.style.setProperty('display', 'none', 'important');
        } else {
            child.style.setProperty('display', 'flex', 'important');
        }
    }
}

// ---- UEs ----
function displayUEs(ressources, saes) {
    let uesDisplay = {};

    addToUEs(Object.entries(ressources), uesDisplay);
    addToUEs(Object.entries(saes), uesDisplay);

    calculateUEsAverages(uesDisplay);
}

function addToUEs(ressources, uesDisplay) {
    for (let ressource of ressources) {
        let ressourceName = ressource[0];
        let ressourceData = ressource[1];

        for (let eval of ressourceData.evaluations) {
            for (let ueWeight of Object.entries(eval.poids)) {
                let ueName = ueWeight[0];
                let ueCoef = ueWeight[1];

                if (ueCoef > 0) {
                    if (!(ueName in uesDisplay)) uesDisplay[ueName] = { ressources: {}, saes: {} };
                    if (!(ressourceName in uesDisplay[ueName].ressources)) uesDisplay[ueName].ressources[ressourceName] = { id: ressourceName, titre: ressourceData.titre, evaluations: [], average: null };

                    uesDisplay[ueName].ressources[ressourceName].evaluations.push({ description: eval.description, note: eval.note, UECoef: ueWeight[1], ressourceCoef: eval.coef, coef: (eval.coef * ueWeight[1]).toFixed(2) });
                }
            }
        }
    }
}

function calculateUEsAverages(uesDisplay) {
    for (let ue of Object.entries(uesDisplay)) {
        let ueData = ue[1];

        let UEnotes = 0;
        let UEcoefs = 0;

        for (let ressources of Object.entries(ueData.ressources)) {
            let ressourceData = ressources[1];

            let notes = 0;
            let coefs = 0;

            for (let evaluation of ressourceData.evaluations) {
                notes += evaluation.note.value * evaluation.ressourceCoef * evaluation.UECoef;
                coefs += evaluation.ressourceCoef * evaluation.UECoef;
            }

            let average = (notes / coefs).toFixed(2);
            ressourceData.average = average;

            const ressourceWeight = currentSemesterUEs[ue[0]].ressources[ressources[0]].weight;
            UEnotes += average * ressourceWeight
            UEcoefs += ressourceWeight;
        }

        let average = (UEnotes / UEcoefs).toFixed(2);
        ueData.average = average;
    }

    showUEs(uesDisplay);
}

function showUEs(uesDisplay) {
    let uesDiv = document.getElementById("ues");
    uesDiv.innerHTML = "";

    // Accordion main div
    const ueAccordion = document.createElement("div");
    ueAccordion.className = "accordion";
    ueAccordion.id = `uesAccordion`;

    // Display a warning prompting the user to set the UEs' ressources' coefs if they haven't been set yet
    let uesRessourcesCoefs = localStorage.getItem("uesRessourcesCoefs");

    if (uesRessourcesCoefs == null || localStorage.getItem("currentSemester") in Object.keys(JSON.parse(uesRessourcesCoefs))) {
        let warning = document.createElement("div");
        warning.className = "alert alert-warning alert-dismissible fade show";
        warning.role = "alert";
        warning.innerHTML = `Les coefficients des ressources n'ont pas été définis pour ce semestre, veuillez les saisir dans les paramètres (paramètres > coefs UEs) pour pouvoir calculer les moyennes des UEs.<br><br>`

        let settingsButton = document.createElement("button");
        settingsButton.className = "btn btn-primary";
        settingsButton.innerText = "Paramètres";
        settingsButton.onclick = () => { chrome.runtime.sendMessage({ redirect: "settings.html" }, function (response) { }); };
        warning.appendChild(settingsButton);
        uesDiv.appendChild(warning);
    }

    const sortedKeys = Object.keys(uesDisplay).sort();

    for (const key of sortedKeys) {
        let ueName = key;
        let ueData = uesDisplay[key];

        // Accordion item
        const ueDiv = document.createElement("div");
        ueDiv.className = "accordion-item";
        ueAccordion.appendChild(ueDiv);

        // Accordion header
        const ueHeader = document.createElement("h2");
        ueHeader.className = "accordion-header";
        ueHeader.id = `ueHeader-${ueName}`;
        ueDiv.appendChild(ueHeader);

        // Accordion button
        const ueButton = document.createElement("button");
        ueButton.className = "accordion-button collapsed";
        ueButton.type = "button";
        ueButton.setAttribute("data-bs-toggle", "collapse");
        ueButton.setAttribute("data-bs-target", `#ueCollapse-${ueName}`);
        ueButton.setAttribute("aria-expanded", "false");
        ueButton.setAttribute("aria-controls", `ueCollapse-${ueName}`);

        ueContainer = document.createElement("div");
        ueContainer.style.width = "100%";
        ueContainer.className = "d-flex justify-content-between align-items-center me-2";
        ueButton.appendChild(ueContainer);

        ueTitle = document.createElement("div");
        ueTitle.innerText = ueName;
        ueContainer.appendChild(ueTitle);

        ueAverage = document.createElement("div");
        ueAverage.innerText = ueData.average;
        ueAverage.style.marginLeft = "auto";
        ueContainer.appendChild(ueAverage);

        ueHeader.appendChild(ueButton);

        // Accordion collapse
        const ueCollapse = document.createElement("div");
        ueCollapse.id = `ueCollapse-${ueName}`;
        ueCollapse.className = "accordion-collapse collapse";
        ueCollapse.setAttribute("aria-labelledby", `ueHeader-${ueName}`);
        ueDiv.appendChild(ueCollapse);

        chrome.storage.sync.get('uesDevelopped').then((result) => {
            if (result.uesDevelopped) {
                ueButton.className = "accordion-button";
                ueButton.setAttribute("aria-expanded", "true");
                ueCollapse.className = "accordion-collapse collapse show";
            }
        });

        // Accordion body
        const ueBody = document.createElement("div");
        ueBody.className = "accordion-body";
        ueCollapse.appendChild(ueBody);

        // Ressources
        const ressourcesDiv = document.createElement("div");
        ressourcesDiv.className = "d-flex flex-column gap-2";
        ueBody.appendChild(ressourcesDiv);

        for (let ressource of Object.entries(ueData.ressources)) {
            let ressourceName = ressource[0];
            let ressourceData = ressource[1];

            let ressourceUl = document.createElement("ul");
            ressourceUl.className = "list-group";

            // Ressource title
            let ressourceLi = document.createElement("button");
            ressourceLi.className = "list-group-item bg-success d-flex justify-content-between text-light";
            ressourceLi.onclick = (event) => { toggleEvals(event) };

            let ressourceTitle = document.createElement("div");
            ressourceTitle.innerText = `${ressource[0]} - ${ressource[1].titre}`
            ressourceLi.appendChild(ressourceTitle);

            // Ressource infos
            let ressourceInfos = document.createElement("div");
            ressourceInfos.className = "d-flex gap-4";

            let ressourceCoef = document.createElement("div");
            ressourceCoef.innerText = `Coef. ${currentSemesterUEs[ueName].ressources[ressourceName].weight}`;
            ressourceInfos.appendChild(ressourceCoef);

            let ressourceAverage = document.createElement("div");
            ressourceAverage.innerText = `${ressourceData.average}`;
            ressourceInfos.appendChild(ressourceAverage);

            // Set ressource color depending on average. Orange between 8 and 10, red under 8
            // The colors have been picked to be as readable as possible but if you have suggestions, feel free to open an issue
            if (ressourceData.average < 8) {
                ressourceLi.style.setProperty('background-color', '#b40000', 'important');
            } else if (ressourceData.average < 10) {
                ressourceLi.style.setProperty('background-color', '#b67500', 'important');
            }

            // add to DOM
            ressourceLi.appendChild(ressourceInfos);
            ressourceUl.appendChild(ressourceLi);
            ressourcesDiv.appendChild(ressourceUl);

            displayUEEvals(ressourceData.evaluations, ressourceUl, ressourceLi, `${ueName.replace(".", "")}-${ressourceName.replace(".", "")}`);
        }

    }

    uesDiv.appendChild(ueAccordion);
}

function displayUEEvals(evals, ressourceUl, ressourceLi, id) {
    let total = 0;
    let coefTotal = 0;

    for (let eval of evals) {
        // Add eval to ressource average
        if (!isNaN(parseFloat(eval.note.value)) && !isNaN(parseFloat(eval.coef))) {
            total += parseFloat(eval.note.value) * parseFloat(eval.coef);
            coefTotal += parseFloat(eval.coef);
        }

        // Create eval elem
        let evalLi = document.createElement("li");
        evalLi.className = "list-group-item d-flex gap-5 pt-1 pb-1 pl-2 pr-2";
        evalLi.title = `Min. ${eval.note.min}, Max ${eval.note.max}`;
        evalLi.id = id;

        // Eval title
        let evalTitle = document.createElement("div");
        evalTitle.innerText = eval.description;
        evalLi.appendChild(evalTitle);

        // Eval note
        let evalNote = document.createElement("div");
        evalNote.innerText = eval.note.value;
        // Display badges indicating if the note is the max or min of the promo
        if (eval.note.value == eval.note.max) {
            evalNote.innerHTML = `<span class="badge bg-success">Max</span> ${eval.note.value}`;
        } else if (eval.note.value == eval.note.min) {
            evalNote.innerHTML = `<span class="badge bg-danger">Min</span> ${eval.note.value}`;
        }
        evalNote.style.marginLeft = "auto";
        evalNote.style.minWidth = "2.4rem";
        evalNote.className = "d-flex align-items-center gap-2";
        evalLi.appendChild(evalNote);

        // Eval moy
        let evalMoy = document.createElement("div");
        evalMoy.innerText = `Moy. ${eval.note.moy}`;
        evalMoy.className = "text-secondary d-flex align-items-center";
        evalMoy.style.minWidth = "4.9rem";
        evalLi.appendChild(evalMoy);

        // Eval coef
        let evalCoef = document.createElement("div");
        evalCoef.innerText = `Coef. ${eval.coef}`;
        evalCoef.className = "text-secondary d-flex align-items-center";
        evalCoef.style.minWidth = "5rem";
        evalLi.appendChild(evalCoef);

        chrome.storage.sync.get('uesRessourcesDevelopped').then(function (result) {
            if (!result.uesRessourcesDevelopped) {
                evalLi.style.setProperty('display', 'none', 'important');
            }
        });

        ressourceUl.appendChild(evalLi);
    }
}

// ---- Initial data and other things ----
function fetchSemester(event, semestres) {
    loading();
    let id = event.target.id == "" ? event.target.parentElement.id : event.target.id;
    localStorage.setItem("currentSemester", id);
    fetch(`https://${siteUrl}/services/data.php?q=relev%C3%A9Etudiant&semestre=${id}`).then(response => response.text()).then(data => JSON.parse(data)).then(data => displaySemester(data, semestres));

    // Retrieve UEs Coefs
    chrome.storage.sync.get(`semesterUEs${id}`).then((data) => {
        currentSemesterUEs = data[`semesterUEs${id}`];
    });
}

// Display the list of semesters, which are clickable to fetch the data for a given semester
function buildSemesterMenu(semesterID, semestres) {
    document.querySelector("div.semestres").innerHTML = "";

    for (let semestre of semestres) {
        let option = document.createElement("button");
        option.className = semestre.formsemestre_id == semesterID ? "btn btn-primary" : "btn btn-secondary";
        option.type = "button";
        option.innerHTML = `<div class="fs-4">Semestre ${semestre.semestre_id}</div><div>${semestre.annee_scolaire} - ${semestre.titre}</div>`;
        option.id = semestre.formsemestre_id
        option.onclick = (event) => {
            fetchSemester(event, semestres);
        }

        document.querySelector("div.semestres").appendChild(option);
    }
}

// Triggers the loading animation
function loading() {
    document.querySelector("div#loading").className = "spinner-grow"
}

// Stops the loading animation
function loaded() {
    document.querySelector("div#loading").className = "d-none"
}

function firstData(data) {
    // If the user is not logged in, redirect to the CAS login page
    if ("redirect" in data) {
        window.location.href = window.location.href + data.redirect + "?href=" + encodeURIComponent(window.location.href);
    }

    document.querySelector("div.semestres").innerHTML = "";
    data.semestres.sort((a, b) => a.semestre_id - b.semestre_id); // Sort semesters by ID (number)

    // Fetch the most recent semester (as it's probably the one the user wants to see the most)
    fetchSemester({ target: { id: data.semestres[data.semestres.length - 1].formsemestre_id } }, data.semestres);
}

// Get site url
let siteUrl = ""
let currentSemesterUEs = {}
chrome.storage.sync.get('siteUrl').then(function (data) {
    siteUrl = data.siteUrl;

    // If the user is not on the site, don't do anything. The extension will load on all site but only activate on the one specified in the settings.
    // This is done to enable the user to change the url of the site in the settings. If the site was set in the manifest, it would be impossible to change it.
    if (document.location.host != siteUrl) {
        return;
    }

    // Replaces the original page with the extension's page
    document.open()
    document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${chrome.runtime.getURL("bootstrap/bootstrap.min.css")}" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous">
        <title>Notes</title>
    </head>
    <body data-bs-theme="dark" class="text-center">
        <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
            <div class="navbar-brand">Relevé de notes</div>
            <div id="loading" class="spinner-grow" role="status"></div>
            <div class="d-flex gap-2">
                <div id="settings_container"></div>
                <a class="btn btn-danger" href="https://${siteUrl}/logout.php">Déconnexion</a>
            </div>
        </div>
        </nav>

        <div class="semestres btn-group m-4" role="group"></div>

        <div class="card text-start m-auto" style="width: 90%; max-width: 60rem; min-width: 35rem;">
        <h2 id="semester_title" class="card-title text-center mt-2">Semestre - - ----</h2>    
            <div class="d-flex flex-column m-auto align-items-center" style="width: 250px;">
            <div class="fs-5 d-flex justify-content-between" style="width: 200px;"><div>Moyenne :</div><div id="average">--.--</div></div>
            <div class="fs-5 d-flex justify-content-between" style="width: 200px;"><div>Rang :</div><div id="rank">--/--</div></div>
            <div class="fs-5 d-flex justify-content-between" style="width: 200px;"><div>ECTS:</div><div id="ects">--/--</div></div>
            </div>
            
            <div class="d-flex gap-2 m-auto mb-2 mt-2">
            <div title="Minimum promo" id="minPromo"><span class="badge bg-danger">Min</span> --.--</div>
            <div title="Moyenne promo" id="moyPromo"><span class="badge bg-secondary">Moy</span> --.--</div>
            <div title="Maximum promo" id="maxPromo"><span class="badge bg-success">Max</span> --.--</div>
            </div>
        </div>

        <div id="ressources-container" class="card text-start m-auto mt-2 p-4" style="width: 90%; max-width: 60rem; min-width: 35rem;">
        <h2 class="text-center mb-2">Ressources</h2>
        <div id="ressources" class="d-flex flex-column gap-2">
        </div>
        </div>

        <div id="saes-container" class="card text-start m-auto mt-2 p-4" style="width: 90%; max-width: 60rem; min-width: 35rem;">
        <h2 class="text-center mb-2">SAÉs</h2>
        <div id="saes" class="d-flex flex-column gap-2">
        </div>
        </div>

        <div id="ues-container" class="card text-start m-auto mt-2 p-4" style="width: 90%; max-width: 60rem; min-width: 35rem;">
            <h2 class="text-center mb-2">UEs</h2>
            <div id="ues" class="d-flex flex-column gap-2">
            </div>
        </div>

        <footer class="p-4">
        <p>
            <i>Cette extension présente les notes universitaires à partir du site officiel de l'université avec <br>
            un nouveau design et un calcul des moyennes tout en maintenant les données d'origine. Néanmoins, <br>
            l'extension décline toute responsabilité en cas d'éventuels problèmes d'affichage ou de calcul des <br>
            moyennes. Vous pouvez vérifier le code source par vous-même via le lien présent ci-dessous.</i>
        </p>
        
        <a class="m-4" href="https://github.com/RedoverPlayer/average_calculator" target="_blank">https://github.com/RedoverPlayer/average_calculator</a>
        </footer>
    </body>
    </html>
    `)
    document.close()

    // Set theme
    chrome.storage.sync.get('theme').then(function (data) {
        document.body.setAttribute('data-bs-theme', data.theme);
    });

    // Add bootstrap script
    const bootstrapUrl = chrome.runtime.getURL("bootstrap/bootstrap.bundle.min.js");
    const script = document.createElement("script");
    script.src = bootstrapUrl;
    document.body.appendChild(script);

    // Add settings button
    let settingsButton = document.createElement("button");
    settingsButton.className = "btn btn-primary";
    settingsButton.innerText = "Paramètres";
    settingsButton.onclick = () => { chrome.runtime.sendMessage({ redirect: "settings.html" }, function (response) { }); };
    document.getElementById("settings_container").appendChild(settingsButton);

    // fetch the initial data, which contains the list of semesters (unlike fetchSemester)
    fetch(`https://${siteUrl}/services/data.php?q=dataPremi%C3%A8reConnexion`).then(response => response.json()).then(data => firstData(data));
});
