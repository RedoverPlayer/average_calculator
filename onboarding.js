// Init the settings inputs from storage
function initSettings() {
    chrome.storage.sync.get('siteUrl').then(data => {
        document.getElementById('siteUrl').value = data.siteUrl
    })

    chrome.storage.sync.get('theme').then(data => {
        document.getElementById(data.theme).checked = true
    })
}

// Setup the event listeners for the settings inputs
function initListeners() {
    // Site URL
    document.getElementById('siteUrl').onchange = () =>
        chrome.storage.sync.set({ siteUrl: this.value })

    // Theme
    document.getElementById('dark').onchange = () => {
        chrome.storage.sync.set({ theme: 'dark' })
        location.reload()
    }
    document.getElementById('light').onchange = () => {
        chrome.storage.sync.set({ theme: 'light' })
        location.reload()
    }
}

// Init other things
function initSite() {
    // Theme
    chrome.storage.sync
        .get('theme')
        .then(data => document.body.setAttribute('data-bs-theme', data.theme))
}

initLocalStorage()
setTimeout(initSettings, 100)
setTimeout(initListeners, 100)
setTimeout(initSite, 100)
