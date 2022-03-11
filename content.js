function calculateAverage() {
    // gets the shadowRoot of the body (yes marks are in there idk why but they are)
    var root = document.querySelector("releve-but").shadowRoot;

    var modulesMarks = 0.0;
    var modulesCoeffs = 0.0;

    // Iterates over all modules
    for (var module of root.querySelectorAll('div[id*="Module_"]')) {
        var marks = 0;
        var coeffs = 0;

        // Iterates over all evaluations of the module
        for (var eval of module.getElementsByClassName("eval")) {
            // Text inside eval div
            var data = eval.querySelectorAll("div")[1].innerText.split("\n");

            var mark = parseFloat(data[0].trim());
            var coeff = parseFloat(data[1].replace("Coef.", "").trim());

            // Verifies if a mark is valid
            if (!isNaN(mark) && !isNaN(coeff)) {
                marks += mark * coeff;
                coeffs += coeff;
            }
        }

        // Adds the module's average to the total (for the general average)
        modulesMarks += marks;
        modulesCoeffs += coeffs;

        // Displays the average of the current module
        if (!module.querySelector('div[class="module"]').innerHTML.includes("average_calculator")) {
            module.querySelector('div[class="module"]').innerHTML += '<div class="average_calculator" style="display: block !important">' + (marks / coeffs).toFixed(2) + "</div>";
        }
    }

    // Displays the general average (it's already there just not showed)
    root.querySelector(".releve>section:nth-child(3)").style.display = "block";
}

// Js takes time to load (not mine, mine is beautiful okay), so there is multiple tries to calculate average
// In addition to this, if you change semester, the page is not reloaded (thanks all-js menus) so I have to poll the page
setInterval(calculateAverage, 1000);
