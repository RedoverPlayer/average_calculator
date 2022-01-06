for (var ue of document.getElementsByClassName("ue")) {
    for (var module of document.getElementsByClassName("module")) {
        var tmp = module.nextSibling;
        var avg = 0;
        var coeffs = 0;

        while (tmp != null && tmp.className == "eval") {
            var mark = parseFloat(tmp.getElementsByClassName("number")[0].innerText);
            var coeff = parseFloat(tmp.getElementsByClassName("number")[1].innerText);
            avg += mark * coeff;
            coeffs += coeff;
            tmp = tmp.nextSibling;
        }

        avg /= coeffs
        avg = Math.round(avg * 100) / 100;

        if (!isNaN(avg)) {
            module.querySelectorAll("td")[3].innerText = avg;
        }
    }

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
    }
}