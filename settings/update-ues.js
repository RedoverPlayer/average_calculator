function updateUEs(data, currentSemester) {
    // Load current semester data
    const semesterID = `semesterUEs${currentSemester}`;
    chrome.storage.sync.get(semesterID).then((result) => {
        let ues = result[semesterID];
        if (ues === undefined) { ues = {}; }

        addRessources(data["relevé"]["ressources"], ues);
        addRessources(data["relevé"]["saes"], ues);

        let obj = {};
        obj[semesterID] = ues;
        chrome.storage.sync.set(obj);

        return ues;
    });
}

function addRessources(ressources, ues) {
    for (const ressource of Object.entries(ressources)) {
        const ressourceName = ressource[0];

        for (const evaluation of ressource[1].evaluations) {
            for (const weight of Object.entries(evaluation.poids)) {
                const ueName = weight[0]

                if (weight[1] != 0) {
                    if (!(ueName in ues)) {
                        ues[ueName] = {name: ueName, ressources: {}};
                    }
                    if (!(ressourceName in ues[ueName].ressources)) {
                        ues[ueName].ressources[ressourceName] = {name: ressourceName, titre: ressource[1].titre, weight: 0};
                    }
                }
            }
        }
    }
}
