// Calculates average
for (var ue of document.getElementsByClassName("ue")) {
    // Calculate average of each module
    for (var module of document.getElementsByClassName("module")) {
        var tmp = module.nextSibling;
        var avg = 0;
        var coeffs = 0;

        while (tmp != null && tmp.className == "eval") {
            var mark = parseFloat(tmp.getElementsByClassName("number")[0].innerText);
            var coeff = parseFloat(tmp.getElementsByClassName("number")[1].innerText);
            
            // verifies that the mark is ok
            if (!isNaN(mark) && !isNaN(coeff)) {
                avg += mark * coeff;
                coeffs += coeff;
            }

            tmp = tmp.nextSibling;
        }

        avg /= coeffs
        avg = Math.round(avg * 100) / 100;

        if (!isNaN(avg)) {
            module.querySelectorAll("td")[3].innerText = avg;
        }
    }

    // Calculates the average of each UE
    var tmp = ue.nextSibling;
    var avg = 0;
    var coeffs = 0;

    while (tmp != null && tmp.className != "ue") {
        if (tmp.className == "module" && tmp.querySelectorAll("td")[3].innerText.trim() != "") {
            var mark = parseFloat(tmp.querySelectorAll("td")[3].innerText);
            var coeff = parseFloat(tmp.querySelectorAll("td")[4].innerText);
            avg += mark * coeff;
            coeffs += coeff;
        }
        tmp = tmp.nextSibling;
    }

    avg /= coeffs
    avg = Math.round(avg * 100) / 100;

    if (!isNaN(avg)) {
        ue.querySelectorAll("td")[3].innerText = avg;
        ue.querySelectorAll("td")[3].className = "number";
    }
}

// Calculates the global average
var avg = 0;
var coeffs = 0;
for (var ue of document.getElementsByClassName("ue")) {
    var mark = parseFloat(ue.getElementsByClassName("number")[0].innerText);
    var coeff = parseFloat(ue.getElementsByClassName("number")[1].innerText);
    
    if (!isNaN(mark) && !isNaN(coeff)) {
        avg += mark * coeff;
        coeffs += coeff;
    }
}

avg /= coeffs
avg = Math.round(avg * 100) / 100;
// console.log(avg);
document.querySelector("table").parentElement.innerHTML += '<div style="text-align: center; font-size: 24px; color: black; margin-top: 20px; background-color: white; border: 1px black solid; padding: 4px;">Moyenne générale : ' + avg + '</div>';
