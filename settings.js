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
    chrome.storage.sync.get(key).then(function (data) {
        if (data[key] === undefined) {
            chrome.storage.sync.set({ key: value });
        }
    });
}

// Init the settings inputs from storage
function initSettings() {
    chrome.storage.sync.get('siteUrl').then(function (data) {
        document.getElementById('siteUrl').value = data.siteUrl;
    });

    chrome.storage.sync.get('theme').then(function (data) {
        document.getElementById(data.theme).checked = true;
    });

    // Display categories
    updateCheck('displayRessources');
    updateCheck('displaySaes');
    updateCheck('displayUes');

    // Default developped categories
    updateCheck('ressourcesDevelopped');
    updateCheck('saesDevelopped');
    updateCheck('uesDevelopped');
    updateCheck('uesRessourcesDevelopped');
}

function updateCheck(key) {
    chrome.storage.sync.get(key).then(function (data) {
        document.getElementById(key).checked = data[key];
    });
}

// Setup the event listeners for the settings inputs
function initListeners() {
    // Site URL
    document.getElementById('siteUrl').onchange = function () {
        chrome.storage.sync.set({ 'siteUrl': this.value });
    };

    // Theme
    document.getElementById('dark').onchange = function () { chrome.storage.sync.set({ 'theme': 'dark'}); location.reload(); }
    document.getElementById('light').onchange = function () { chrome.storage.sync.set({ 'theme': 'light'}); location.reload(); }

    // Display categories
    checkUpdateListener('displayRessources');
    checkUpdateListener('displaySaes');
    checkUpdateListener('displayUes');

    // Default developped categories
    checkUpdateListener('ressourcesDevelopped');
    checkUpdateListener('saesDevelopped');
    checkUpdateListener('uesDevelopped');
    checkUpdateListener('uesRessourcesDevelopped');
}

function checkUpdateListener(key) {
    document.getElementById(key).onchange = function () {
        let checked = this.checked;
        console.log(key, this.checked);
        const data = {};
        data[key] = checked;
        chrome.storage.sync.set(data).then(function () {
            console.log(`Value of "${key}" is set to ${checked}`);
        });
        chrome.storage.sync.get(key).then(function (data) {
            console.log(`Actual value of "${key}" is ${data[key]}`);
        });
    }
}

// Init other things
function initSite() {
    // Theme
    chrome.storage.sync.get('theme').then(function (data) {
        document.body.setAttribute('data-bs-theme', data.theme);
    });
}

chrome.storage.sync.set({ 'ressourcesDevelopped': true });
chrome.storage.sync.get('ressourcesDevelopped').then(function (data) {
    console.log("zaez", data.ressourcesDevelopped);
});
initLocalStorage();
initSettings();
initListeners();
initSite();
