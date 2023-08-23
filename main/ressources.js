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
