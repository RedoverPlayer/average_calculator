function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

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
    ressourceTitleContainer.style.display = "flex";
    ressourceTitleContainer.style.justifyContent = "space-between";
    ressourceTitleContainer.style.backgroundColor = "#00be82";
    ressourceTitleContainer.style.padding = "0.2em";
    ressourceTitleContainer.style.borderRadius = "0.2em";
    ressourceTitleContainer.style.color = "white";
    ressourceTitleContainer.style.paddingLeft = "2em";
    ressourceTitleContainer.style.paddingRight = "2em";

    ressourceTitle = ressourceTitleContainer.appendChild(document.createElement('div'));
    ressourceTitle.style.fontSize = "1.1em";
    ressourceTitle.innerText = title;

    return ressourceTitleContainer;
}

function addEvalContainer(section) {
    var evalContainer = section.appendChild(document.createElement('div'));
    evalContainer.style.display = "flex";
    evalContainer.style.flexDirection = "column";
    evalContainer.style.marginLeft = "2em";

    return evalContainer;
}

function addEvaluation(section, evaluation, poids, isUE=false) {
    var eval = section.appendChild(document.createElement('div'));
    eval.innerText = evaluation.description;
    eval.title = "Min: " + evaluation.note.min + ", Max: " + evaluation.note.max;
    eval.style.borderBottom = "1px solid black";
    eval.style.display = "flex";
    eval.style.justifyContent = "space-between";
    eval.style.gap = "1em"; 
    eval.style.paddingLeft = "0.2em";
    eval.style.paddingRight = "0.2em";

    var evalNote = eval.appendChild(document.createElement('div'));
    evalNote.innerText = evaluation.note.value;
    evalNote.style.marginLeft = "auto";
    evalNote.style.width = "4em";

    var evalMoy = eval.appendChild(document.createElement('div'));
    evalMoy.innerText = "Moy. " + evaluation.note.moy;
    evalMoy.style.color = "rgb(120, 120, 120)";
    evalMoy.style.width = "5em";

    var evalCoef = eval.appendChild(document.createElement('div'));
    evalCoef.innerText = "Coeff. " + evaluation.coef;
    evalCoef.style.color = "rgb(120, 120, 120)";
    evalCoef.style.width = "5.6em";

    if (isUE) {
        var evalPoids = eval.appendChild(document.createElement('div'));
        evalPoids.innerText = "Poids. " + poids;
        evalPoids.style.color = "rgb(120, 120, 120)";
        evalPoids.style.width = "5.6em";
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

function handleInfos(data) {
    var root = document.querySelector("releve-but").shadowRoot;
    root.querySelector(".releve>section:nth-child(3)").style.display = "block"; // display global avg

    // delete existing content
    var sections = root.querySelectorAll("section");
    for (section of sections) {
        try {
            if (section.querySelector("div").querySelector("h2").innerText == "Ressources" || section.querySelector("div").querySelector("h2").innerText == "SAÉ") {
                section.remove();
            }
        } catch {
            continue;
        }
    }

    var data = JSON.parse(data);
    data = data["relev\u00e9"];
    var ues = {}

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
            // if (avg < 10) {
            //     ueRessTitleContainer.style.backgroundColor = "#ff4600";
            // }
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

httpGetAsync("https://notes.iut.u-bordeaux.fr/services/data.php?q=dataPremi%C3%A8reConnexion", handleInfos);
