// ---- Semesters ----
function displaySemester(data, semestres, currentSemesterUEs) {
    updateUEs(data, localStorage.getItem("currentSemester")); // Update the UEs Coefs
    data = data["relevé"];
    buildSemesterMenu(data.formsemestre_id, semestres, currentSemesterUEs);
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
            displayUEs(data.ressources, data.saes, currentSemesterUEs); // Display the UEs (Unités d'Enseignement)
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

// ---- Initial data and other things ----
function fetchSemester(event, semestres) {
    loading();
    let id = event.target.id == "" ? event.target.parentElement.id : event.target.id;
    localStorage.setItem("currentSemester", id);

    // Retrieve UEs Coefs
    chrome.storage.sync.get(`semesterUEs${id}`).then((data) => {
        let currentSemesterUEs = data[`semesterUEs${id}`];
        fetch(`https://${localStorage.getItem('siteUrl')}/services/data.php?q=relev%C3%A9Etudiant&semestre=${id}`).then(response => response.text()).then(data => JSON.parse(data)).then(data => displaySemester(data, semestres, currentSemesterUEs));
    });
}

// Display the list of semesters, which are clickable to fetch the data for a given semester
function buildSemesterMenu(semesterID, semestres, currentSemesterUEs) {
    document.querySelector("div.semestres").innerHTML = "";

    for (let semestre of semestres) {
        let option = document.createElement("button");
        option.className = semestre.formsemestre_id == semesterID ? "btn btn-primary" : "btn btn-secondary";
        option.type = "button";
        option.innerHTML = `<div class="fs-4">Semestre ${semestre.semestre_id}</div><div>${semestre.annee_scolaire} - ${semestre.titre}</div>`;
        option.id = semestre.formsemestre_id
        option.onclick = (event) => {
            fetchSemester(event, semestres, currentSemesterUEs);
        }

        document.querySelector("div.semestres").appendChild(option);
    }
}
