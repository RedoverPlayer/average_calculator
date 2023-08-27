// Filling storage values if they are not set yet
async function initLocalStorage() {
    // Site URL
    await setIfNull('siteUrl', 'notes.iut.u-bordeaux.fr');

    // Theme
    await setIfNull('theme', 'dark');

    // Display categories
    await setIfNull('displayRessources', true);
    await setIfNull('displaySaes', true);
    await setIfNull('displayUes', true);

    // Eval padding range
    await setIfNull('ressourcePadding', 2);
    await setIfNull('evalPadding', 1);
    await setIfNull('ressourceGap', 2);

    // Default developped categories
    await setIfNull('ressourcesDevelopped', true);
    await setIfNull('saesDevelopped', true);
    await setIfNull('uesDevelopped', false);
    await setIfNull('uesRessourcesDevelopped', false);
}

async function setIfNull(key, value) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(key).then(data => {
            if (data[key] === undefined) {
                const obj = {};
                obj[key] = value;
                chrome.storage.sync.set(obj, () => resolve());
            } else {
                resolve();
            }
        });
    });
}
