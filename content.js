function addSection(shadowRoot, title) {
    let section = shadowRoot.appendChild(document.createElement('section'));
    section.className = "section";

    let sectionTitle = section.appendChild(document.createElement('h2'));
    sectionTitle.innerText = title;

    return section;
}

function addRessource(section) {
    let ressourceDiv = section.appendChild(document.createElement('div'));
    ressourceDiv.style.marginTop = "0.2em";
    ressourceDiv.className = "ressource";

    return ressourceDiv;
}

function addRessourceTitle(ressourceDiv, title) {
    let ressourceTitleContainer = ressourceDiv.appendChild(document.createElement('div'));
    ressourceTitleContainer.style = "display: flex; justify-content: space-between; background-color: #00be82; padding: 0.2em; border-radius: 0.2em; color: white; padding-left: 2em; padding-right: 2em;";

    let ressourceTitle = ressourceTitleContainer.appendChild(document.createElement('div'));
    ressourceTitle.style.fontSize = "1.1em";
    ressourceTitle.innerText = title;

    return ressourceTitleContainer;
}

function addEvalContainer(section) {
    let evalContainer = section.appendChild(document.createElement('div'));
    evalContainer.style = "display: flex; flex-direction: column; margin-left: 2em";

    return evalContainer;
}

function addEvaluation(section, evaluation, poids, isUE=false) {
    let epr = section.appendChild(document.createElement('div'));
    epr.innerText = evaluation.description;
    epr.title = "Min: " + evaluation.note.min + ", Max: " + evaluation.note.max;
    epr.style = "border-bottom: 1px solid black; display: flex; justify-content: space-between; gap: 1em; padding-left: 0.2em; padding-right: 0.2em;"

    let evalNote = epr.appendChild(document.createElement('div'));
    evalNote.innerText = evaluation.note.value;
    evalNote.style = "margin-left: auto; width: 4em";

    let evalMoy = epr.appendChild(document.createElement('div'));
    evalMoy.innerText = "Moy. " + evaluation.note.moy;
    evalMoy.style = "color: rgb(120, 120, 120); width: 5em";

    let evalCoef = epr.appendChild(document.createElement('div'));
    evalCoef.innerText = "Coeff. " + evaluation.coef;
    evalCoef.style = "color: rgb(120, 120, 120); width: 5.6em";

    if (isUE) { 
        let evalPoids = epr.appendChild(document.createElement('div'));
        evalPoids.innerText = "Poids. " + poids;
        evalPoids.style = "color: rgb(120, 120, 120); width: 5.6em";
    }

    if (parseFloat(evaluation.note.value) >= parseFloat(evaluation.note.max)) {
        evalNote.style.color = "green";
        addTag(evalNote, "MAX");
    } else if (parseFloat(evaluation.note.value) <= parseFloat(evaluation.note.min)) {
        evalNote.style.color = "red";
        addTag(evalNote, "MIN");
    }
}

function addTag(elem, content) {
    let tag = document.createElement("div");
    tag.innerText = content;
    tag.style.display = "inline";
    tag.style.fontSize = "11px";
    elem.appendChild(tag);
}

function addToUE(ues, ressource, evaluation) {
    for (let poid of Object.entries(evaluation.poids)) {
        if (!(poid[0] in ues)) {
            ues[poid[0]] = [];
        }
        if (poid[1] > 0) {
            if (!(ressource[0] in ues[poid[0]])) {
                ues[poid[0]][ressource[0]] = [];
            }
            ues[poid[0]][ressource[0]].push({"ressource": ressource[1], "evaluation": evaluation});
        }
    }
}

function displaySemester(data) {
    let root = document.querySelector("releve-but").shadowRoot;

    // delete existing content
    root.querySelectorAll("section").forEach((section) => {
        if (section.className != "etudiant") {
            section.remove();
        }
    });

    data = data["relev\u00e9"];
    let ues = {}

    // Add average
    let avgSection = addSection(root, `Semestre ${data.semestre.numero} - ${data.semestre.groupes[0].group_name}`);

    let groupDiv = avgSection.appendChild(document.createElement('div'));
    groupDiv.innerText = ``

    let avgDiv = avgSection.appendChild(document.createElement('div'));
    avgDiv.style = "border: 1px solid black; display: flex; flex-direction: column; width: 160px; margin-top: 7px; padding: 5px;"
    avgDiv.innerHTML += `<div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 20px;"><div>Moyenne :</div><div>${data.semestre.notes.value}</div></div>`;
    avgDiv.innerHTML += `<div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 20px;"><div>Rang :</div><div>${data.semestre.rang.value}/${data.semestre.rang.total}</div></div>`;
    avgDiv.innerHTML += `<div style="display: flex; justify-content: space-between;"><div>Min promo :</div><div>${data.semestre.notes.min}</div></div>`;
    avgDiv.innerHTML += `<div style="display: flex; justify-content: space-between;"><div>Max promo :</div><div>${data.semestre.notes.max}</div></div>`;
    avgDiv.innerHTML += `<div style="display: flex; justify-content: space-between;"><div>Moy promo :</div><div>${data.semestre.notes.moy}</div></div>`;

    let ectsDiv = avgSection.appendChild(document.createElement('div'));
    ectsDiv.innerText = `ECTS: ${data.semestre.ECTS.acquis} / ${data.semestre.ECTS.total}`;
    ectsDiv.style = "margin-top: 7px;";

    // Add ressources
    let rSection = addSection(root, "Ressources");

    for (let ressource of Object.entries(data.ressources)) {
        let ressourceDiv = addRessource(rSection);
        let ressourceTitleContainer = addRessourceTitle(ressourceDiv, ressource[0] + " - " + ressource[1].titre);
        let evalContainer = addEvalContainer(ressourceDiv);
        
        let sum = 0;
        let coefSum = 0;
        
        for (let evaluation of ressource[1].evaluations) {
            if (!isNaN(parseFloat(evaluation.coef)) && !isNaN(parseFloat(evaluation.note.value))) {
                coefSum += parseFloat(evaluation.coef);
                sum += parseFloat(evaluation.coef) * parseFloat(evaluation.note.value);
            }
            
            addToUE(ues, ressource, evaluation);
            addEvaluation(evalContainer, evaluation);
        }

        let avg = sum / coefSum;
        ressourceTitleContainer.appendChild(document.createElement('div')).innerText = avg.toFixed(2);
        
        if (avg < 8) {
            ressourceTitleContainer.style.backgroundColor = "red";
        } else if (avg < 10) {
            ressourceTitleContainer.style.backgroundColor = "orange";
        }
    }

    // add SAEs
    let saeSection = addSection(root, "SA\u00c9");

    for (let sae of Object.entries(data.saes)) {
        let saeDiv = addRessource(saeSection);
        let saeTitleContainer = addRessourceTitle(saeDiv, sae[0] + " - " + sae[1].titre);
        saeTitleContainer.style.backgroundColor = "#ffc828";
        saeTitleContainer.style.color = "black";
        let saeEvalContainer = addEvalContainer(saeDiv);

        let sum = 0;
        let coefSum = 0;

        for (let evaluation of sae[1].evaluations) {
            if (!isNaN(parseFloat(evaluation.coef)) && !isNaN(parseFloat(evaluation.note.value))) {
                coefSum += parseFloat(evaluation.coef);
                sum += parseFloat(evaluation.coef) * parseFloat(evaluation.note.value);
            }

            addToUE(ues, sae, evaluation);
            addEvaluation(saeEvalContainer, evaluation);
        }
        
        let avg = sum / coefSum;
        saeTitleContainer.appendChild(document.createElement('div')).innerText = avg.toFixed(2);
        if (avg < 10) {
            saeTitleContainer.style.backgroundColor = "#ff4600";
        }
    }

    // add UEs
    let ueSection = addSection(root, "UE - Ces calculs sont à titre indicatifs, proviennent de données issues de ce site (pas toujours correctes en fait, voire pas du tout) et peuvent être différents de ceux de l'établissement. Merci de vérifier ces calculs par vous-même. (IUT Average Mark Calculator).");

    for (let ue of Object.entries(ues)) {
        let ueDiv = addRessource(ueSection);
        let ueTitleContainer = addRessourceTitle(ueDiv, ue[0]);
        ueTitleContainer.style.backgroundColor = "rgb(1, 114, 77)";
        let ueEvalContainer = addEvalContainer(ueDiv);

        let UEsum = 0;
        let UEcoefSum = 0;

        for (let ressource of Object.entries(ue[1])) {
            let ueRessDiv = addRessource(ueEvalContainer);
            let ueRessTitleContainer = addRessourceTitle(ueRessDiv, ressource[0] + " - " + ressource[1][0].ressource.titre);
            let ueRessEvalContainer = addEvalContainer(ueRessDiv);

            let sum = 0;
            let coefSum = 0;

            for (let item of ressource[1]) {
                if (!isNaN(parseFloat(item.evaluation.coef)) && !isNaN(parseFloat(item.evaluation.note.value))) {
                    UEcoefSum += parseFloat(item.evaluation.poids[ue[0]]);
                    UEsum += parseFloat(item.evaluation.poids[ue[0]]) * parseFloat(item.evaluation.note.value);
                }
                if (!isNaN(parseFloat(item.evaluation.coef)) && !isNaN(parseFloat(item.evaluation.note.value))) {
                    coefSum += parseFloat(item.evaluation.coef);
                    sum += parseFloat(item.evaluation.coef) * parseFloat(item.evaluation.note.value);
                }

                addEvaluation(ueRessEvalContainer, item.evaluation, item.evaluation.poids[ue[0]], true);
            }

            let avg = sum / coefSum;
            ueRessTitleContainer.appendChild(document.createElement('div')).innerText = avg.toFixed(2);

            if (avg < 8) {
                ueRessTitleContainer.style.backgroundColor = "red";
            } else if (avg < 10) {
                ueRessTitleContainer.style.backgroundColor = "orange";
            }
        }

        let UEavg = UEsum / UEcoefSum;
        ueTitleContainer.appendChild(document.createElement('div')).innerText = UEavg.toFixed(2);

        if (UEavg < 8) {
            ueTitleContainer.style.backgroundColor = "orange";
        } else if (UEavg < 10) {
            ueTitleContainer.style.backgroundColor = "red";
        }
    }
}

function firstData(data) {
    document.querySelector("div.semestres").innerHTML = "";
    document.querySelector("div.semestres").style.display = "flex";
    document.querySelector("div.semestres").style.justifyContent = "center";

    let tmp = [];

    // order elems in tmp by semestre.semestre_id
    for (let semestre of data.semestres) {
        tmp[semestre.semestre_id - 1] = semestre;
    }
    
    tmp.reverse();

    for (let semestre of tmp) {
        let option = document.createElement("button");
        option.innerHTML = `<div>Semestre ${semestre.semestre_id}</div><div style="font-size: 15px;">${semestre.annee_scolaire}</div><div style="font-size: 15px;">${semestre.titre}</div>`;
        option.id = semestre.formsemestre_id
        option.style = "background-color: #ffffff; border: none; border-radius: 15px; box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2); margin: 10px; padding: 15px; width: 200px; font-size: 20px; color: #000000; text-align: center; cursor: pointer;";
        option.onclick = (event) => {
            fetchSemester(event);
        }
        document.querySelector("div.semestres").appendChild(option);
    }

    fetchSemester({target: {id: tmp[0].formsemestre_id}});
}

// site is currently broken, fixing json for use
function patchData(data) {
    let json = data.substring(data.indexOf("{")-1);
    return JSON.parse(json)
}

function fetchSemester(event) {
    let id;
    if (event.target.id == "") {
        id = event.target.parentElement.id;
    } else {
        id = event.target.id;
    }

    fetch(`https://notes.iut.u-bordeaux.fr/services/data.php?q=relev%C3%A9Etudiant&semestre=${id}`).then(response => response.text()).then(data => patchData(data)).then(data => displaySemester(data));
}

fetch("https://notes.iut.u-bordeaux.fr/services/data.php?q=dataPremi%C3%A8reConnexion").then(response => response.json()).then(data => firstData(data));
