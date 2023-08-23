// Filling storage values if they are not set yet
function initLocalStorage() {
    // Site URL
    setIfNull('siteUrl', 'notes.iut.u-bordeaux.fr');

    // Theme
    setIfNull('theme', 'dark');

    // Display categories
    setIfNull('displayRessources', true);
    setIfNull('displaySaes', true);
    setIfNull('displayUes', true);

    // Default developped categories
    setIfNull('ressourcesDevelopped', true);
    setIfNull('saesDevelopped', true);
    setIfNull('uesDevelopped', false);
    setIfNull('uesRessourcesDevelopped', false);
}

function setIfNull(key, value) {
    chrome.storage.sync.get(key).then((data) => {
        if (data[key] === undefined) {
            let obj = {};
            obj[key] = value;
            chrome.storage.sync.set(obj);
        }
    });
}
