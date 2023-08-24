// ---- UEs ----
function displayUEs(ressources, saes, currentSemesterUEs) {
    const uesDisplay = {};

    addToUEs(Object.entries(ressources), uesDisplay);
    addToUEs(Object.entries(saes), uesDisplay);

    calculateUEsAverages(uesDisplay, currentSemesterUEs);
}

function addToUEs(ressources, uesDisplay) {
    for (const ressource of ressources) {
        const [ressourceName, ressourceData] = ressource;

        for (const eval of ressourceData.evaluations) {
            for (const ueWeight of Object.entries(eval.poids)) {
                const [ueName, ueCoef] = ueWeight;

                if (ueCoef > 0) {
                    if (!(ueName in uesDisplay)) {
                        uesDisplay[ueName] = {
                            ressources: {},
                            saes: {}
                        };
                    }
                    if (!(ressourceName in uesDisplay[ueName].ressources)) {
                        uesDisplay[ueName].ressources[ressourceName] = {
                            id: ressourceName,
                            titre: ressourceData.titre,
                            evaluations: [],
                            average: null
                        };
                    }

                    uesDisplay[ueName].ressources[ressourceName].evaluations.push({
                        description: eval.description,
                        note: eval.note,
                        UECoef: ueCoef,
                        ressourceCoef: eval.coef,
                        coef: (eval.coef * ueCoef).toFixed(2)
                    });
                }
            }
        }
    }
}

function calculateUEsAverages(uesDisplay, currentSemesterUEs) {
    if (currentSemesterUEs && scanUEdict(currentSemesterUEs)) {
        for (const ue of Object.entries(uesDisplay)) {
            const [ueName, ueData] = ue;

            let UEnotes = 0;
            let UEcoefs = 0;

            for (const ressources of Object.entries(ueData.ressources)) {
                const [ressourceName, ressourceData] = ressources;

                let notes = 0;
                let coefs = 0;

                for (const evaluation of ressourceData.evaluations) {
                    const { note, ressourceCoef, UECoef } = evaluation;
                    notes += note.value * ressourceCoef * UECoef;
                    coefs += ressourceCoef * UECoef;
                }

                const average = (notes / coefs).toFixed(2);
                ressourceData.average = average;

                const ressourceWeight = currentSemesterUEs[ueName].ressources[ressourceName].weight;
                UEnotes += average * ressourceWeight;
                UEcoefs += ressourceWeight;
            }

            const average = (UEnotes / UEcoefs).toFixed(2);
            ueData.average = average;
        }
    }

    showUEs(uesDisplay, currentSemesterUEs);
}

function scanUEdict(currentSemesterUEs) {
    for (const ue of Object.entries(currentSemesterUEs)) {
        const [ueName, ueData] = ue;

        for (const ressource of Object.entries(ueData.ressources)) {
            const [ressourceName, ressourceData] = ressource;

            if (ressourceData.weight === 0) {
                return false;
            }
        }
    }

    return true;
}

function showUEs(uesDisplay, currentSemesterUEs) {
    const uesDiv = document.getElementById('ues');
    uesDiv.innerHTML = '';

    // Accordion main div
    const ueAccordion = document.createElement('div');
    ueAccordion.className = 'accordion';
    ueAccordion.id = `uesAccordion`;

    // Display a warning prompting the user to set the UEs' ressources' coefs if they haven't been set yet
    if (!currentSemesterUEs || !scanUEdict(currentSemesterUEs)) {
        const warning = document.createElement('div');
        warning.className = 'alert alert-warning alert-dismissible fade show';
        warning.role = 'alert';
        warning.innerHTML = `Les coefficients des ressources n'ont pas été définis pour ce semestre, veuillez les saisir dans les paramètres (paramètres > coefs UEs) pour pouvoir calculer les moyennes des UEs.<br><br>`;

        const settingsButton = document.createElement('a');
        settingsButton.className = 'btn btn-primary';
        settingsButton.innerText = 'Paramètres';
        settingsButton.href = chrome.runtime.getURL('settings.html');

        warning.appendChild(settingsButton);
        uesDiv.appendChild(warning);

        return;
    }

    const sortedKeys = Object.keys(uesDisplay).sort();

    for (const ueName of sortedKeys) {
        let ueData = uesDisplay[ueName];

        // Accordion item
        const ueDiv = document.createElement('div');
        ueDiv.className = 'accordion-item';
        ueAccordion.appendChild(ueDiv);

        // Accordion header
        const ueHeader = document.createElement('h2');
        ueHeader.className = 'accordion-header';
        ueHeader.id = `ueHeader-${ueName}`;
        ueDiv.appendChild(ueHeader);

        // Accordion button
        const ueButton = document.createElement('button');
        ueButton.className = 'accordion-button collapsed';
        ueButton.type = 'button';
        ueButton.setAttribute('data-bs-toggle', 'collapse');
        ueButton.setAttribute('data-bs-target', `#ueCollapse-${ueName}`);
        ueButton.setAttribute('aria-expanded', 'false');
        ueButton.setAttribute('aria-controls', `ueCollapse-${ueName}`);

        const ueContainer = document.createElement('div');
        ueContainer.style.width = '100%';
        ueContainer.className = 'd-flex justify-content-between align-items-center me-2';
        ueButton.appendChild(ueContainer);

        const ueTitle = document.createElement('div');
        ueTitle.innerText = ueName;
        ueContainer.appendChild(ueTitle);

        ueAverage = document.createElement('div');
        ueAverage.innerText = ueData.average;
        ueAverage.style.marginLeft = 'auto';
        ueContainer.appendChild(ueAverage);

        ueHeader.appendChild(ueButton);

        // Accordion collapse
        const ueCollapse = document.createElement('div');
        ueCollapse.id = `ueCollapse-${ueName}`;
        ueCollapse.className = 'accordion-collapse collapse';
        ueCollapse.setAttribute('aria-labelledby', `ueHeader-${ueName}`);
        ueDiv.appendChild(ueCollapse);

        chrome.storage.sync.get('uesDevelopped').then(result => {
            if (result.uesDevelopped) {
                ueButton.className = 'accordion-button';
                ueButton.setAttribute('aria-expanded', 'true');
                ueCollapse.className = 'accordion-collapse collapse show';
            }
        });

        // Accordion body
        const ueBody = document.createElement('div');
        ueBody.className = 'accordion-body';
        ueCollapse.appendChild(ueBody);

        // Ressources
        const ressourcesDiv = document.createElement('div');
        ressourcesDiv.className = 'd-flex flex-column gap-2';
        ueBody.appendChild(ressourcesDiv);

        for (const ressource of Object.entries(ueData.ressources)) {
            const [ressourceName, ressourceData] = ressource;

            const ressourceUl = document.createElement('ul');
            ressourceUl.className = 'list-group';

            // Ressource title
            const ressourceLi = document.createElement('button');
            ressourceLi.className = 'list-group-item bg-success d-flex justify-content-between text-light';
            ressourceLi.onclick = toggleEvals;

            const ressourceTitle = document.createElement('div');
            ressourceTitle.innerText = `${ressource[0]} - ${ressource[1].titre}`;
            ressourceLi.appendChild(ressourceTitle);

            // Ressource infos
            const ressourceInfos = document.createElement('div');
            ressourceInfos.className = 'd-flex gap-4';

            const ressourceCoef = document.createElement('div');
            ressourceCoef.innerText = `Coef. ${currentSemesterUEs[ueName].ressources[ressourceName].weight}`;
            ressourceInfos.appendChild(ressourceCoef);

            const ressourceAverage = document.createElement('div');
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

            displayUEEvals(ressourceData.evaluations, ressourceUl, ressourceLi, `${ueName.replace('.', '')}-${ressourceName.replace('.', '')}`);
        }
    }

    uesDiv.appendChild(ueAccordion);
}

// ALMOST THE SAME AS displayEvals() from main\ressources.js
// MAYBE MERGE THEM ?
function displayUEEvals(evals, ressourceUl, ressourceLi, id) {
    let total = 0;
    let coefTotal = 0;

    for (const eval of evals) {
        // Add eval to ressource average
        const note = eval.note.value;
        const coef = eval.coef;

        const noteNum = parseFloat(note);
        const coefNum = parseFloat(coef);
        if (!isNaN(noteNum) && !isNaN(coefNum)) {
            total += noteNum * coefNum;
            coefTotal += coefNum;
        }

        // Create eval elem
        const evalLi = document.createElement('li');
        evalLi.className = 'list-group-item d-flex gap-5 pt-1 pb-1 pl-2 pr-2';
        evalLi.title = `Min. ${eval.note.min}, Max ${eval.note.max}`;
        evalLi.id = id;

        // Eval title
        const evalTitle = document.createElement('div');
        evalTitle.innerText = eval.description;
        evalLi.appendChild(evalTitle);

        // Eval note
        const evalNote = document.createElement('div');
        evalNote.style.marginLeft = 'auto';
        evalNote.style.minWidth = '2.4rem';
        evalNote.className = 'd-flex align-items-center gap-2';
        // Display badges indicating if the note is the max or min of the promo

        const maxBadge = `<span class="badge bg-success">Max</span> ${note}`;
        const minBadge = `<span class="badge bg-danger">Min</span> ${note}`;
        switch (note) {
            case eval.note.max:
                evalNote.innerHTML = maxBadge;
                break;

            case eval.note.min:
                evalNote.innerHTML = minBadge;
                break;

            default:
                evalNote.innerText = note;
        }

        evalLi.appendChild(evalNote);

        // Eval moy
        const evalMoy = document.createElement('div');
        evalMoy.innerText = `Moy. ${eval.note.moy}`;
        evalMoy.className = 'text-secondary d-flex align-items-center';
        evalMoy.style.minWidth = '4.9rem';
        evalLi.appendChild(evalMoy);

        // Eval coef
        const evalCoef = document.createElement('div');
        evalCoef.innerText = `Coef. ${eval.coef}`;
        evalCoef.className = 'text-secondary d-flex align-items-center';
        evalCoef.style.minWidth = '5rem';
        evalLi.appendChild(evalCoef);

        chrome.storage.sync.get('uesRessourcesDevelopped').then(result => {
            if (!result.uesRessourcesDevelopped) {
                evalLi.style.setProperty('display', 'none', 'important');
            }
        });

        ressourceUl.appendChild(evalLi);
    }
}
