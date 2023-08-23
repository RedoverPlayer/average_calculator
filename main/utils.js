// Triggers the loading animation
function loading() {
    document.querySelector("div#loading").className = "spinner-grow"
}

// Stops the loading animation
function loaded() {
    document.querySelector("div#loading").className = "d-none"
}
