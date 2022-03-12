function calculateAverage() {
    // gets the shadowRoot of the body (yes marks are in there idk why but they are)
    var root = document.querySelector("releve-but").shadowRoot;

    // Do not recalculate page if already done
    if (root.querySelectorAll('section[class="ue_data"]').length == 0) {
        var modulesMarks = 0.0;
        var modulesCoeffs = 0.0;
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
                    // console.log(UE, eval, mark, coeff);
                    addToUE(UE, eval, mark, coeff);
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
    
        // Generates the entire UE section
        if (root.querySelectorAll('section[class="ue_data"]').length == 0) {
            genUESection(UE, root);
        }
    }
}

function addToUE(UE, eval, mark, coeff) {
    var data = eval.querySelector('div[class="complement"]');

    // Iter through the eval info to find the UE it belongs to
    var infos = data.querySelectorAll("div");

    for (let index in infos) {
        if (infos[parseInt(index) + 1] != null && infos[index].innerHTML.includes("Poids") && parseFloat(infos[parseInt(index) + 1].innerText.trim()) != 0.0) {
            var UEName = infos[index].innerText.replace("Poids ", "").trim();
            var UEWeight = parseFloat(infos[parseInt(index) + 1].innerText.trim());
            break;
        }
    }
    
    if (UE[UEName] == undefined) {
        UE[UEName] = {"weight": UEWeight, "evals": []};
    }

    UE[UEName]["evals"].push({"mark": mark, "coeff": coeff, "elem": eval});
}

function genUESection(UE, root) {
    var main = root.querySelector('main[class="releve"]')
    
    var currentSection = main.appendChild(document.createElement('section'));
    currentSection.className = "ue_data";

    addTitle(currentSection, "UE");

    var UEContainer = currentSection.appendChild(document.createElement('div'));
    UEContainer.className = "evaluations";

    console.log(UE);
    for (var [key, value] of Object.entries(UE)) {
        addUE(UE, UEContainer, key, value);
    }

}

function addUE(UE, UEContainer, UEName, UE) {
    var module = UEContainer.appendChild(document.createElement('div'));
    module.id = "Module_" + UEName;
    module.addEventListener('click', function(event) {
        if (event.target.parentElement.className == "moduleOnOff") {
            event.target.parentElement.className = "";
        } else {
            event.target.parentElement.className = "moduleOnOff";
        }
    });
    
    module.innerHTML += `<div class="module">
            <h3>` + UEName + `</h3>
            <div>
                <div class="moyenne">Moyenne&nbsp;indicative&nbsp;:&nbsp;undefined</div>
                <div class="info">
                    Classe&nbsp;:&nbsp;undefined&nbsp;-
                    Max&nbsp;:&nbsp;undefined&nbsp;-
                    Min&nbsp;:&nbsp;undefined
                </div>
            </div>
            <div class="absences">
                <div>Abs&nbsp;inj.</div>
                <div>0</div>
                <div>Total</div>
                <div>0</div>
            </div>
            <div class="average_calculator" style="display: block !important">18.88</div>
        </div>`

    console.log(UE);
    for (var eval of UE["evals"]) {
        module.innerHTML += '<div class="eval">' + eval["elem"].innerHTML + '</div>';
    }
}

function addTitle(section, title) {
    section.innerHTML += `
    <div>
		<h2>` + title + `</h2>
		<div class="CTA_Liste">
			Liste <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M18 15l-6-6-6 6"></path>
			</svg>
		</div>
	</div>`;
}

// Js takes time to load (not mine, mine is beautiful okay), so there is multiple tries to calculate average
// In addition to this, if you change semester, the page is not reloaded (thanks all-js menus) so I have to poll the page
setInterval(calculateAverage, 1000);
