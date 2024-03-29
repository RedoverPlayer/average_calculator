// ---- Ressources & SAEs ----
async function displayRessources(ressources, isSAE = false) {
    const ressourcesDiv = document.getElementById('ressources');
    const saesDiv = document.getElementById('saes');

    if (isSAE) {
        saesDiv.innerHTML = '';
    } else {
        ressourcesDiv.innerHTML = '';
    }

    const { ressourcePadding } = await chrome.storage.sync.get('ressourcePadding');

    for (const ressource of Object.entries(ressources)) {
        const ressourceUl = document.createElement('ul');
        ressourceUl.className = 'list-group';

        // Ressource title
        const ressourceLi = document.createElement('button');
        ressourceLi.className = `list-group-item bg-success d-flex justify-content-between text-light pt-${ressourcePadding} pb-${ressourcePadding}`;
        ressourceLi.onclick = event => {
            toggleEvals(event);
        };

        const ressourceTitle = document.createElement('div');
        ressourceTitle.innerText = `${ressource[0]} - ${ressource[1].titre}`;
        ressourceLi.appendChild(ressourceTitle);

        const ressourceAverage = document.createElement('div');

        // add to DOM
        ressourceLi.appendChild(ressourceAverage);
        ressourceUl.appendChild(ressourceLi);

        displayEvals(ressource[1].evaluations, ressourceAverage, ressourceUl, ressourceLi, isSAE, ressource[0], ressource[1].titre);

        // Add ressource to DOM
        if (isSAE) {
            saesDiv.appendChild(ressourceUl);
        } else {
            ressourcesDiv.appendChild(ressourceUl);
        }
    }
}

async function displayEvals(evals, ressourceAverage, ressourceUl, ressourceLi, isSAE, ressourceCode, ressourceTitle) {
    let total = 0;
    let coefTotal = 0;

    const { evalPadding } = await chrome.storage.sync.get('evalPadding');

    for (const eval of evals) {
        // Add eval to ressource average
        const noteNum = parseFloat(eval.note.value);
        const coefNum = parseFloat(eval.coef);
        if (!isNaN(noteNum) && !isNaN(coefNum)) {
            total += noteNum * coefNum;
            coefTotal += coefNum;
        }

        // Create eval elem
        const evalLi = document.createElement('li');
        evalLi.className = `list-group-item d-flex gap-5 pt-${evalPadding} pb-${evalPadding} pl-2 pr-2`;
        evalLi.title = `Min. ${eval.note.min}, Max ${eval.note.max} - Cliquer pour voir plus`;

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
        if (eval.note.value >= eval.note.max && !["~", "EXC", "ABS", "ATT"].includes(eval.note.value)) {
            evalNote.innerHTML = `<span class="badge bg-success">Max</span> ${eval.note.value}`;
        } else if (eval.note.value <= eval.note.min && !["~", "EXC", "ABS", "ATT"].includes(eval.note.value)) {
            evalNote.innerHTML = `<span class="badge bg-danger">Min</span> ${eval.note.value}`;
        } else {
            evalNote.innerText = eval.note.value;
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

        // Default collapse
        const key = isSAE ? 'saesDevelopped' : 'ressourcesDevelopped';
        chrome.storage.sync.get(key).then(result => {
            if (!result[key]) {
                evalLi.style.setProperty('display', 'none', 'important');
            }
        });

        // Notes repartition
        evalLi.style.cursor = 'pointer';
        evalLi.onclick = event => {
            fetchNoteData(eval, ressourceCode, ressourceTitle);
            document.getElementById('popup-bg').style.display = 'block';
        };

        ressourceUl.appendChild(evalLi);
    }

    const average = (total / coefTotal).toFixed(2);
    ressourceAverage.innerText = average;

    // Set ressource color depending on average. Orange between 8 and 10, red under 8
    // The colors have been picked to be as readable as possible but if you have suggestions, feel free to open an issue
    if (average < 8) {
        ressourceLi.style.setProperty('background-color', '#b40000', 'important');
    } else if (average < 10) {
        ressourceLi.style.setProperty('background-color', '#b67500', 'important');
    }
}

function toggleEvals(event) {
    const target = event.target.nodeName == 'DIV' ? event.target.parentNode : event.target;

    for (const child of target.parentNode.childNodes) {
        if (child.nodeName == 'LI' && child.style.display != 'none') {
            child.style.setProperty('display', 'none', 'important');
        } else {
            child.style.setProperty('display', 'flex', 'important');
        }
    }
}
