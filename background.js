// Opens home.html in new tab when extension icon is clicked
chrome.action.onClicked.addListener(tab => {
    chrome.tabs.create({ url: 'settings.html' })
})

// Receive message from content.js and opens home.html in current tab
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.redirect) {
        chrome.tabs.create(
            { url: chrome.runtime.getURL(request.redirect) },
            tab => sendResponse({ message: 'Redirected to extension page' })
        )
    }
})

// Opens welcoming page on first install
chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
        chrome.tabs.create({
            url: 'onboarding.html'
        })
    }
})
