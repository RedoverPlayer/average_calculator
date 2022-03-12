// Calculates the averages and some other stuff
function calculateAverage() {
    // gets the shadowRoot of the body (yes marks are in there idk why but they are)
    if (document.querySelector("releve-but") == null) {
        return;
    }
    var root = document.querySelector("releve-but").shadowRoot;

    // Do not recalculate page if already done
    if (root.querySelectorAll('section[id="ue_data"]').length == 0) {
        var UE = {};
    
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
    
            // Displays the average of the current module
            if (!module.querySelector('div[class="module"]').innerHTML.includes("average_calculator")) {
                module.querySelector('div[class="module"]').innerHTML += '<div class="average_calculator" style="display: block !important">' + (marks / coeffs).toFixed(2) + "</div>";
            }

            // Adds the current module to the corresponding UE
            addToUE(UE, module, (marks / coeffs).toFixed(2));
        }
    
        // Displays the general average (it's already there just not showed)
        root.querySelector(".releve>section:nth-child(3)").style.display = "block";
    
        // Generates the entire UE section
        if (root.querySelectorAll('section[id="ue_data"]').length == 0) {
            genUESection(UE, root);
        }
    }
}

// Adds a module to an UE
function addToUE(UE, module, average) {
    var UEData = getUE(module);
    
    if (UEData != null) {
        var UEName = UEData[0];
        var weightInUE = UEData[1];
        
        // If the UE doesn't exist yet, create it
        if (UE[UEName] == undefined) {
            UE[UEName] = [];
        }
    
        UE[UEName].push({"average": average, "weight": weightInUE, "elem": module});
    }
}

// Gets the the UE the module belongs to
function getUE(module) {
    var data = module.querySelector('div[class="complement"]');

    // Some modules don't have any evals
    if (data != null) {
        // Iterates through the eval info to find the UE the module belongs to
        var infos = data.querySelectorAll("div");

        for (let index in infos) {
            if (infos[parseInt(index) + 1] != null && infos[index].innerHTML.includes("Poids") && parseFloat(infos[parseInt(index) + 1].innerText.trim()) != 0.0) {
                var UEName = infos[index].innerText.replace("Poids ", "").trim();
                var weightInUE = parseFloat(infos[parseInt(index) + 1].innerText.trim());
                break;
            }
        }

        return [UEName, weightInUE];
    } else {
        return null;
    }
}

// Generates the UE section
function genUESection(UE, root) {
    var main = root.querySelector('main[class="releve"]')
    
    var currentSection = main.appendChild(document.createElement('section'));
    currentSection.id = "ue_data";

    addTitle(currentSection, "UE");

    var UEContainer = currentSection.appendChild(document.createElement('div'));
    UEContainer.className = "evaluations";

    for (var [UEName, UEModules] of Object.entries(UE)) {
        addUE(UE, UEContainer, UEName, UEModules);
    }

}

// Add an UE to the UE section
function addUE(UE, UEContainer, UEName, UEModules) {
    var UE = UEContainer.appendChild(document.createElement('div'));
    UE.id = UEName;
    UE.addEventListener('click', function(event) { UEClick(event); });
 
    // Adds the title (name of the UE) to the UE
    var UETitle = UE.appendChild(document.createElement('div'));
    UETitle.className = "module";
    UETitle.innerHTML = `
        <h3 style="background: none">` + UEName + `</h3>
        <div></div>
        <div></div>`;

    // Variables for the UE average
    var modulesMarks = 0.0;
    var modulesWeight = 0.0;

    // Iterates over the modules of the UE
    for (var module of UEModules) {
        // Adds the module to the UE
        var UEModule = UE.appendChild(document.createElement('div'));
        UEModule.id = "UEModule_" + UEName;
        UEModule.style.marginLeft = "40px";
        UEModule.innerHTML += module["elem"].innerHTML;

        // Increment UE average if the module has an average
        if (!isNaN(module["average"]) && !isNaN(module["weight"])) {
            modulesMarks += parseFloat(module["average"]) * parseFloat(module["weight"]);
            modulesWeight += parseFloat(module["weight"]);
        }
    }

    // Adds the average of the UE to the UE
    var UEAvg = (modulesMarks / modulesWeight).toFixed(2)
    UETitle.innerHTML += '<div class="average_calculator" style="display: block !important">' + UEAvg + '</div>';

    // Changes the color of the UE depending of the average
    if (UEAvg < 8) {
        UETitle.style.backgroundColor = "red";
    } else if (UEAvg < 10) {
        UETitle.style.backgroundColor = "orange";
    } else {
        UETitle.style.backgroundColor = "green";
    }
}

// List expand
function listClick(event) {
    // Gets the clicked element
    if (event.target.parentElement.parentElement.tagName == "SECTION") {
        var target = event.target.parentElement.parentElement;
    } else if (event.target.parentElement.parentElement.parentElement.tagName == "SECTION") {
        var target = event.target.parentElement.parentElement.parentElement;
    }

    if (target.tagName == "SECTION") {
        target.classList.toggle("listeOff");
    }
}

// Expand feature
function UEClick(event) {
    if (event.target.tagName == "DIV" && event.target.parentElement.id.includes("UE")) {
        event.target.parentElement.classList.toggle("listeOff");
    }
}

// Adds a title to a section
function addTitle(section, title) {
    var tmpDiv = section.appendChild(document.createElement('div'));
    tmpDiv.innerHTML += '<h2>' + title + '</h2>';
    
    var listButton = tmpDiv.appendChild(document.createElement('div'));
    listButton.className = "CTA_Liste";
    listButton.innerHTML = `
    Liste <svg xmlns="http://www.w3.org/2000/svg"  width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 15l-6-6-6 6"></path>
        </svg>`;
    listButton.addEventListener('click', function(event) { listClick(event); });
}

// Js takes time to load (not mine, mine is beautiful okay), so there is multiple tries to calculate average
// In addition to this, if you change semester, the page is not reloaded (thanks all-js menus) so I have to poll the page
setInterval(calculateAverage, 1000);
