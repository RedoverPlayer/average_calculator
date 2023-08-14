// Opens home.html in new tab when extension icon is clicked
chrome.action.onClicked.addListener(function (tab) {
    chrome.tabs.create({ 'url': "settings.html" });
});

// Receive message from content.js and opens home.html in current tab
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.redirect) {
            chrome.tabs.create({ 'url': chrome.runtime.getURL(request.redirect) }, function (tab) {
                sendResponse({ message: "Redirected to extension page" });
            });
        }
    }
);