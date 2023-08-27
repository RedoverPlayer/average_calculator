function firstData(data) {
    // If the user is not logged in, redirect to the CAS login page
    if ('redirect' in data) {
        window.location.href = `${window.location.href}${data.redirect}?href=${encodeURIComponent(window.location.href)}`;
    }

    document.querySelector('div.semestres').innerHTML = '';
    data.semestres.sort((a, b) => a.semestre_id - b.semestre_id); // Sort semesters by ID (number)e

    // Fetch the most recent semester (as it's probably the one the user wants to see the most)
    fetchSemester(
        {target: {id: data.semestres[data.semestres.length - 1].formsemestre_id}}, 
        data.semestres
    );
}

async function main() {
    const { siteUrl } = await chrome.storage.sync.get('siteUrl')

    // If the user is not on the site, don't do anything. The extension will load on all site but only activate on the one specified in the settings.
    // This is done to enable the user to change the url of the site in the settings. If the site was set in the manifest, it would be impossible to change it.
    if (document.location.host != siteUrl) return;

    localStorage.setItem("siteUrl", siteUrl);

    initLocalStorage().then(async () => {
        // Replaces the original page with the extension's page
        document.open();
        document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${chrome.runtime.getURL('bootstrap/bootstrap.min.css')}" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous">
            <title>Notes</title>
        </head>
        <body data-bs-theme="dark" class="text-center">
            <nav class="navbar navbar-expand-lg bg-body-tertiary">
            <div class="container-fluid">
                <div class="navbar-brand">Relevé de notes</div>
                <div class="d-flex gap-2">
                    <div id="settings_container"></div>
                    <a class="btn btn-danger" href="https://${siteUrl}/logout.php">Déconnexion</a>
                </div>
            </div>
            <div id="loading" class="spinner-grow" style="position:absolute; top: 1rem; left: 49%;" role="status"></div>
            </nav>

            <div class="semestres btn-group m-4" role="group"></div>

            <div class="card text-start m-auto" style="width: 90%; max-width: 60rem; min-width: 35rem;">
            <h2 id="semester_title" class="card-title text-center mt-2">Semestre - - ----</h2>    
                <div class="d-flex flex-column m-auto align-items-center" style="width: 250px;">
                <div class="fs-5 d-flex justify-content-between" style="width: 200px;"><div>Moyenne :</div><div id="average">--.--</div></div>
                <div class="fs-5 d-flex justify-content-between" style="width: 200px;"><div>Rang :</div><div id="rank">--/--</div></div>
                <div class="fs-5 d-flex justify-content-between" style="width: 200px;"><div>ECTS:</div><div id="ects">--/--</div></div>
                </div>
                
                <div class="d-flex gap-2 m-auto mb-2 mt-2">
                <div title="Minimum promo" id="minPromo"><span class="badge bg-danger">Min</span> --.--</div>
                <div title="Moyenne promo" id="moyPromo"><span class="badge bg-secondary">Moy</span> --.--</div>
                <div title="Maximum promo" id="maxPromo"><span class="badge bg-success">Max</span> --.--</div>
                </div>
            </div>

            <div id="ressources-container" class="card text-start m-auto mt-2 p-4" style="width: 90%; max-width: 60rem; min-width: 35rem;">
            <h2 class="text-center mb-2">Ressources</h2>
            <div id="ressources" class="d-flex flex-column gap-2">
            </div>
            </div>

            <div id="saes-container" class="card text-start m-auto mt-2 p-4" style="width: 90%; max-width: 60rem; min-width: 35rem;">
            <h2 class="text-center mb-2">SAÉs</h2>
            <div id="saes" class="d-flex flex-column gap-2">
            </div>
            </div>

            <div id="ues-container" class="card text-start m-auto mt-2 p-4" style="width: 90%; max-width: 60rem; min-width: 35rem;">
                <h2 class="text-center mb-2">UEs</h2>
                <div id="ues" class="d-flex flex-column gap-2">
                </div>
            </div>

            <footer class="p-4">
            <p>
                <i>Cette extension présente les notes universitaires à partir du site officiel de l'université avec <br>
                un nouveau design et un calcul des moyennes tout en maintenant les données d'origine. Néanmoins, <br>
                l'extension décline toute responsabilité en cas d'éventuels problèmes d'affichage ou de calcul des <br>
                moyennes. Vous pouvez vérifier le code source par vous-même via le lien présent ci-dessous.</i>
            </p>
            
            <a class="m-4" href="https://github.com/RedoverPlayer/average_calculator" target="_blank">https://github.com/RedoverPlayer/average_calculator</a>
            </footer>

            <div class="wait" style="display: none;"></div>
            <div class="auth" style="display: none;"></div>
        </body>
        </html>
        `);
        document.close();

        // Set theme
        chrome.storage.sync.get('theme').then(data => document.body.setAttribute('data-bs-theme', data.theme));

        // Add bootstrap script
        const bootstrapUrl = chrome.runtime.getURL('bootstrap/bootstrap.bundle.min.js');
        const script = document.createElement('script');
        script.src = bootstrapUrl;
        document.body.appendChild(script);

        // Add settings link
        const settingsLink = document.createElement('a');
        settingsLink.className = 'btn btn-primary';
        settingsLink.href = chrome.runtime.getURL('settings.html');
        settingsLink.innerText = 'Paramètres';
        document.getElementById('settings_container').appendChild(settingsLink);

        // Set flex gap from settings
        const { ressourceGap } = await chrome.storage.sync.get('ressourceGap');
        ["ressources", "saes", "ues"].forEach(elem => {
            document.getElementById(elem).className = `d-flex flex-column gap-${ressourceGap}`;
        });

        // fetch the initial data, which contains the list of semesters (unlike fetchSemester)
        fetch(`https://${siteUrl}/services/data.php?q=dataPremièreConnexion`)
            .then(response => response.json())
            .then(data => firstData(data));
    });
}

main()
