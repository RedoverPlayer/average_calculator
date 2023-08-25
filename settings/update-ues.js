function updateUEs(data, currentSemester) {
    // Load current semester data
    const semesterID = `semesterUEs${currentSemester}`;
    chrome.storage.sync.get(semesterID).then(result => {
        let ues = result[semesterID] ?? {};

        addRessources(data['relevé']['ressources'], ues);
        addRessources(data['relevé']['saes'], ues);

        const obj = {};
        obj[semesterID] = ues;
        chrome.storage.sync.set(obj);

        return ues;
    });
}

function addRessources(ressources, ues) {
    for (const ressource of Object.entries(ressources)) {
        const [ressourceName, ressourceData] = ressource;

        for (const evaluation of ressourceData.evaluations) {
            for (const weight of Object.entries(evaluation.poids)) {
                const ueName = weight[0];

                if (weight[1] !== 0) {
                    if (!(ueName in ues)) {
                        ues[ueName] = {
                            name: ueName,
                            ressources: {}
                        };
                    }
                    if (!(ressourceName in ues[ueName].ressources)) {
                        ues[ueName].ressources[ressourceName] = {
                            name: ressourceName,
                            titre: ressourceData.titre,
                            weight: 0
                        };
                    }
                }
            }
        }
    }
}
