function displaySemester (data, semestres) {
    data = data["relev\u00e9"];
    buildSemesterMenu(data.formsemestre_id, semestres);
    displaySemesterInfo(data);
    displayRessources(data.ressources);
    displayRessources(data.saes, true);
    loaded();
}

function displaySemesterInfo(data) {
    document.getElementById("semester_title").innerText = `Semestre ${data.semestre.numero} - ${data.semestre.groupes[0].group_name}`
    document.getElementById("average").innerText = `${data.semestre.notes.value}`;
    document.getElementById("minPromo").innerHTML = `<span class="badge bg-danger">Min</span> ${data.semestre.notes.min}`;
    document.getElementById("moyPromo").innerHTML = `<span class="badge bg-secondary">Moy</span> ${data.semestre.notes.moy}`;
    document.getElementById("maxPromo").innerHTML = `<span class="badge bg-success">Max</span> ${data.semestre.notes.max}`;
    document.getElementById("rank").innerText = `${data.semestre.rang.value}/${data.semestre.rang.total}`;
    document.getElementById("ects").innerText = `${data.semestre["ECTS"].acquis}/${data.semestre["ECTS"].total}`;
}

function displayRessources(ressources, isSAE = false) {
    let ressourcesDiv = document.getElementById("ressources");
    let saesDiv = document.getElementById("saes");

    if (!isSAE) { ressourcesDiv.innerHTML = "" } else { saesDiv.innerHTML = "" }

    for (let ressource of Object.entries(ressources)) {
        let ressourceUl = document.createElement("ul");
        ressourceUl.className = "list-group";

        // Ressource title
        let ressourceLi = document.createElement("li");
        if (isSAE) {
            ressourceLi.className = "list-group-item d-flex justify-content-between";
            // ressourceLi.style.backgroundColor = "#efb400";
            ressourceLi.style.backgroundColor = "#5b4500";
        } else {
            ressourceLi.className = "list-group-item bg-success d-flex justify-content-between";
        }
        // #ffc828

        let ressourceTitle = document.createElement("div");
        ressourceTitle.innerText = `${ressource[0]} - ${ressource[1].titre}`
        ressourceLi.appendChild(ressourceTitle);

        let ressourceAverage = document.createElement("div");

        // add to DOM
        ressourceLi.appendChild(ressourceAverage);
        ressourceUl.appendChild(ressourceLi);

        displayEvals(ressource[1].evaluations, ressourceAverage, ressourceUl, ressourceLi);

        // Add ressource to DOM
        if (!isSAE) {ressourcesDiv.appendChild(ressourceUl) } else { saesDiv.appendChild(ressourceUl) }
    }
}

function displayEvals(evals, ressourceAverage, ressourceUl, ressourceLi) {
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
        if (eval.note.value == eval.note.max) {
            evalNote.innerHTML =  `<span class="badge bg-success">Max</span> ${eval.note.value}`;
        } else if (eval.note.value == eval.note.min) {
            evalNote.innerHTML =  `<span class="badge bg-danger">Min</span> ${eval.note.value}`;
        }
        evalNote.style.marginLeft = "auto";
        evalNote.style.minWidth = "2.4rem";
        evalNote.className = "d-flex align-items-center gap-2";
        evalLi.appendChild(evalNote);

        // Eval moy
        let evalMoy = document.createElement("div");
        evalMoy.innerText = `Moy. ${eval.note.moy}`;
        evalMoy.className = "text-secondary";
        evalMoy.style.minWidth = "4.9rem";
        evalLi.appendChild(evalMoy);

        // Eval coef
        let evalCoef = document.createElement("div");
        evalCoef.innerText = `Coef. ${eval.coef}`;
        evalCoef.className = "text-secondary";
        evalCoef.style.minWidth = "5rem";
        evalLi.appendChild(evalCoef);

        ressourceUl.appendChild(evalLi);
    }

    let average = (total / coefTotal).toFixed(2);
    ressourceAverage.innerText = `${average}`;
    if (average < 8) {
        ressourceLi.style.setProperty('background-color', '#b40000', 'important');
    } else if (average < 10) {
        ressourceLi.style.setProperty('background-color', '#b67500', 'important');
    }
}

function fetchSemester(event, semestres) {
    loading();
    let id = event.target.id == "" ? event.target.parentElement.id : event.target.id;
    fetch(`https://notes.iut.u-bordeaux.fr/services/data.php?q=relev%C3%A9Etudiant&semestre=${id}`).then(response => response.text()).then(data => JSON.parse(data)).then(data => displaySemester(data, semestres));
}

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

function loading() {
    document.querySelector("div#loading").className = "spinner-grow"
}

function loaded() {
    document.querySelector("div#loading").className = "d-none"
}

function firstData(data) {
    // User not logged in
    if ("redirect" in data) {
        window.location.href = window.location.href + data.redirect + "?href=" + encodeURIComponent(window.location.href);
    }

    document.querySelector("div.semestres").innerHTML = "";
    data.semestres.sort((a, b) => a.semestre_id - b.semestre_id);

    fetchSemester({target: {id: data.semestres[data.semestres.length - 1].formsemestre_id}}, data.semestres);
}

fetch("https://notes.iut.u-bordeaux.fr/services/data.php?q=dataPremi%C3%A8reConnexion").then(response => response.json()).then(data => firstData(data));
