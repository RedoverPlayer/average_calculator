function addSection(shadowRoot, title) {
    var section = shadowRoot.appendChild(document.createElement('section'));
    section.className = "section";

    var sectionTitle = section.appendChild(document.createElement('h2'));
    sectionTitle.innerText = title;

    return section;
}

function addRessource(section) {
    var ressourceDiv = section.appendChild(document.createElement('div'));
    ressourceDiv.style.marginTop = "0.2em";
    ressourceDiv.className = "ressource";

    return ressourceDiv;
}

function addRessourceTitle(ressourceDiv, title) {
    ressourceTitleContainer = ressourceDiv.appendChild(document.createElement('div'));
    ressourceTitleContainer.style = "display: flex; justify-content: space-between; background-color: #00be82; padding: 0.2em; border-radius: 0.2em; color: white; padding-left: 2em; padding-right: 2em;";

    ressourceTitle = ressourceTitleContainer.appendChild(document.createElement('div'));
    ressourceTitle.style.fontSize = "1.1em";
    ressourceTitle.innerText = title;

    return ressourceTitleContainer;
}

function addEvalContainer(section) {
    var evalContainer = section.appendChild(document.createElement('div'));
    evalContainer.style = "display: flex; flex-direction: column; margin-left: 2em";

    return evalContainer;
}

function addEvaluation(section, evaluation, poids, isUE=false) {
    var eval = section.appendChild(document.createElement('div'));
    eval.innerText = evaluation.description;
    eval.title = "Min: " + evaluation.note.min + ", Max: " + evaluation.note.max;
    eval.style = "border-bottom: 1px solid black; display: flex; justify-content: space-between; gap: 1em; padding-left: 0.2em; padding-right: 0.2em;"

    var evalNote = eval.appendChild(document.createElement('div'));
    evalNote.innerText = evaluation.note.value;
    evalNote.style = "margin-left: auto; width: 4em";

    var evalMoy = eval.appendChild(document.createElement('div'));
    evalMoy.innerText = "Moy. " + evaluation.note.moy;
    evalMoy.style = "color: rgb(120, 120, 120); width: 5em";

    var evalCoef = eval.appendChild(document.createElement('div'));
    evalCoef.innerText = "Coeff. " + evaluation.coef;
    evalCoef.style = "color: rgb(120, 120, 120); width: 5.6em";

    if (isUE) {
        var evalPoids = eval.appendChild(document.createElement('div'));
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
    var tag = document.createElement("div");
    tag.innerText = content;
    tag.style.display = "inline";
    tag.style.fontSize = "11px";
    elem.appendChild(tag);
}

function addToUE(ues, ressource, evaluation) {
    for (poid of Object.entries(evaluation.poids)) {
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
    var root = document.querySelector("releve-but").shadowRoot;

    // delete existing content
    var sections = root.querySelectorAll("section");
    for (section of sections) {
        try {
            if (section.className != "etudiant") {
                section.remove();
            }
        } catch {
            continue;
        }
    }

    data = data["relev\u00e9"];
    var ues = {}

    // Add average
    var avgSection = addSection(root, `Semestre ${data.semestre.numero} - ${data.semestre.groupes[0].group_name}`);

    var groupDiv = avgSection.appendChild(document.createElement('div'));
    groupDiv.innerText = ``

    var avgDiv = avgSection.appendChild(document.createElement('div'));
    avgDiv.style = "border: 1px solid black; display: flex; flex-direction: column; width: 160px; margin-top: 7px; padding: 5px;"
    avgDiv.innerHTML += `<div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 20px;"><div>Moyenne :</div><div>${data.semestre.notes.value}</div></div>`;
    avgDiv.innerHTML += `<div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 20px;"><div>Rang :</div><div>${data.semestre.rang.value}/${data.semestre.rang.total}</div></div>`;
    avgDiv.innerHTML += `<div style="display: flex; justify-content: space-between;"><div>Min promo :</div><div>${data.semestre.notes.min}</div></div>`;
    avgDiv.innerHTML += `<div style="display: flex; justify-content: space-between;"><div>Max promo :</div><div>${data.semestre.notes.max}</div></div>`;
    avgDiv.innerHTML += `<div style="display: flex; justify-content: space-between;"><div>Moy promo :</div><div>${data.semestre.notes.moy}</div></div>`;

    var ectsDiv = avgSection.appendChild(document.createElement('div'));
    ectsDiv.innerText = `ECTS: ${data.semestre.ECTS.acquis} / ${data.semestre.ECTS.total}`;
    ectsDiv.style = "margin-top: 7px;";

    // Add ressources
    var rSection = addSection(root, "Ressources");

    for (var ressource of Object.entries(data.ressources)) {
        var ressourceDiv = addRessource(rSection);
        var ressourceTitleContainer = addRessourceTitle(ressourceDiv, ressource[0] + " - " + ressource[1].titre);
        var evalContainer = addEvalContainer(ressourceDiv);
        
        var sum = 0;
        var coefSum = 0;
        
        for (var evaluation of ressource[1].evaluations) {
            if (!isNaN(parseFloat(evaluation.coef)) && !isNaN(parseFloat(evaluation.note.value))) {
                coefSum += parseFloat(evaluation.coef);
                sum += parseFloat(evaluation.coef) * parseFloat(evaluation.note.value);
            }
            
            addToUE(ues, ressource, evaluation);
            addEvaluation(evalContainer, evaluation);
        }

        var avg = sum / coefSum;
        ressourceTitleContainer.appendChild(document.createElement('div')).innerText = avg.toFixed(2);
        if (avg < 10) {
            ressourceTitleContainer.style.backgroundColor = "#ff4600";
        }
    }

    // add SAEs
    var saeSection = addSection(root, "SA\u00c9");

    for (var sae of Object.entries(data.saes)) {
        var saeDiv = addRessource(saeSection);
        var saeTitleContainer = addRessourceTitle(saeDiv, sae[0] + " - " + sae[1].titre);
        saeTitleContainer.style.backgroundColor = "#ffc828";
        saeTitleContainer.style.color = "black";
        var saeEvalContainer = addEvalContainer(saeDiv);

        var sum = 0;
        var coefSum = 0;

        for (var evaluation of sae[1].evaluations) {
            if (!isNaN(parseFloat(evaluation.coef)) && !isNaN(parseFloat(evaluation.note.value))) {
                coefSum += parseFloat(evaluation.coef);
                sum += parseFloat(evaluation.coef) * parseFloat(evaluation.note.value);
            }

            addToUE(ues, sae, evaluation);
            addEvaluation(saeEvalContainer, evaluation);
        }
        
        var avg = sum / coefSum;
        saeTitleContainer.appendChild(document.createElement('div')).innerText = avg.toFixed(2);
        if (avg < 10) {
            saeTitleContainer.style.backgroundColor = "#ff4600";
        }
    }

    // add UEs
    var ueSection = addSection(root, "UE - Ces calculs sont à titre indicatifs et peuvent être différents de ceux de l'établissement. Merci de vérifier ces calculs par vous-même. (IUT Average Mark Calculator).");

    for (var ue of Object.entries(ues)) {
        var ueDiv = addRessource(ueSection);
        var ueTitleContainer = addRessourceTitle(ueDiv, ue[0]);
        ueTitleContainer.style.backgroundColor = "rgb(1, 114, 77)";
        var ueEvalContainer = addEvalContainer(ueDiv);

        var UEsum = 0;
        var UEcoefSum = 0;

        for (var ressource of Object.entries(ue[1])) {
            var ueRessDiv = addRessource(ueEvalContainer);
            var ueRessTitleContainer = addRessourceTitle(ueRessDiv, ressource[0] + " - " + ressource[1][0].ressource.titre);
            var ueRessEvalContainer = addEvalContainer(ueRessDiv);

            var sum = 0;
            var coefSum = 0;

            for (var item of ressource[1]) {
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

            var avg = sum / coefSum;
            ueRessTitleContainer.appendChild(document.createElement('div')).innerText = avg.toFixed(2);
        }

        var UEavg = UEsum / UEcoefSum;
        ueTitleContainer.appendChild(document.createElement('div')).innerText = UEavg.toFixed(2);

        if (UEavg < 8) {
            ueTitleContainer.style.backgroundColor = "orange";
        }
        if (UEavg < 10) {
            ueTitleContainer.style.backgroundColor = "red";
        }
    }
}

function firstData(data) {
    document.querySelector("div.semestres").innerHTML = "";
    document.querySelector("div.semestres").style.display = "flex";
    document.querySelector("div.semestres").style.justifyContent = "center";

    var tmp = [];

    // order elems in tmp by semestre.semestre_id
    for (var semestre of data.semestres) {
        tmp[semestre.semestre_id - 1] = semestre;
    }
    
    tmp.reverse();

    for (var semestre of tmp) {
        var option = document.createElement("button");
        option.innerHTML = `<div>Semestre ${semestre.semestre_id}</div><div style="font-size: 15px;">${semestre.annee_scolaire}</div><div style="font-size: 15px;">${semestre.titre}</div>`;
        option.id = semestre.formsemestre_id
        option.style = "background-color: #ffffff; border: none; border-radius: 15px; box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2); margin: 10px; padding: 15px; width: 200px; font-size: 20px; color: #000000; text-align: center; cursor: pointer;";
        option.onclick = function (event) {
            fetchSemester(event);
        }
        document.querySelector("div.semestres").appendChild(option);
    }

    fetchSemester({target: {id: tmp[0].formsemestre_id}});
}

// site is currently broken, fixing json for use
function patchData(data) {
    var json = data.substring(data.indexOf("{")-1);
    return JSON.parse(json)
}

function fetchSemester(event) {
    if (event.target.id == "") {
        var id = event.target.parentElement.id;
    } else {
        var id = event.target.id;
    }

    fetch(`https://notes.iut.u-bordeaux.fr/services/data.php?q=relev%C3%A9Etudiant&semestre=${id}`).then(response => response.text()).then(data => patchData(data)).then(data => displaySemester(data));
}

fetch("https://notes.iut.u-bordeaux.fr/services/data.php?q=dataPremi%C3%A8reConnexion").then(response => response.json()).then(data => firstData(data));
