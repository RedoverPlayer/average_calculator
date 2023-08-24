// ---- Semesters ----
function displaySemester(data, semestres, currentSemesterUEs) {
    updateUEs(data, localStorage.getItem('currentSemester')); // Update the UEs Coefs
    const { relevé } = data;
    buildSemesterMenu(relevé.formsemestre_id, semestres, currentSemesterUEs);
    displaySemesterInfo(relevé);

    async function checkKey(key) {
        const result = await chrome.storage.sync.get(key);
        return !!result[key];
    }

    checkKey('displayRessources').then(exists => {
        const container = document.getElementById('ressources-container');
        container.style.display = exists ? 'block' : 'none';
        if (exists) {
            displayRessources(relevé.ressources); // Display the Ressources
        }
    });

    checkKey('displaySaes').then(exists => {
        const container = document.getElementById('saes-container');
        container.style.display = exists ? 'block' : 'none';
        if (exists) {
            displayRessources(relevé.saes, true); // Display the SAEs (Situations d'Apprentissage et d'Evaluation)
        }
    });

    checkKey('displayUes').then(exists => {
        const container = document.getElementById('ues-container');
        container.style.display = exists ? 'block' : 'none';
        if (exists) {
            displayUEs(relevé.ressources, relevé.saes, currentSemesterUEs); // Display the UEs (Unités d'Enseignement)
        }
    });

    loaded();
}

// Display the semester's info (average, rank, ECTS, etc.)
function displaySemesterInfo(data) {
    const { semestre } = data;
    const { notes, rang, ECTS } = semestre;
    document.getElementById('semester_title').innerText = `Semestre ${semestre.numero} - ${semestre.groupes[0].group_name}`;
    document.getElementById('average').innerText = `${notes.value}`;
    document.getElementById('minPromo').innerHTML = `<span class="badge bg-danger">Min</span> ${notes.min}`;
    document.getElementById('moyPromo').innerHTML = `<span class="badge bg-secondary">Moy</span> ${notes.moy}`;
    document.getElementById('maxPromo').innerHTML = `<span class="badge bg-success">Max</span> ${notes.max}`;
    document.getElementById('rank').innerText = `${rang.value}/${rang.total}`;
    document.getElementById('ects').innerText = `${ECTS.acquis}/${ECTS.total}`;
}

// ---- Initial data and other things ----
function fetchSemester(event, semestres) {
    loading();
    const { target } = event;
    const id = target.id === '' ? target.parentElement.id : target.id;
    localStorage.setItem('currentSemester', id);

    // Retrieve UEs Coefs
    chrome.storage.sync.get(`semesterUEs${id}`).then(data => {
        const currentSemesterUEs = data[`semesterUEs${id}`];
        fetch(`https://${siteUrl}/services/data.php?q=relev%C3%A9Etudiant&semestre=${id}`)
            .then(response => response.json())
            .then(data => displaySemester(data, semestres, currentSemesterUEs));
    });
}

// Display the list of semesters, which are clickable to fetch the data for a given semester
function buildSemesterMenu(semesterID, semestres, currentSemesterUEs) {
    const divSemestres = document.querySelector('div.semestres');
    divSemestres.innerHTML = '';

    for (const semestre of semestres) {
        const { formsemestre_id, semestre_id, annee_scolaire, titre } = semestre;
        const option = document.createElement('button');
        option.className = formsemestre_id === semesterID ? 'btn btn-primary' : 'btn btn-secondary';
        option.type = 'button';
        option.innerHTML = `<div class="fs-4">Semestre ${semestre_id}</div><div>${annee_scolaire} - ${titre}</div>`;
        option.id = formsemestre_id;
        option.onclick = event => fetchSemester(event, semestres, currentSemesterUEs);

        divSemestres.appendChild(option);
    }
}
