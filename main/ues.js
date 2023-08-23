// ---- UEs ----
function displayUEs(ressources, saes, currentSemesterUEs) {
    let uesDisplay = {};

    addToUEs(Object.entries(ressources), uesDisplay);
    addToUEs(Object.entries(saes), uesDisplay);

    calculateUEsAverages(uesDisplay, currentSemesterUEs);
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

function calculateUEsAverages(uesDisplay, currentSemesterUEs) {
    if (currentSemesterUEs !== undefined && scanUEdict(currentSemesterUEs)) {
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
    }

    showUEs(uesDisplay, currentSemesterUEs);
}

function scanUEdict(currentSemesterUEs) {
    for (let ue of Object.entries(currentSemesterUEs)) {
        let ueData = ue[1];

        for (let ressource of Object.entries(ueData.ressources)) {
            let ressourceData = ressource[1];

            if (ressourceData.weight == 0) {
                return false;
            }
        }
    }

    return true;
}

function showUEs(uesDisplay, currentSemesterUEs) {
    let uesDiv = document.getElementById("ues");
    uesDiv.innerHTML = "";

    // Accordion main div
    const ueAccordion = document.createElement("div");
    ueAccordion.className = "accordion";
    ueAccordion.id = `uesAccordion`;

    // Display a warning prompting the user to set the UEs' ressources' coefs if they haven't been set yet
    if (currentSemesterUEs == undefined || !scanUEdict(currentSemesterUEs)) {
        let warning = document.createElement("div");
        warning.className = "alert alert-warning alert-dismissible fade show";
        warning.role = "alert";
        warning.innerHTML = `Les coefficients des ressources n'ont pas été définis pour ce semestre, veuillez les saisir dans les paramètres (paramètres > coefs UEs) pour pouvoir calculer les moyennes des UEs.<br><br>`

        let settingsButton = document.createElement("a");
        settingsButton.className = "btn btn-primary";
        settingsButton.innerText = "Paramètres";
        settingsButton.href = chrome.runtime.getURL("settings.html");
        warning.appendChild(settingsButton);
        uesDiv.appendChild(warning);
        
        return;
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
