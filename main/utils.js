/**
 * Triggers the loading animation
 */
function loading() {
    document.querySelector('div#loading').className = 'spinner-grow';
}

/**
 * Stops the loading animation
 */
function loaded() {
    document.querySelector('div#loading').className = 'd-none';
}

function fetchNoteData(eval, ressourceCode, ressourceTitle) {
    displayNotesData(null, eval, ressourceCode, ressourceTitle);
    fetch(`https://${localStorage.getItem('siteUrl')}/services/data.php?q=listeNotes&eval=${eval.id}`)
        .then(response => response.json()).then(data => {
            displayNotesData(data, eval, ressourceCode, ressourceTitle);
        });
}

function displayNotesData(data, eval, ressourceCode, ressourceTitle) {
    const notesReparTitle = document.getElementById('notesrepar-title');
    const notesReparDescription = document.getElementById('notesrepar-description');
    const notesReparData = document.getElementById('notesrepar-data');
    const notesReparIndex = document.getElementById('notesrepar-index');
    const notesReparMin = document.getElementById('notesrepar-min');
    const notesReparMoy = document.getElementById('notesrepar-moy');
    const notesReparMax = document.getElementById('notesrepar-max');
    const notesReparMed = document.getElementById('notesrepar-med');
    const notesReparCoef = document.getElementById('notesrepar-coef');
    const notesReparNote = document.getElementById('notesrepar-note');
    const notesReparPosition = document.getElementById('notesrepar-position');

    notesReparTitle.innerText = 'Chargement';
    notesReparDescription.innerText = '';
    notesReparData.innerHTML = ''; 
    notesReparIndex.innerHTML = '';
    notesReparMin.innerHTML = ` --.--`;
    notesReparMoy.innerHTML = ` --.--`;
    notesReparMax.innerHTML = ` --.--`;
    notesReparMed.innerHTML = ` --.--`;
    notesReparCoef.innerHTML = ``;
    notesReparNote.innerHTML = '';
    notesReparPosition.innerHTML = '';

    // for i in 20
    for (let i = 0; i <= 20; i++) {
        const noteIndex = document.createElement('div');
        if (Math.trunc(eval.note.value) == i) {
            noteIndex.style.borderBottom = '1px solid white';
        }
        noteIndex.style.width = '1.1rem';
        noteIndex.innerText = i;
        notesReparIndex.appendChild(noteIndex);
    }

    if (!data) return
    
    const newData = [];
    for (const note of data) {
        if (isNaN(parseFloat(note))) continue;
        newData.push(parseFloat(note.toFixed(2)));
    }
    data = newData;

    notesReparTitle.innerText = eval.description;
    notesReparDescription.innerText = ressourceCode + ' - ' + ressourceTitle;

    notesReparMin.innerHTML = ` ${eval.note.min}`;
    notesReparMoy.innerHTML = ` ${eval.note.moy}`;
    notesReparMax.innerHTML = ` ${eval.note.max}`;
    notesReparCoef.innerHTML = ` Coef. ${eval.coef}`;

    // list with 20 elems to store number of notes
    const notes = Array(21).fill(0);
    
    // for note in data, if note most close to a number in notes, add 1 to the number in notes
    for (const note of data) {
        const noteNum = parseFloat(note);
        if (!isNaN(noteNum)) {
            const index = Math.trunc(noteNum);
            notes[index] += 1;
        }
    }

    // Calculate median of notes
    data.sort((a, b) => a - b);
    
    let median = 0.0;
    if (data.length > 0) {
        if (data.length % 2 === 0) {
            median = (data[data.length / 2] + data[data.length / 2 + 1]) / 2;
        } else {
            median = data[Math.floor(data.length / 2)];
        }
    }

    // Calculate position of user's note
    const lastPosition = data.length - (data.indexOf(parseFloat(eval.note.value)));
    const firstPosition = data.length - (data.lastIndexOf(parseFloat(eval.note.value)));

    notesReparNote.innerHTML = `${eval.note.value}`;
    if (lastPosition === firstPosition) {
        notesReparPosition.innerHTML = `${firstPosition}/${data.length}`;
    } else {
        notesReparPosition.innerHTML = `${firstPosition}-${lastPosition}/${data.length}`;
    }

    // Display user position bar
    const notesReparRangeSuperior = document.getElementById('notesrepar-range-superior');
    const notesReparRangeCurrent = document.getElementById('notesrepar-range-current');
    const notesReparRangeInferior = document.getElementById('notesrepar-range-inferior');

    notesReparRangeSuperior.style.width = `${(firstPosition - 1) / data.length * 100}%`;
    notesReparRangeCurrent.style.width = `${(lastPosition - firstPosition + 1) / data.length * 100}%`;
    notesReparRangeInferior.style.width = `${(data.length - lastPosition) / data.length * 100}%`;

    median = median.toFixed(2);
    notesReparMed.innerHTML = ` ${median.padStart(5, '0')}`;

    // normalize notes
    const heightUnit = 20 / Math.max(...notes);

    // add notes to notesrepar-data
    let currNote = 0;
    for (const noteNum of notes) {
        const noteDiv = document.createElement('div');
        noteDiv.style.width = '1.1rem';
        noteDiv.style.height = `${noteNum * heightUnit}rem`;

        if (currNote >= 10) {
            noteDiv.style.backgroundColor = '#7171f4';
            noteDiv.style.backgroundColor = 'rgb(25, 135, 84)';
        } else if (currNote >= 8) {
            noteDiv.style.backgroundColor = 'rgb(182, 117, 0)';
        } else {
            noteDiv.style.backgroundColor = 'rgb(180, 0, 0)';
        }

        if (noteNum !== 0) {
            noteDiv.innerText = noteNum;
        }

        notesReparData.appendChild(noteDiv);
        currNote += 1;
    }
}