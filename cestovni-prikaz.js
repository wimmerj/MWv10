// Cestovní příkaz - JavaScript logika

document.addEventListener('DOMContentLoaded', function() {
    const dnesDate = new Date().toISOString().split('T')[0];
    document.getElementById('odjezdDatum').value = dnesDate;

    document.getElementById('generovat').addEventListener('click', generovatCP);
});

function generovatCP() {
    const data = {
        pocatek: document.getElementById('pocatek').value || 'Plzeň',
        odjezdDatum: document.getElementById('odjezdDatum').value,
        odjezdCas: document.getElementById('odjezdCas').value,
        mistoJednani: document.getElementById('mistoJednani').value || 'Klatovy',
        prijezdCas: document.getElementById('prijezdCas').value,
        konecVykonu: document.getElementById('konecVykonu').value,
        prijezdCasZpet: document.getElementById('prijezdCasZpet').value,
        ucelCesty: document.getElementById('ucelCesty').value || 'Kontrola zab.zar.',
        doprava: document.getElementById('doprava').value
    };

    if (!data.odjezdDatum) {
        alert('Prosím vyplňte datum odjezdu');
        return;
    }

    const formatovanyDatum = formatovatDatum(data.odjezdDatum);

    // Vyplnění Tabulky 1: Žádost o cestovní příkaz
    document.getElementById('t1-odjezd-datum').textContent = formatovanyDatum;
    document.getElementById('t1-odjezd-cas').textContent = data.odjezdCas;
    document.getElementById('t1-pocatek').textContent = data.pocatek;
    document.getElementById('t1-prijezd-datum').textContent = formatovanyDatum;
    document.getElementById('t1-prijezd-cas').textContent = data.prijezdCasZpet;
    document.getElementById('t1-konec').textContent = data.pocatek; // Plánovaný konec = stejný jako počátek
    document.getElementById('t1-misto').textContent = data.mistoJednani;
    document.getElementById('t1-ucel').textContent = data.ucelCesty;
    document.getElementById('t1-doprava').textContent = data.doprava;

    // Vyplnění Tabulky 2: Přesun na služební cestu
    document.getElementById('t2-odjezd-datum').textContent = formatovanyDatum;
    document.getElementById('t2-odjezd-cas').textContent = data.odjezdCas;
    document.getElementById('t2-prijezd-cas').textContent = data.prijezdCas;
    document.getElementById('t2-pocatek').textContent = data.pocatek;
    document.getElementById('t2-konec').textContent = data.mistoJednani;
    document.getElementById('t2-doprava').textContent = data.doprava;

    // Vyplnění Tabulky 3: Detail pracovního výkonu
    document.getElementById('t3-datum').textContent = formatovanyDatum;
    document.getElementById('t3-pocatek').textContent = data.prijezdCas;
    document.getElementById('t3-konec').textContent = data.konecVykonu;
    document.getElementById('t3-misto').textContent = data.mistoJednani;

    // Vyplnění Tabulky 4: Přesun zpět ze služební cesty
    document.getElementById('t4-odjezd-datum').textContent = formatovanyDatum;
    document.getElementById('t4-odjezd-cas').textContent = data.konecVykonu;
    document.getElementById('t4-prijezd-cas').textContent = data.prijezdCasZpet;
    document.getElementById('t4-pocatek').textContent = data.mistoJednani;
    document.getElementById('t4-konec').textContent = data.pocatek;
    document.getElementById('t4-doprava').textContent = data.doprava;

    // Vyplnění Tabulky 5: Detail pobytu na služební cestě
    document.getElementById('t5-datum').textContent = formatovanyDatum;
    document.getElementById('t5-od').textContent = data.odjezdCas;        // Pobyt od = Odjezd čas
    document.getElementById('t5-do').textContent = data.prijezdCasZpet;   // Pobyt do = Příjezd čas zpět
    document.getElementById('t5-misto').textContent = data.mistoJednani;

    document.getElementById('results').style.display = 'block';

    document.getElementById('results').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });

    const button = document.getElementById('generovat');
    const originalText = button.textContent;
    button.textContent = '✓ Vygenerováno!';
    button.style.background = 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 2000);
}

function formatovatDatum(datum) {
    // Převod z YYYY-MM-DD na DD.MM.YYYY
    const [rok, mesic, den] = datum.split('-');
    return `${den}.${mesic}.${rok}`;
}

// Automatické vyplnění příkladových dat při načtení stránky
window.addEventListener('load', function() {
    // Můžeme povolit auto-vyplnění pro demo účely
    // setTimeout(() => {
    //     document.getElementById('pocatek').value = 'Plzeň';
    //     document.getElementById('mistoJednani').value = 'Klatovy';
    //     document.getElementById('ucelCesty').value = 'Kontrola zab.zar.';
    //     document.getElementById('doprava').value = 'AUS';
    // }, 100);
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + Enter pro generování
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        generovatCP();
    }
    
    // Ctrl + P pro tisk
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        window.print();
    }
});

// zajištění logického pořadí časů
document.getElementById('odjezdCas').addEventListener('change', validovatCasy);
document.getElementById('prijezdCas').addEventListener('change', validovatCasy);
document.getElementById('konecVykonu').addEventListener('change', validovatCasy);
document.getElementById('prijezdCasZpet').addEventListener('change', validovatCasy);

function validovatCasy() {
    const odjezd = document.getElementById('odjezdCas').value;
    const prijezd = document.getElementById('prijezdCas').value;
    const konec = document.getElementById('konecVykonu').value;
    const zpet = document.getElementById('prijezdCasZpet').value;
    
    // příjezd po odjezdu
    if (odjezd && prijezd && odjezd >= prijezd) {
        document.getElementById('prijezdCas').style.borderColor = '#ff5722';
        console.warn('Příjezd musí být po odjezdu');
    } else {
        document.getElementById('prijezdCas').style.borderColor = '';
    }
    
    // Konec výkonu po příjezdu
    if (prijezd && konec && prijezd >= konec) {
        document.getElementById('konecVykonu').style.borderColor = '#ff5722';
        console.warn('Konec výkonu musí být po příjezdu');
    } else {
        document.getElementById('konecVykonu').style.borderColor = '';
    }
    
    // Příjezd zpět po konci výkonu
    if (konec && zpet && konec >= zpet) {
        document.getElementById('prijezdCasZpet').style.borderColor = '#ff5722';
        console.warn('Příjezd zpět musí být po konci výkonu');
    } else {
        document.getElementById('prijezdCasZpet').style.borderColor = '';
    }
}

// Funkce pro zobrazení kódu do konzole F12
function showConsoleCode(formType) {
    const codeSection = document.getElementById('console-code');
    const codeOutput = document.getElementById('code-output');
    
    let code = '';
    let values = [];
    let formName = '';
    
    // Získání aktuálních hodnot z tabulek a názvu formuláře
    switch(formType) {
        case 'zadost':
            formName = 'Žádost o cestovní příkaz';
            // Žádost o cestovní příkaz
            values = [
                document.getElementById('t1-odjezd-datum').textContent,
                document.getElementById('t1-odjezd-cas').textContent,
                document.getElementById('t1-pocatek').textContent,
                document.getElementById('t1-prijezd-datum').textContent,
                document.getElementById('t1-prijezd-cas').textContent,
                document.getElementById('t1-konec').textContent,
                document.getElementById('t1-misto').textContent,
                document.getElementById('t1-ucel').textContent
            ];
            
            const doprava1 = document.getElementById('t1-doprava').textContent;
            const transportOption1 = doprava1.toLowerCase().includes('vlak') ? 'R-Vlak / O-Osobní vlak' : 'AUS-Auto služební';
            
            code = `function fillInputsAfterLabel(labelText, values) {
    // Najdi label podle textu
    var labels = document.querySelectorAll('label');
    for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        if (label.textContent.trim().includes(labelText)) {
            var inputId = label.getAttribute('for');
            var firstInput = inputId ? document.getElementById(inputId) : null;
            if (firstInput) {
                // Najdi všechna textová pole v dokumentu
                var allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
                // Najdi index prvního pole
                var startIndex = allInputs.indexOf(firstInput);
                // Vyplň postupně pole podle pořadí
                for (var j = 0; j < values.length; j++) {
                    if (allInputs[startIndex + j]) {
                        allInputs[startIndex + j].value = values[j];
                    }
                }
            }
        }
    }
}

function processTransportSelection() {
    // Krok 1: Otevření dialogu seznamu
    var transportMenuLabel = Array.from(document.querySelectorAll('label')).find(label => label.textContent.trim() === "Určené dopravní prostředky");

    if (transportMenuLabel) {
        var menuCell = transportMenuLabel.closest('.ui-grid-row');
        var plusButton = menuCell.querySelector('.ui-menuitem-link .fa.fa-plus');

        if (plusButton) {
            plusButton.click();
            console.log("Dialog 'Určené dopravní prostředky' byl otevřen.");
        } else {
            console.log("Tlačítko nebylo nalezeno v menu 'Určené dopravní prostředky'.");
            return; // Ukonči funkci, pokud tlačítko nebylo nalezeno
        }
    } else {
        console.log("Menu 'Určené dopravní prostředky' nebylo nalezeno.");
        return; // Ukonči funkci, pokud menu nebylo nalezeno
    }

    // Krok 2: Vybrání AUS nebo vlak ze seznamu
    setTimeout(function() {
        var dropdownId = '_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm:j_idt2518';
        var escapedDropdownId = dropdownId.replace(/(:|\\.|\\[|\\]|\\/)/g, '\\\\$1');
        var dropdown = document.querySelector('#' + escapedDropdownId);

        if (dropdown) {
            var trigger = dropdown.querySelector('.ui-selectonemenu-trigger');
            if (trigger) {
                trigger.click(); // Otevři seznam
            }

            var items = dropdown.querySelectorAll('option');
            var itemToSelect = Array.from(items).find(item => item.textContent.trim() === "${transportOption1}");

            if (itemToSelect) {
                itemToSelect.selected = true; // Nastav jako vybranou
                dropdown.querySelector('select').dispatchEvent(new Event('change')); // Vyvolej událost 'change'
                console.log("Položka '${transportOption1}' byla vybrána.");
            } else {
                console.log("Položka '${transportOption1}' nebyla nalezena.");
            }
        } else {
            console.log("Rozevírací seznam nebyl nalezen.");
        }

        // Krok 3: Uložit
        executeSave();

    }, 1000); // Časový limit pro zpoždění
}

// Definuj funkci pro uložení
function executeSave() {
    PrimeFaces.ab({
        s: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm:j_idt2512",
        f: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm",
        p: "@widgetVar(editTransportTypeDlg)",
        u: "@widgetVar(editTransportTypeDlg) @widgetVar(transportTypesTable) @widgetVar(transportTypesTable4TWT) @widgetVar(growl)",
        onst: function(cfg) {
            startBlock();
        },
        onco: function(xhr, status, args, data) {
            stopBlock();
            console.log("Úspěšně uloženo.");
        }
    });
}

// Hodnoty (Odjezd datum a čas, Počátek pracovní cesty, Příjezd datum a čas, Plánovaný konec pracovní cesty, Místo jednání, Účel cesty):
fillInputsAfterLabel("Odjezd", [${values.map(v => `"${v}"`).join(', ')}]);

// Zavolej funkci pro výběr dopravního prostředku
processTransportSelection();`;
            break;
            
        case 'presun-tam':
            formName = 'Přesun na služební cestu';
            values = [
                document.getElementById('t2-odjezd-datum').textContent,
                document.getElementById('t2-odjezd-cas').textContent,
                document.getElementById('t2-prijezd-cas').textContent,
                document.getElementById('t2-pocatek').textContent,
                document.getElementById('t2-konec').textContent
            ];
            
            const doprava2 = document.getElementById('t2-doprava').textContent;
            const transportOption2 = doprava2.toLowerCase().includes('vlak') ? 'R-Vlak / O-Osobní vlak' : 'AUS-Auto služební';
            
            code = `function fillInputsAfterLabel(labelText, values) {
    var labels = document.querySelectorAll('label');
    for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        if (label.textContent.trim().includes(labelText)) {
            var inputId = label.getAttribute('for');
            var firstInput = inputId ? document.getElementById(inputId) : null;
            if (firstInput) {
                var allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
                var startIndex = allInputs.indexOf(firstInput);
                for (var j = 0; j < values.length; j++) {
                    if (allInputs[startIndex + j]) {
                        allInputs[startIndex + j].value = values[j];
                    }
                }
            }
        }
    }
}

function clickTransportPlusButton() {
    try {
        // Najdeme buňku s textem "Dopravní prostředky"
        const transportCell = Array.from(document.querySelectorAll('.ui-panelgrid-cell'))
            .find(cell => cell.textContent.trim() === 'Dopravní prostředky');
        
        if (!transportCell) {
            console.log('❌ Buňka s textem "Dopravní prostředky" nebyla nalezena');
            return false;
        }

        // Získáme rodičovský řádek
        const parentRow = transportCell.closest('.ui-grid-row');
        
        if (!parentRow) {
            console.log('❌ Nepodařilo se najít rodičovský řádek');
            return false;
        }

        // V tomto řádku hledáme tlačítko s ikonou plus
        const plusButton = parentRow.querySelector('a[title="Přidat"]');
        
        if (plusButton) {
            console.log('✅ Tlačítko plus bylo nalezeno');
            plusButton.click();
            console.log('✅ Bylo kliknuto na tlačítko plus');
            return true;
        } else {
            console.log('❌ Tlačítko plus nebylo nalezeno');
            // Pro diagnostiku vypíšeme všechna tlačítka v řádku
            const allButtons = parentRow.querySelectorAll('a');
            console.log('Dostupná tlačítka v řádku:');
            allButtons.forEach(button => {
                console.log('Tlačítko:', button.title, button);
            });
            return false;
        }
    } catch (error) {
        console.error('❌ Došlo k chybě:', error);
        return false;
    }
}

function processTransportSelection() {
    // Krok 1: Otevření dialogu seznamu
    if (!clickTransportPlusButton()) {
        return; // Ukonči funkci, pokud se nepodařilo otevřít dialog
    }

    // Krok 2: Vybrání AUS nebo vlak ze seznamu
    setTimeout(function() {
        var dropdownId = '_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm:j_idt2518';
        var escapedDropdownId = dropdownId.replace(/(:|\\.|\\[|\\]|\\/)/g, '\\\\$1');
        var dropdown = document.querySelector('#' + escapedDropdownId);

        if (dropdown) {
            var trigger = dropdown.querySelector('.ui-selectonemenu-trigger');
            if (trigger) {
                trigger.click(); // Otevři seznam
            }

            var items = dropdown.querySelectorAll('option');
            var itemToSelect = Array.from(items).find(item => item.textContent.trim() === "${transportOption2}");

            if (itemToSelect) {
                itemToSelect.selected = true; // Nastav jako vybranou
                dropdown.querySelector('select').dispatchEvent(new Event('change')); // Vyvolej událost 'change'
                console.log("Položka '${transportOption2}' byla vybrána.");
            } else {
                console.log("Položka '${transportOption2}' nebyla nalezena.");
            }
        } else {
            console.log("Rozevírací seznam nebyl nalezen.");
        }

        // Krok 3: Uložit
        executeSave();

    }, 1000); // Časový limit pro zpoždění
}

// Definuj funkci pro uložení
function executeSave() {
    PrimeFaces.ab({
        s: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm:j_idt2512",
        f: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm",
        p: "@widgetVar(editTransportTypeDlg)",
        u: "@widgetVar(editTransportTypeDlg) @widgetVar(transportTypesTable) @widgetVar(transportTypesTable4TWT) @widgetVar(growl)",
        onst: function(cfg) {
            startBlock();
        },
        onco: function(xhr, status, args, data) {
            stopBlock();
            console.log("Úspěšně uloženo.");
        }
    });
}

// Hodnoty (Odjezd datum a čas, Příjezd čas, Počátek cesty, Konec cesty):
fillInputsAfterLabel("Datum", [${values.map(v => `"${v}"`).join(', ')}]);

// Zavolej funkci pro výběr dopravního prostředku
processTransportSelection();`;
            break;
            
        case 'vykon':
            formName = 'Detail pracovního výkonu';
            values = [
                document.getElementById('t3-datum').textContent,
                document.getElementById('t3-pocatek').textContent,
                document.getElementById('t3-konec').textContent,
                document.getElementById('t3-misto').textContent
            ];
            
            code = `function fillInputsAfterLabel(labelText, values) {
    var labels = document.querySelectorAll('label');
    for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        if (label.textContent.trim().includes(labelText)) {
            var inputId = label.getAttribute('for');
            var firstInput = inputId ? document.getElementById(inputId) : null;
            if (firstInput) {
                var allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
                var startIndex = allInputs.indexOf(firstInput);
                for (var j = 0; j < values.length; j++) {
                    if (allInputs[startIndex + j]) {
                        allInputs[startIndex + j].value = values[j];
                    }
                }
            }
        }
    }
}

// Hodnoty (Datum, Počátek prac. výkonu, Konec prac. výkonu, Místo jednání):
fillInputsAfterLabel("Datum", [${values.map(v => `"${v}"`).join(', ')}]);`;
            break;
            
        case 'presun-zpet':
            formName = 'Přesun zpět ze služební cesty';
            values = [
                document.getElementById('t4-odjezd-datum').textContent,
                document.getElementById('t4-odjezd-cas').textContent,
                document.getElementById('t4-prijezd-cas').textContent,
                document.getElementById('t4-pocatek').textContent,
                document.getElementById('t4-konec').textContent
            ];
            
            const doprava4 = document.getElementById('t4-doprava').textContent;
            const transportOption4 = doprava4.toLowerCase().includes('vlak') ? 'R-Vlak / O-Osobní vlak' : 'AUS-Auto služební';
            
            code = `function fillInputsAfterLabel(labelText, values) {
    var labels = document.querySelectorAll('label');
    for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        if (label.textContent.trim().includes(labelText)) {
            var inputId = label.getAttribute('for');
            var firstInput = inputId ? document.getElementById(inputId) : null;
            if (firstInput) {
                var allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
                var startIndex = allInputs.indexOf(firstInput);
                for (var j = 0; j < values.length; j++) {
                    if (allInputs[startIndex + j]) {
                        allInputs[startIndex + j].value = values[j];
                    }
                }
            }
        }
    }
}

function clickTransportPlusButton() {
    try {
        // Najdeme buňku s textem "Dopravní prostředky"
        const transportCell = Array.from(document.querySelectorAll('.ui-panelgrid-cell'))
            .find(cell => cell.textContent.trim() === 'Dopravní prostředky');
        
        if (!transportCell) {
            console.log('❌ Buňka s textem "Dopravní prostředky" nebyla nalezena');
            return false;
        }

        // Získáme rodičovský řádek
        const parentRow = transportCell.closest('.ui-grid-row');
        
        if (!parentRow) {
            console.log('❌ Nepodařilo se najít rodičovský řádek');
            return false;
        }

        // V tomto řádku hledáme tlačítko s ikonou plus
        const plusButton = parentRow.querySelector('a[title="Přidat"]');
        
        if (plusButton) {
            console.log('✅ Tlačítko plus bylo nalezeno');
            plusButton.click();
            console.log('✅ Bylo kliknuto na tlačítko plus');
            return true;
        } else {
            console.log('❌ Tlačítko plus nebylo nalezeno');
            // Pro diagnostiku vypíšeme všechna tlačítka v řádku
            const allButtons = parentRow.querySelectorAll('a');
            console.log('Dostupná tlačítka v řádku:');
            allButtons.forEach(button => {
                console.log('Tlačítko:', button.title, button);
            });
            return false;
        }
    } catch (error) {
        console.error('❌ Došlo k chybě:', error);
        return false;
    }
}

function processTransportSelection() {
    // Krok 1: Otevření dialogu seznamu
    if (!clickTransportPlusButton()) {
        return; // Ukonči funkci, pokud se nepodařilo otevřít dialog
    }

    // Krok 2: Vybrání AUS nebo vlak ze seznamu
    setTimeout(function() {
        var dropdownId = '_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm:j_idt2518';
        var escapedDropdownId = dropdownId.replace(/(:|\\.|\\[|\\]|\\/)/g, '\\\\$1');
        var dropdown = document.querySelector('#' + escapedDropdownId);

        if (dropdown) {
            var trigger = dropdown.querySelector('.ui-selectonemenu-trigger');
            if (trigger) {
                trigger.click(); // Otevři seznam
            }

            var items = dropdown.querySelectorAll('option');
            var itemToSelect = Array.from(items).find(item => item.textContent.trim() === "${transportOption4}");

            if (itemToSelect) {
                itemToSelect.selected = true; // Nastav jako vybranou
                dropdown.querySelector('select').dispatchEvent(new Event('change')); // Vyvolej událost 'change'
                console.log("Položka '${transportOption4}' byla vybrána.");
            } else {
                console.log("Položka '${transportOption4}' nebyla nalezena.");
            }
        } else {
            console.log("Rozevírací seznam nebyl nalezen.");
        }

        // Krok 3: Uložit
        executeSave();

    }, 1000); // Časový limit pro zpoždění
}

// Definuj funkci pro uložení
function executeSave() {
    PrimeFaces.ab({
        s: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm:j_idt2512",
        f: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm",
        p: "@widgetVar(editTransportTypeDlg)",
        u: "@widgetVar(editTransportTypeDlg) @widgetVar(transportTypesTable) @widgetVar(transportTypesTable4TWT) @widgetVar(growl)",
        onst: function(cfg) {
            startBlock();
        },
        onco: function(xhr, status, args, data) {
            stopBlock();
            console.log("Úspěšně uloženo.");
        }
    });
}

// Hodnoty (Odjezd datum a čas, Příjezd čas, Počátek cesty, Konec cesty):
fillInputsAfterLabel("Datum", [${values.map(v => `"${v}"`).join(', ')}]);

// Zavolej funkci pro výběr dopravního prostředku
processTransportSelection();`;
            break;
            
        case 'pobyt':
            formName = 'Detail pobytu na služební cestě';
            // Detail pobytu na služební cestě
            values = [
                document.getElementById('t5-datum').textContent,
                document.getElementById('t5-od').textContent,
                document.getElementById('t5-do').textContent,
                document.getElementById('t5-misto').textContent
            ];
            
            code = `function fillInputsAfterLabel(labelText, values) {
    var labels = document.querySelectorAll('label');
    for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        if (label.textContent.trim().includes(labelText)) {
            var inputId = label.getAttribute('for');
            var firstInput = inputId ? document.getElementById(inputId) : null;
            if (firstInput) {
                var allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
                var startIndex = allInputs.indexOf(firstInput);
                for (var j = 0; j < values.length; j++) {
                    if (allInputs[startIndex + j]) {
                        allInputs[startIndex + j].value = values[j];
                    }
                }
            }
        }
    }
}

// Hodnoty (Datum, Pobyt od, Pobyt do, Místo pobytu):
fillInputsAfterLabel("Datum", [${values.map(v => `"${v}"`).join(', ')}]);`;
            break;
    }
    
    // Aktualizace návodu
    const codeInfo = codeSection.querySelector('.code-info');
    codeInfo.innerHTML = `
        <p><strong>1. Otevřete příslušný formulář v systému žádostí o CP - ${formName}</strong></p>
        <p><strong>2a. Stiskněte F12 na klávesnici</strong></p>
        <p><strong>2b. V horním panelu vyberte Console <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='16' height='16'%3E%3Cpath fill='currentColor' d='M2 1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zm0 1v12h12V2H2zm2 2h8v1H4V4zm0 2h8v1H4V6zm0 2h8v1H4V8zm0 2h5v1H4v-1z'/%3E%3C/svg%3E" alt="Console ikona" style="vertical-align: middle; margin: 0 2px;"/></strong> (pravděpodobně se při prvním spuštění budete nacházet na záložce Sources <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='16' height='16'%3E%3Cpath fill='currentColor' d='M12 4.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5V5a.5.5 0 0 1 .5-.5h8zm-8 7V5H4v6.5zm8-6.5H5v6h7V5z'/%3E%3Cpath fill='currentColor' d='M8 10.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z'/%3E%3C/svg%3E" alt="Sources ikona (brouk)" style="vertical-align: middle; margin: 0 2px;"/>)</p>
        <p><strong>2c. V konzoli z bezpečnostních důvodů nefunguje vkládání, napište tedy "Allow pasting"</strong> (toto je třeba udělat jen při prvním spuštění)</p>
        <p><strong>3. Vložte níže uvedený kód</strong> do konzole a stiskněte Enter</p>
        <p><strong>4. V žádném případě během procesu automatického vyplňování na nic neklikejte až do jeho dokončení. Pokud je potřeba ukončit proces auto vyplňování, stiskněte klávesu Esc.</strong></p>
    `;
    
    codeOutput.value = code;
    codeSection.style.display = 'block';
    
    codeSection.scrollIntoView({ behavior: 'smooth' });
}

// Funkce pro skrytí kódu
function hideConsoleCode() {
    document.getElementById('console-code').style.display = 'none';
}

// Funkce pro kopírování do schránky
function copyToClipboard() {
    const codeOutput = document.getElementById('code-output');
    codeOutput.select();
    codeOutput.setSelectionRange(0, 99999); // Pro mobil
    
    try {
        document.execCommand('copy');
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = '✓ Zkopírováno!';
        button.style.background = '#4caf50';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    } catch (err) {
        console.error('Chyba při kopírování: ', err);
        alert('Nepodařilo se zkopírovat. Zkuste to manuálně.');
    }
}

// Funkce pro automatické vyplnění všech 4 tabulek (bez žádosti o CP)
function generateAutoFillScript() {
    // Získání dat z formuláře
    const data = {
        odjezdDatum: document.getElementById('odjezdDatum').value,
        odjezdCas: document.getElementById('odjezdCas').value,
        prijezdCas: document.getElementById('prijezdCas').value,
        konecVykonu: document.getElementById('konecVykonu').value,
        prijezdCasZpet: document.getElementById('prijezdCasZpet').value,
        pocatek: document.getElementById('pocatek').value || 'Plzeň',
        mistoJednani: document.getElementById('mistoJednani').value || 'Klatovy',
        doprava: document.getElementById('doprava').value
    };

    if (!data.odjezdDatum) {
        alert('Prosím vyplňte data formuláře před generováním automatického scriptu');
        return;
    }

    const formatovanyDatum = formatovatDatum(data.odjezdDatum);
    const transportOption = data.doprava.toLowerCase().includes('vlak') ? 'R-Vlak / O-Osobní vlak' : 'AUS-Auto služební';

    // Generování kompletního scriptu
    const script = `
// Automatické vyplnění všech 4 tabulek cestovního příkazu
// Krok 1: Přepnutí na záložku Vyúčtování
function switchToVyuctovani() {
    try {
        let found = false;
        
        // První pokus - přímé hledání podle struktury
        const tab = document.querySelector('li[role="tab"] > a[href*="travelDetailTabView"]');
        if (tab && tab.textContent.trim() === 'Vyúčtování') {
            tab.click();
            console.log('✅ Záložka "Vyúčtování" byla nalezena a bylo na ni kliknuto');
            console.log('Nalezený element:', tab);
            found = true;
        }

        // Druhý pokus - hledání přes všechny záložky
        if (!found) {
            const tabs = Array.from(document.querySelectorAll('li.ui-tabs-header a'));
            const vyuctovaniTab = tabs.find(el => el.textContent.trim() === 'Vyúčtování');
            if (vyuctovaniTab) {
                vyuctovaniTab.click();
                console.log('✅ Záložka "Vyúčtování" byla nalezena a bylo na ni kliknuto (metoda 2)');
                console.log('Nalezený element:', vyuctovaniTab);
                found = true;
            }
        }

        // Pokud nebyla záložka nalezena, vypíšeme diagnostické informace
        if (!found) {
            console.log('❌ Záložka "Vyúčtování" nebyla nalezena');
            console.log('Seznam všech nalezených záložek:');
            document.querySelectorAll('li.ui-tabs-header a').forEach(tab => {
                console.log(tab.textContent.trim(), tab);
            });
            return false;
        }
        return true;
    } catch (error) {
        console.error('❌ Došlo k chybě:', error);
        return false;
    }
}

// Krok 2: Označení řádku s cestovním příkazem
function selectTravelOrderRow() {
    try {
        // Hledáme td element obsahující text "SC plánovaná od"
        const cells = Array.from(document.querySelectorAll('td[role="gridcell"]'));
        const targetCell = cells.find(cell => cell.textContent.includes('SC plánovaná od'));

        if (targetCell) {
            targetCell.click();
            console.log('✅ Buňka obsahující "SC plánovaná od" byla nalezena a bylo na ni kliknuto');
            console.log('Nalezený text:', targetCell.textContent.trim());
            console.log('Nalezený element:', targetCell);
            return true;
        } else {
            console.log('❌ Buňka obsahující "SC plánovaná od" nebyla nalezena');
            console.log('Seznam všech buněk tabulky:');
            cells.forEach(cell => {
                console.log(cell.textContent.trim());
            });
            return false;
        }
    } catch (error) {
        console.error('❌ Došlo k chybě:', error);
        return false;
    }
}

// Krok 3: Otevření formuláře pro přidání přesunu na SC
function openAddTransportForm() {
    try {
        // Hledáme tlačítko pro přidání přesunu podle title atributu
        const addTransportButton = document.querySelector('a[title="Přidat přesun na SC"]');
        
        if (addTransportButton) {
            addTransportButton.click();
            console.log('✅ Tlačítko "Přidat přesun na SC" bylo nalezeno a bylo na něj kliknuto');
            console.log('Nalezený element:', addTransportButton);
            return true;
        } else {
            // Pokud se nepodařilo najít tlačítko přímo, zkusíme alternativní způsob
            const allMenuItems = Array.from(document.querySelectorAll('.ui-menuitem a'));
            const transportButton = allMenuItems.find(item => item.title === 'Přidat přesun na SC');
            
            if (transportButton) {
                transportButton.click();
                console.log('✅ Tlačítko "Přidat přesun na SC" bylo nalezeno alternativní metodou a bylo na něj kliknuto');
                console.log('Nalezený element:', transportButton);
                return true;
            } else {
                console.log('❌ Tlačítko "Přidat přesun na SC" nebylo nalezeno');
                // Vypíšeme všechna dostupná tlačítka pro diagnostiku
                console.log('Dostupná tlačítka v menu:');
                document.querySelectorAll('.ui-menuitem a').forEach(button => {
                    console.log('Tlačítko:', button.title, button);
                });
                return false;
            }
        }
    } catch (error) {
        console.error('❌ Došlo k chybě:', error);
        return false;
    }
}

// Hlavní funkce pro spuštění celého procesu
function startAutoFill() {
    console.log('🚀 Spouštím automatické vyplnění cestovního příkazu...');
    
    // Krok 1: Přepnutí na záložku Vyúčtování
    if (!switchToVyuctovani()) {
        console.error('❌ Nepodařilo se přepnout na záložku Vyúčtování');
        return;
    }
    
    // Čekáme na načtení záložky
    setTimeout(() => {
        // Krok 2: Označení řádku s cestovním příkazem
        if (!selectTravelOrderRow()) {
            console.error('❌ Nepodařilo se označit řádek s cestovním příkazem');
            return;
        }
        
        // Čekáme na aktivaci řádku
        setTimeout(() => {
            // Krok 3: Otevření formuláře pro přidání přesunu
            if (!openAddTransportForm()) {
                console.error('❌ Nepodařilo se otevřít formulář pro přidání přesunu');
                return;
            }
            
            console.log('✅ První fáze dokončena, čekám na načtení formuláře...');
            // Pokračujeme dalším krokem - vyplnění formuláře "Přesun tam"
            setTimeout(() => {
                fillPresuNaTamForm();
            }, 2000); // Čekání na načtení formuláře
            
        }, 1500); // Čekání na aktivaci řádku
    }, 2000); // Čekání na načtení záložky
}

// Krok 4: Vyplnění formuláře "Přesun na služební cestu" (Přesun tam)
function fillPresuNaTamForm() {
    console.log('📝 Vyplňujem formulář "Přesun na služební cestu"...');
    
    // Použití kódu z tlačítka "Přesun tam"
    function fillInputsAfterLabel(labelText, values) {
        var labels = document.querySelectorAll('label');
        for (var i = 0; i < labels.length; i++) {
            var label = labels[i];
            if (label.textContent.trim().includes(labelText)) {
                var inputId = label.getAttribute('for');
                var firstInput = inputId ? document.getElementById(inputId) : null;
                if (firstInput) {
                    var allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
                    var startIndex = allInputs.indexOf(firstInput);
                    for (var j = 0; j < values.length; j++) {
                        if (allInputs[startIndex + j]) {
                            allInputs[startIndex + j].value = values[j];
                        }
                    }
                }
            }
        }
    }

    function clickTransportPlusButton() {
        try {
            // Najdeme buňku s textem "Dopravní prostředky"
            const transportCell = Array.from(document.querySelectorAll('.ui-panelgrid-cell'))
                .find(cell => cell.textContent.trim() === 'Dopravní prostředky');
            
            if (!transportCell) {
                console.log('❌ Buňka s textem "Dopravní prostředky" nebyla nalezena');
                return false;
            }

            // Získáme rodičovský řádek
            const parentRow = transportCell.closest('.ui-grid-row');
            
            if (!parentRow) {
                console.log('❌ Nepodařilo se najít rodičovský řádek');
                return false;
            }

            // V tomto řádku hledáme tlačítko s ikonou plus
            const plusButton = parentRow.querySelector('a[title="Přidat"]');
            
            if (plusButton) {
                console.log('✅ Tlačítko plus bylo nalezeno');
                plusButton.click();
                console.log('✅ Bylo kliknuto na tlačítko plus');
                return true;
            } else {
                console.log('❌ Tlačítko plus nebylo nalezeno');
                // Pro diagnostiku vypíšeme všechna tlačítka v řádku
                const allButtons = parentRow.querySelectorAll('a');
                console.log('Dostupná tlačítka v řádku:');
                allButtons.forEach(button => {
                    console.log('Tlačítko:', button.title, button);
                });
                return false;
            }
        } catch (error) {
            console.error('❌ Došlo k chybě:', error);
            return false;
        }
    }

    function processTransportSelection() {
        // Krok 1: Otevření dialogu seznamu
        if (!clickTransportPlusButton()) {
            return; // Ukonči funkci, pokud se nepodařilo otevřít dialog
        }

        // Krok 2: Vybrání AUS nebo vlak ze seznamu
        setTimeout(function() {
            var dropdownId = '_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm:j_idt2518';
            var escapedDropdownId = dropdownId.replace(/(:|\\.|\\[|\\]|\\/)/g, '\\\\$1');
            var dropdown = document.querySelector('#' + escapedDropdownId);

            if (dropdown) {
                var trigger = dropdown.querySelector('.ui-selectonemenu-trigger');
                if (trigger) {
                    trigger.click(); // Otevři seznam
                }

                var items = dropdown.querySelectorAll('option');
                var itemToSelect = Array.from(items).find(item => item.textContent.trim() === "${transportOption}");

                if (itemToSelect) {
                    itemToSelect.selected = true; // Nastav jako vybranou
                    dropdown.querySelector('select').dispatchEvent(new Event('change')); // Vyvolej událost 'change'
                    console.log("Položka '${transportOption}' byla vybrána.");
                } else {
                    console.log("Položka '${transportOption}' nebyla nalezena.");
                }
            } else {
                console.log("Rozevírací seznam nebyl nalezen.");
            }

            // Krok 3: Uložit
            executeSave();

        }, 1000); // Časový limit pro zpoždění
    }

    // Definuj funkci pro uložení
    function executeSave() {
        PrimeFaces.ab({
            s: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm:j_idt2512",
            f: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm",
            p: "@widgetVar(editTransportTypeDlg)",
            u: "@widgetVar(editTransportTypeDlg) @widgetVar(transportTypesTable) @widgetVar(transportTypesTable4TWT) @widgetVar(growl)",
            onst: function(cfg) {
                startBlock();
            },
            onco: function(xhr, status, args, data) {
                stopBlock();
                console.log("✅ Úspěšně uloženo.");
                console.log("✅ Formulář 'Přesun na služební cestu' byl vyplněn!");
                
                // Pokračujeme dalšími kroky
                setTimeout(() => {
                    console.log("🔄 Pokračuji dalšími kroky...");
                    clickSaveAndAddWork();
                }, 2000);
            }
        });
    }

    // Hodnoty pro "Přesun tam" (Odjezd datum a čas, Příjezd čas, Počátek cesty, Konec cesty)
    const values = ["${formatovanyDatum}", "${data.odjezdCas}", "${data.prijezdCas}", "${data.pocatek}", "${data.mistoJednani}"];
    
    // Vyplnění hodnot
    fillInputsAfterLabel("Datum", values);

    // Zavolej funkci pro výběr dopravního prostředku
    processTransportSelection();
}

// Krok 5: Kliknutí na "Uložit a zadat prac. výkon"
function clickSaveAndAddWork() {
    console.log('🔄 Klikám na "Uložit a zadat prac. výkon"...');
    
    try {
        // Hledáme tlačítko podle role a title
        const workButton = document.querySelector('a[role="menuitem"][title="Uložit a zadat prac. výkon"]');
        
        if (workButton) {
            console.log('✅ Tlačítko "Uložit a zadat prac. výkon" bylo nalezeno');
            workButton.click();
            console.log('✅ Bylo kliknuto na tlačítko');
            
            // Pokračujeme vyplněním formuláře pro pracovní výkon
            setTimeout(() => {
                fillDetailVykonuForm();
            }, 2000); // Čekání na načtení formuláře
            
        } else {
            console.log('❌ Tlačítko nebylo nalezeno');
            
            // Pro diagnostiku vypíšeme všechna dostupná tlačítka v menu
            const allMenuItems = document.querySelectorAll('a[role="menuitem"]');
            console.log('Dostupná tlačítka v menu:');
            allMenuItems.forEach(button => {
                console.log('Tlačítko:', button.title);
            });
        }
    } catch (error) {
        console.error('❌ Došlo k chybě:', error);
    }
}

// Krok 6: Vyplnění formuláře "Detail pracovního výkonu"
function fillDetailVykonuForm() {
    console.log('📝 Vyplňujem formulář "Detail pracovního výkonu"...');
    
    function fillInputsAfterLabel(labelText, values) {
        var labels = document.querySelectorAll('label');
        for (var i = 0; i < labels.length; i++) {
            var label = labels[i];
            if (label.textContent.trim().includes(labelText)) {
                var inputId = label.getAttribute('for');
                var firstInput = inputId ? document.getElementById(inputId) : null;
                if (firstInput) {
                    var allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
                    var startIndex = allInputs.indexOf(firstInput);
                    for (var j = 0; j < values.length; j++) {
                        if (allInputs[startIndex + j]) {
                            allInputs[startIndex + j].value = values[j];
                        }
                    }
                }
            }
        }
    }

    // Hodnoty pro "Detail výkonu" (Datum, Počátek prac. výkonu, Konec prac. výkonu, Místo jednání)
    const values = ["${formatovanyDatum}", "${data.prijezdCas}", "${data.konecVykonu}", "${data.mistoJednani}"];
    
    // Vyplnění hodnot
    fillInputsAfterLabel("Datum", values);
    
    console.log('✅ Formulář "Detail pracovního výkonu" byl vyplněn!');
    
    // Pokračujeme dalšími kroky
    setTimeout(() => {
        console.log("🔄 Pokračuji dalšími kroky...");
        clickSaveAndAddTransport();
    }, 1500);
}

// Krok 7: Kliknutí na "Uložit a zadat přesun" (cesta zpět)
function clickSaveAndAddTransport() {
    console.log('🔄 Klikám na "Uložit a zadat přesun"...');
    
    try {
        // Přímo zavoláme PrimeFaces.ab s parametry pro "Uložit a zadat přesun"
        PrimeFaces.ab({
            s: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm:j_idt2758",
            f: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm",
            p: "@widgetVar(twWorkDetailDlg)",
            u: "@widgetVar(twWorkDetailDlg) @widgetVar(twTransportDetailDlg) @widgetVar(travelBillingTable) @widgetVar(confirmDlg) @widgetVar(growl)",
            onst: function(cfg) { 
                startBlock(); 
            },
            onco: function(xhr,status,args,data) { 
                stopBlock();
                console.log('✅ PrimeFaces akce byla vyvolána');
                
                // Pokračujeme vyplněním formuláře pro přesun zpět
                setTimeout(() => {
                    fillPresuZpetForm();
                }, 2000); // Čekání na načtení formuláře
            }
        });
        
    } catch (error) {
        console.error('❌ Došlo k chybě:', error);
    }
}

// Krok 8: Vyplnění formuláře "Přesun zpět ze služební cesty"
function fillPresuZpetForm() {
    console.log('📝 Vyplňujem formulář "Přesun zpět ze služební cesty"...');
    
    function fillInputsAfterLabel(labelText, values) {
        var labels = document.querySelectorAll('label');
        for (var i = 0; i < labels.length; i++) {
            var label = labels[i];
            if (label.textContent.trim().includes(labelText)) {
                var inputId = label.getAttribute('for');
                var firstInput = inputId ? document.getElementById(inputId) : null;
                if (firstInput) {
                    var allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
                    var startIndex = allInputs.indexOf(firstInput);
                    for (var j = 0; j < values.length; j++) {
                        if (allInputs[startIndex + j]) {
                            allInputs[startIndex + j].value = values[j];
                        }
                    }
                }
            }
        }
    }

    function clickTransportPlusButton() {
        try {
            // Najdeme buňku s textem "Dopravní prostředky"
            const transportCell = Array.from(document.querySelectorAll('.ui-panelgrid-cell'))
                .find(cell => cell.textContent.trim() === 'Dopravní prostředky');
            
            if (!transportCell) {
                console.log('❌ Buňka s textem "Dopravní prostředky" nebyla nalezena');
                return false;
            }

            // Získáme rodičovský řádek
            const parentRow = transportCell.closest('.ui-grid-row');
            
            if (!parentRow) {
                console.log('❌ Nepodařilo se najít rodičovský řádek');
                return false;
            }

            // V tomto řádku hledáme tlačítko s ikonou plus
            const plusButton = parentRow.querySelector('a[title="Přidat"]');
            
            if (plusButton) {
                console.log('✅ Tlačítko plus bylo nalezeno');
                plusButton.click();
                console.log('✅ Bylo kliknuto na tlačítko plus');
                return true;
            } else {
                console.log('❌ Tlačítko plus nebylo nalezeno');
                // Pro diagnostiku vypíšeme všechna tlačítka v řádku
                const allButtons = parentRow.querySelectorAll('a');
                console.log('Dostupná tlačítka v řádku:');
                allButtons.forEach(button => {
                    console.log('Tlačítko:', button.title, button);
                });
                return false;
            }
        } catch (error) {
            console.error('❌ Došlo k chybě:', error);
            return false;
        }
    }

    function processTransportSelection() {
        // Krok 1: Otevření dialogu seznamu
        if (!clickTransportPlusButton()) {
            return; // Ukonči funkci, pokud se nepodařilo otevřít dialog
        }

        // Krok 2: Vybrání AUS nebo vlak ze seznamu
        setTimeout(function() {
            var dropdownId = '_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm:j_idt2518';
            var escapedDropdownId = dropdownId.replace(/(:|\\.|\\[|\\]|\\/)/g, '\\\\$1');
            var dropdown = document.querySelector('#' + escapedDropdownId);

            if (dropdown) {
                var trigger = dropdown.querySelector('.ui-selectonemenu-trigger');
                if (trigger) {
                    trigger.click(); // Otevři seznam
                }

                var items = dropdown.querySelectorAll('option');
                var itemToSelect = Array.from(items).find(item => item.textContent.trim() === "${transportOption}");

                if (itemToSelect) {
                    itemToSelect.selected = true; // Nastav jako vybranou
                    dropdown.querySelector('select').dispatchEvent(new Event('change')); // Vyvolej událost 'change'
                    console.log("Položka '${transportOption}' byla vybrána.");
                } else {
                    console.log("Položka '${transportOption}' nebyla nalezena.");
                }
            } else {
                console.log("Rozevírací seznam nebyl nalezen.");
            }

            // Krok 3: Uložit
            executeSave();

        }, 1000); // Časový limit pro zpoždění
    }

    // Definuj funkci pro uložení
    function executeSave() {
        PrimeFaces.ab({
            s: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm:j_idt2512",
            f: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm",
            p: "@widgetVar(editTransportTypeDlg)",
            u: "@widgetVar(editTransportTypeDlg) @widgetVar(transportTypesTable) @widgetVar(transportTypesTable4TWT) @widgetVar(growl)",
            onst: function(cfg) {
                startBlock();
            },
            onco: function(xhr, status, args, data) {
                stopBlock();
                console.log("✅ Úspěšně uloženo.");
                console.log("✅ Formulář 'Přesun zpět ze služební cesty' byl vyplněn!");
                
                // Pokračujeme dalšími kroky
                setTimeout(() => {
                    console.log("🔄 Pokračuji posledním krokem...");
                    clickSaveAndAddStay();
                }, 2000);
            }
        });
    }

    // Hodnoty pro "Přesun zpět" (Odjezd datum a čas, Příjezd čas, Počátek cesty, Konec cesty)
    const values = ["${formatovanyDatum}", "${data.konecVykonu}", "${data.prijezdCasZpet}", "${data.mistoJednani}", "${data.pocatek}"];
    
    // Vyplnění hodnot
    fillInputsAfterLabel("Datum", values);

    // Zavolej funkci pro výběr dopravního prostředku
    processTransportSelection();
}

// Krok 9: Kliknutí na "Uložit a zadat pobyt" (Detail pobytu na SC)
function clickSaveAndAddStay() {
    console.log('🔄 Přecházím na "Detail pobytu na SC"...');
    
    try {
        // Najdeme položku menu podle textu
        const menuItem = Array.from(document.querySelectorAll('.ui-menuitem-text')).find(
            element => element.textContent === 'Uložit a zadat pobyt'
        );

        if (menuItem) {
            // Získáme rodičovský element <a>, který obsahuje onclick handler
            const menuLink = menuItem.closest('a.ui-menuitem-link');
            
            if (menuLink) {
                // Spustíme kliknutí
                menuLink.click();
                
                console.log('✅ Kliknutí na "Uložit a zadat pobyt" bylo úspěšné');
                
                // Pokračujeme vyplněním posledního formuláře
                setTimeout(() => {
                    fillDetailPobytuForm();
                }, 2000); // Čekání na načtení formuláře
                
            } else {
                console.error('❌ Nenalezen odkaz obsahující akci pro "Uložit a zadat pobyt"');
            }
        } else {
            console.error('❌ Položka menu "Uložit a zadat pobyt" nebyla nalezena');
            
            // Pro diagnostiku vypíšeme všechny dostupné položky menu
            const allMenuItems = document.querySelectorAll('.ui-menuitem-text');
            console.log('Dostupné položky menu:');
            allMenuItems.forEach(item => {
                console.log('Menu:', item.textContent);
            });
        }
    } catch (error) {
        console.error('❌ Došlo k chybě:', error);
    }
}

// Krok 10: Vyplnění formuláře "Detail pobytu na služební cestě" (FINÁLNÍ KROK)
function fillDetailPobytuForm() {
    console.log('📝 Vyplňujem poslední formulář "Detail pobytu na služební cestě"...');
    
    function fillInputsAfterLabel(labelText, values) {
        var labels = document.querySelectorAll('label');
        for (var i = 0; i < labels.length; i++) {
            var label = labels[i];
            if (label.textContent.trim().includes(labelText)) {
                var inputId = label.getAttribute('for');
                var firstInput = inputId ? document.getElementById(inputId) : null;
                if (firstInput) {
                    var allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
                    var startIndex = allInputs.indexOf(firstInput);
                    for (var j = 0; j < values.length; j++) {
                        if (allInputs[startIndex + j]) {
                            allInputs[startIndex + j].value = values[j];
                        }
                    }
                }
            }
        }
    }

    // Hodnoty pro "Detail pobytu" (Datum, Pobyt od, Pobyt do, Místo pobytu)
    const values = ["${formatovanyDatum}", "${data.odjezdCas}", "${data.prijezdCasZpet}", "${data.mistoJednani}"];
    
    // Vyplnění hodnot
    fillInputsAfterLabel("Datum", values);
    
    console.log('✅ Formulář "Detail pobytu na služební cestě" byl vyplněn!');
    
    // Finální krok - uložení posledního formuláře
    setTimeout(() => {
        clickFinalSave();
    }, 1500);
}

// Krok 11: Finální uložení poslední tabulky (ZÁVĚREČNÝ KROK)
function clickFinalSave() {
    console.log('💾 Ukládám poslední formulář...');
    
    try {
        // Najdeme položku menu podle textu
        const menuItem = Array.from(document.querySelectorAll('.ui-menuitem-text')).find(
            element => element.textContent === 'Uložit'
        );

        if (menuItem) {
            // Získáme rodičovský element <a>, který obsahuje onclick handler
            const menuLink = menuItem.closest('a.ui-menuitem-link');
            
            if (menuLink) {
                // Spustíme kliknutí
                menuLink.click();
                
                console.log('✅ Kliknutí na "Uložit" bylo úspěšné');
                
                // Zobrazíme finální shrnutí po krátkém čekání
                setTimeout(() => {
                    showFinalSummary();
                }, 2000);
                
            } else {
                console.error('❌ Nenalezen odkaz obsahující akci pro "Uložit"');
            }
        } else {
            console.error('❌ Položka menu "Uložit" nebyla nalezena');
            
            // Pro diagnostiku vypíšeme všechny dostupné položky menu
            const allMenuItems = document.querySelectorAll('.ui-menuitem-text');
            console.log('Dostupné položky menu:');
            allMenuItems.forEach(item => {
                console.log('Menu:', item.textContent);
            });
        }
    } catch (error) {
        console.error('❌ Došlo k chybě:', error);
    }
}

// Finální shrnutí celého procesu
function showFinalSummary() {
    console.log('🎉 DOKONČENO! Všechny 4 tabulky byly automaticky vyplněny a uloženy!');
    console.log('📋 Shrnutí vyplněných formulářů:');
    console.log('   1. ✅ Přesun na služební cestu - vyplněn a uložen');
    console.log('   2. ✅ Detail pracovního výkonu - vyplněn a uložen');
    console.log('   3. ✅ Přesun zpět ze služební cesty - vyplněn a uložen');
    console.log('   4. ✅ Detail pobytu na služební cestě - vyplněn a uložen');
    console.log('💡 Automatické vyplnění bylo úspěšně dokončeno!');
    console.log('🔍 Doporučujeme zkontrolovat vyplněné údaje a případně je upravit.');
    console.log('⏱️ Celý proces trval přibližně 20 sekund.');
}

// Spuštění procesu
startAutoFill();`;

    // Zobrazení scriptu v textové oblasti
    const codeSection = document.getElementById('console-code');
    const codeOutput = document.getElementById('code-output');
    const codeInfo = codeSection.querySelector('.code-info');
    
    codeInfo.innerHTML = `
        <p><strong>1. Otevřete stránku se seznamem cestovních příkazů</strong></p>
        <p><strong>2a. Stiskněte F12 na klávesnici</strong></p>
        <p><strong>2b. V horním panelu vyberte Console <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='16' height='16'%3E%3Cpath fill='currentColor' d='M2 1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zm0 1v12h12V2H2zm2 2h8v1H4V4zm0 2h8v1H4V6zm0 2h8v1H4V8zm0 2h5v1H4v-1z'/%3E%3C/svg%3E" alt="Console ikona" style="vertical-align: middle; margin: 0 2px;"/></strong> (pravděpodobně se při prvním spuštění budete nacházet na záložce Sources <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='16' height='16'%3E%3Cpath fill='currentColor' d='M12 4.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5V5a.5.5 0 0 1 .5-.5h8zm-8 7V5H4v6.5zm8-6.5H5v6h7V5z'/%3E%3Cpath fill='currentColor' d='M8 10.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z'/%3E%3C/svg%3E" alt="Sources ikona (brouk)" style="vertical-align: middle; margin: 0 2px;"/>)</p>
        <p><strong>2c. V konzoli z bezpečnostních důvodů nefunguje vkládání, napište tedy "Allow pasting"</strong> (toto je třeba udělat jen při prvním spuštění)</p>
        <p><strong>3. Vložte níže uvedený kód</strong> do konzole a stiskněte Enter</p>
        <p><strong>4. V žádném případě během procesu automatického vyplňování na nic neklikejte až do jeho dokončení. Pokud je potřeba ukončit proces auto vyplňování, stiskněte klávesu Esc.</strong></p>
        <p><em>Script automaticky vyplní všechny 4 tabulky podle zadaných údajů</em></p>
    `;
    
    codeOutput.value = script;
    codeSection.style.display = 'block';
    codeSection.scrollIntoView({ behavior: 'smooth' });
}

// Funkce pro automatické vyplnění všech 4 tabulek (TESTOVACÍ VERZE V2 - nejspolehlivější metoda)
function generateAutoFillScriptV2() {
    // Získání dat z formuláře
    const data = {
        odjezdDatum: document.getElementById('odjezdDatum').value,
        odjezdCas: document.getElementById('odjezdCas').value,
        prijezdCas: document.getElementById('prijezdCas').value,
        konecVykonu: document.getElementById('konecVykonu').value,
        prijezdCasZpet: document.getElementById('prijezdCasZpet').value,
        pocatek: document.getElementById('pocatek').value || 'Plzeň',
        mistoJednani: document.getElementById('mistoJednani').value || 'Klatovy',
        doprava: document.getElementById('doprava').value
    };

    if (!data.odjezdDatum) {
        alert('Prosím vyplňte data formuláře před generováním automatického scriptu');
        return;
    }

    const formatovanyDatum = formatovatDatum(data.odjezdDatum);
    const transportOption = data.doprava.toLowerCase().includes('vlak') ? 'R-Vlak / O-Osobní vlak' : 'AUS-Auto služební';

    // Generování kompletního scriptu s konzistentní metodou
    const script = `
// Automatické vyplnění všech 4 tabulek cestovního příkazu (TESTOVACÍ VERZE V2)
// Používá nejspolehlivější metodu - hledání podle textu uživatele

// Univerzální funkce pro hledání a klikání na menu položky
function findAndClickMenuItem(menuText, timeout = 5000) {
    return new Promise((resolve) => {
        console.log(\`🔍 Hledám menu položku: "\${menuText}"\`);
        
        // Nejdříve se pokusíme otevřít hlavní menu "Akce" pokud není otevřené
        const mainMenuLink = document.querySelector('.ui-menubar .ui-submenu-link');
        if (mainMenuLink) {
            const parentMenuItem = mainMenuLink.closest('.ui-menuitem');
            const submenu = document.querySelector('.ui-menu-child');
            
            // Zkontrolujeme, zda je submenu viditelné
            if (!submenu || submenu.style.display === 'none' || !parentMenuItem.classList.contains('ui-menuitem-active')) {
                console.log('🔧 Otevírám hlavní menu "Akce"');
                mainMenuLink.click();
                // Čekání na otevření menu
                setTimeout(() => {
                    findMenuItem();
                }, 300);
            } else {
                console.log('🔧 Menu je již otevřené');
                findMenuItem();
            }
        } else {
            findMenuItem();
        }
        
        function findMenuItem() {
            // Hledáme položku v submenu podle textu
            const menuItem = Array.from(document.querySelectorAll('.ui-menu-child .ui-menuitem-text')).find(
                element => element.textContent.trim() === menuText
            );
            
            if (menuItem) {
                const menuLink = menuItem.closest('a.ui-menuitem-link');
                if (menuLink) {
                    console.log(\`✅ Nalezena menu položka: "\${menuText}"\`);
                    menuLink.click();
                    console.log(\`✅ Úspěšně kliknuto na: "\${menuText}"\`);
                    setTimeout(() => resolve(true), timeout);
                    return;
                }
            }
            
            console.error(\`❌ Menu položka "\${menuText}" nebyla nalezena\`);
            // Pro diagnostiku vypíšeme všechny dostupné položky menu
            const allMenuItems = document.querySelectorAll('.ui-menuitem-text');
            console.log('Dostupné menu položky:');
            allMenuItems.forEach((item, index) => {
                console.log(\`\${index + 1}. Menu: "\${item.textContent.trim()}"\`);
            });
            resolve(false);
        }
    });
}

// Funkce pro vyplnění polí podle labelu
function fillInputsAfterLabel(labelText, values) {
    console.log(\`📝 Vyplňuji pole pro label: "\${labelText}"\`);
    var labels = document.querySelectorAll('label');
    for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        if (label.textContent.trim().includes(labelText)) {
            var inputId = label.getAttribute('for');
            var firstInput = inputId ? document.getElementById(inputId) : null;
            if (firstInput) {
                var allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
                var startIndex = allInputs.indexOf(firstInput);
                for (var j = 0; j < values.length; j++) {
                    if (allInputs[startIndex + j]) {
                        allInputs[startIndex + j].value = values[j];
                    }
                }
                console.log(\`✅ Vyplněno \${values.length} polí\`);
                return;
            }
        }
    }
}

// Funkce pro výběr dopravního prostředku
function selectTransportType(transportOption) {
    return new Promise((resolve) => {
        console.log(\`🚗 Vybírám dopravní prostředek: "\${transportOption}"\`);
        
        // Najdeme buňku s textem "Dopravní prostředky"
        const transportCell = Array.from(document.querySelectorAll('.ui-panelgrid-cell'))
            .find(cell => cell.textContent.trim() === 'Dopravní prostředky');
        
        if (!transportCell) {
            console.log('❌ Buňka s textem "Dopravní prostředky" nebyla nalezena');
            resolve(false);
            return;
        }

        const parentRow = transportCell.closest('.ui-grid-row');
        if (!parentRow) {
            console.log('❌ Nepodařilo se najít rodičovský řádek');
            resolve(false);
            return;
        }

        const plusButton = parentRow.querySelector('a[title="Přidat"]');
        if (plusButton) {
            plusButton.click();
            console.log('✅ Otevřen dialog dopravních prostředků');
            
            // Čekáme na otevření dialogu a vybereme dopravní prostředek
            setTimeout(() => {
                var dropdownId = '_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm:j_idt2518';
                var escapedDropdownId = dropdownId.replace(/(:|\\.|\\[|\\]|\\/)/g, '\\\\$1');
                var dropdown = document.querySelector('#' + escapedDropdownId);

                if (dropdown) {
                    var trigger = dropdown.querySelector('.ui-selectonemenu-trigger');
                    if (trigger) {
                        trigger.click();
                    }

                    var items = dropdown.querySelectorAll('option');
                    var itemToSelect = Array.from(items).find(item => item.textContent.trim() === transportOption);

                    if (itemToSelect) {
                        itemToSelect.selected = true;
                        dropdown.querySelector('select').dispatchEvent(new Event('change'));
                        console.log(\`✅ Vybrán dopravní prostředek: "\${transportOption}"\`);
                        
                        // Uložíme výběr
                        PrimeFaces.ab({
                            s: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm:j_idt2512",
                            f: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm",
                            p: "@widgetVar(editTransportTypeDlg)",
                            u: "@widgetVar(editTransportTypeDlg) @widgetVar(transportTypesTable) @widgetVar(transportTypesTable4TWT) @widgetVar(growl)",
                            onst: function(cfg) { startBlock(); },
                            onco: function(xhr, status, args, data) { 
                                stopBlock();
                                console.log("✅ Dopravní prostředek uložen");
                                resolve(true);
                            }
                        });
                    } else {
                        console.log(\`❌ Dopravní prostředek "\${transportOption}" nebyl nalezen\`);
                        resolve(false);
                    }
                } else {
                    console.log("❌ Rozevírací seznam nebyl nalezen");
                    resolve(false);
                }
            }, 1000);
        } else {
            console.log('❌ Tlačítko plus nebylo nalezeno');
            resolve(false);
        }
    });
}

// Hlavní automatizační funkce
async function startAutoFillV2() {
    console.log('🚀 Spouštím automatické vyplnění cestovního příkazu (V2 - opravená verze)...');
    
    try {
        // Krok 1: Přepnutí na záložku "Vyúčtování" (PŮVODNÍ FUNKČNÍ METODA)
        console.log('📋 Krok 1: Přepínám na záložku "Vyúčtování"');
        
        // Inline implementace switchToVyuctovani()
        let found = false;
        
        // První pokus - přímé hledání podle struktury
        const tab = document.querySelector('li[role="tab"] > a[href*="travelDetailTabView"]');
        if (tab && tab.textContent.trim() === 'Vyúčtování') {
            tab.click();
            console.log('✅ Záložka "Vyúčtování" byla nalezena a bylo na ni kliknuto');
            found = true;
        }

        // Druhý pokus - hledání přes všechny záložky
        if (!found) {
            const tabs = Array.from(document.querySelectorAll('li.ui-tabs-header a'));
            const vyuctovaniTab = tabs.find(el => el.textContent.trim() === 'Vyúčtování');
            if (vyuctovaniTab) {
                vyuctovaniTab.click();
                console.log('✅ Záložka "Vyúčtování" byla nalezena a bylo na ni kliknuto (metoda 2)');
                found = true;
            }
        }

        if (!found) {
            console.log('❌ Záložka "Vyúčtování" nebyla nalezena');
            document.querySelectorAll('li.ui-tabs-header a').forEach(tab => {
                console.log(tab.textContent.trim(), tab);
            });
            throw new Error('Záložka "Vyúčtování" nebyla nalezena');
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Krok 2: Označení řádku s cestovním příkazem (PŮVODNÍ METODA)
        console.log('📋 Krok 2: Označuji řádek s cestovním příkazem');
        const cells = Array.from(document.querySelectorAll('td[role="gridcell"]'));
        const targetCell = cells.find(cell => cell.textContent.includes('SC plánovaná od'));
        if (targetCell) {
            targetCell.click();
            console.log('✅ Buňka obsahující "SC plánovaná od" byla nalezena a bylo na ni kliknuto');
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            console.log('❌ Buňka obsahující "SC plánovaná od" nebyla nalezena');
            throw new Error('Řádek s cestovním příkazem nebyl nalezen');
        }
        
        // Krok 3: Otevření formuláře "Přidat přesun na SC" (PŮVODNÍ METODA)
        console.log('📋 Krok 3: Otevírám formulář "Přidat přesun na SC"');
        const addTransportButton = document.querySelector('a[title="Přidat přesun na SC"]');
        
        if (addTransportButton) {
            addTransportButton.click();
            console.log('✅ Tlačítko "Přidat přesun na SC" bylo nalezeno a bylo na něj kliknuto');
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            // Pokud se nepodařilo najít tlačítko přímo, zkusíme alternativní způsob
            const allMenuItems = Array.from(document.querySelectorAll('.ui-menuitem a'));
            const transportButton = allMenuItems.find(item => item.title === 'Přidat přesun na SC');
            
            if (transportButton) {
                transportButton.click();
                console.log('✅ Tlačítko "Přidat přesun na SC" bylo nalezeno alternativní metodou a bylo na něj kliknuto');
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                console.log('❌ Tlačítko "Přidat přesun na SC" nebylo nalezeno');
                throw new Error('Tlačítko "Přidat přesun na SC" nebylo nalezeno');
            }
        }
        
        // Krok 4: Vyplnění formuláře "Přesun na služební cestu" (PŮVODNÍ FUNKČNÍ METODA)
        console.log('📋 Krok 4: Vyplňuji formulář "Přesun na služební cestu"');
        
        // Inline implementace fillPresuNaTamForm() logiky
        console.log('📝 Vyplňujem formulář "Přesun na služební cestu"...');
        
        // Funkce pro vyplnění polí
        function fillInputsAfterLabel(labelText, values) {
            var labels = document.querySelectorAll('label');
            for (var i = 0; i < labels.length; i++) {
                var label = labels[i];
                if (label.textContent.trim().includes(labelText)) {
                    var inputId = label.getAttribute('for');
                    var firstInput = inputId ? document.getElementById(inputId) : null;
                    if (firstInput) {
                        var allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
                        var startIndex = allInputs.indexOf(firstInput);
                        for (var j = 0; j < values.length; j++) {
                            if (allInputs[startIndex + j]) {
                                allInputs[startIndex + j].value = values[j];
                            }
                        }
                        console.log(\`✅ Vyplněno \${values.length} polí\`);
                        return;
                    }
                }
            }
        }

        // Vyplnění hodnot
        const values = ["${formatovanyDatum}", "${data.odjezdCas}", "${data.prijezdCas}", "${data.pocatek}", "${data.mistoJednani}"];
        fillInputsAfterLabel("Datum", values);
        
        // Implementace výběru dopravních prostředků
        console.log('🚗 Spouštím výběr dopravních prostředků...');
        
        // Funkce pro kliknutí na plus tlačítko
        function clickTransportPlusButton() {
            try {
                const transportCell = Array.from(document.querySelectorAll('.ui-panelgrid-cell'))
                    .find(cell => cell.textContent.trim() === 'Dopravní prostředky');
                
                if (!transportCell) {
                    console.log('❌ Buňka s textem "Dopravní prostředky" nebyla nalezena');
                    return false;
                }

                const parentRow = transportCell.closest('.ui-grid-row');
                if (!parentRow) {
                    console.log('❌ Nepodařilo se najít rodičovský řádek');
                    return false;
                }

                const plusButton = parentRow.querySelector('a[title="Přidat"]');
                if (plusButton) {
                    console.log('✅ Tlačítko plus bylo nalezeno');
                    plusButton.click();
                    console.log('✅ Bylo kliknuto na tlačítko plus');
                    return true;
                } else {
                    console.log('❌ Tlačítko plus nebylo nalezeno');
                    return false;
                }
            } catch (error) {
                console.error('❌ Došlo k chybě:', error);
                return false;
            }
        }

        // Spustíme výběr dopravního prostředku
        if (!clickTransportPlusButton()) {
            throw new Error('Nepodařilo se otevřít dialog dopravních prostředků');
        }

        // Čekáme na otevření dialogu a vybereme dopravní prostředek
        setTimeout(() => {
            console.log('� Vybírám dopravní prostředek...');
            
            var dropdownId = '_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm:j_idt2518';
            var escapedDropdownId = dropdownId.replace(/(:|\\.|\\[|\\]|\\/)/g, '\\\\$1');
            var dropdown = document.querySelector('#' + escapedDropdownId);

            if (dropdown) {
                var trigger = dropdown.querySelector('.ui-selectonemenu-trigger');
                if (trigger) {
                    trigger.click();
                }

                var items = dropdown.querySelectorAll('option');
                var itemToSelect = Array.from(items).find(item => item.textContent.trim() === "${transportOption}");

                if (itemToSelect) {
                    itemToSelect.selected = true;
                    dropdown.querySelector('select').dispatchEvent(new Event('change'));
                    console.log("✅ Položka '${transportOption}' byla vybrána.");
                } else {
                    console.log("❌ Položka '${transportOption}' nebyla nalezena.");
                }
            } else {
                console.log("❌ Rozevírací seznam nebyl nalezen.");
            }

            // Uložíme první formulář a pokračujeme
            console.log('💾 Ukládám první formulář...');
            PrimeFaces.ab({
                s: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm:j_idt2512",
                f: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm",
                p: "@widgetVar(editTransportTypeDlg)",
                u: "@widgetVar(editTransportTypeDlg) @widgetVar(transportTypesTable) @widgetVar(transportTypesTable4TWT) @widgetVar(growl)",
                onst: function(cfg) { startBlock(); },
                onco: function(xhr, status, args, data) {
                    stopBlock();
                    console.log("✅ První formulář úspěšně uložen!");
                    
                    // Pokračujeme dalšími kroky s opravěnou navigací
                    setTimeout(async () => {
                        await continueWithNextSteps();
                    }, 3000);
                }
            });
        }, 1500);
        
    } catch (error) {
        console.error('❌ Došlo k chybě v procesu:', error.message);
        console.log('🔄 Proces byl ukončen z důvodu chyby');
    }
}

// Pokračování s dalšími kroky pomocí opravené navigace
async function continueWithNextSteps() {
    try {
        // Krok 5: Přechod na "Detail pracovního výkonu"
        console.log('📋 Krok 5: Přecházím na "Detail pracovního výkonu"');
        if (await findAndClickMenuItem('Uložit a zadat prac. výkon')) {
            // Vyplnění formuláře pracovního výkonu
            function fillInputsAfterLabel(labelText, values) {
                var labels = document.querySelectorAll('label');
                for (var i = 0; i < labels.length; i++) {
                    var label = labels[i];
                    if (label.textContent.trim().includes(labelText)) {
                        var inputId = label.getAttribute('for');
                        var firstInput = inputId ? document.getElementById(inputId) : null;
                        if (firstInput) {
                            var allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
                            var startIndex = allInputs.indexOf(firstInput);
                            for (var j = 0; j < values.length; j++) {
                                if (allInputs[startIndex + j]) {
                                    allInputs[startIndex + j].value = values[j];
                                }
                            }
                        }
                    }
                }
            }
            
            fillInputsAfterLabel("Datum", ["${formatovanyDatum}", "${data.prijezdCas}", "${data.konecVykonu}", "${data.mistoJednani}"]);
            console.log('✅ Formulář "Detail pracovního výkonu" vyplněn');
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Krok 6: Přechod na "Přesun zpět"
            console.log('📋 Krok 6: Přecházím na "Přesun zpět"');
            if (await findAndClickMenuItem('Uložit a zadat přesun')) {
                fillInputsAfterLabel("Datum", ["${formatovanyDatum}", "${data.konecVykonu}", "${data.prijezdCasZpet}", "${data.mistoJednani}", "${data.pocatek}"]);
                console.log('✅ Formulář "Přesun zpět" vyplněn');
                
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Krok 7: Přechod na "Detail pobytu"
                console.log('📋 Krok 7: Přecházím na "Detail pobytu"');
                if (await findAndClickMenuItem('Uložit a zadat pobyt')) {
                    fillInputsAfterLabel("Datum", ["${formatovanyDatum}", "${data.odjezdCas}", "${data.prijezdCasZpet}", "${data.mistoJednani}"]);
                    console.log('✅ Formulář "Detail pobytu" vyplněn');
                    
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    // Krok 8: Finální uložení
                    console.log('📋 Krok 8: Finální uložení');
                    if (await findAndClickMenuItem('Uložit')) {
                        console.log('🎉 DOKONČENO! Všechny 4 tabulky byly automaticky vyplněny a uloženy!');
                        console.log('📋 Shrnutí V2:');
                        console.log('   1. ✅ Přesun na služební cestu - vyplněn a uložen');
                        console.log('   2. ✅ Detail pracovního výkonu - vyplněn a uložen'); 
                        console.log('   3. ✅ Přesun zpět - vyplněn a uložen');
                        console.log('   4. ✅ Detail pobytu - vyplněn a uložen');
                        console.log('💡 V2 automatické vyplnění bylo úspěšně dokončeno!');
                    } else {
                        console.error('❌ Nepodařilo se finálně uložit');
                    }
                } else {
                    console.error('❌ Nepodařilo se přejít na "Detail pobytu"');
                }
            } else {
                console.error('❌ Nepodařilo se přejít na "Přesun zpět"');
            }
        } else {
            console.error('❌ Nepodařilo se přejít na "Detail pracovního výkonu"');
        }
    } catch (error) {
        console.error('❌ Došlo k chybě v dalších krocích:', error.message);
    }
}

// Spuštění procesu
startAutoFillV2();`;

    // Zobrazení scriptu v textové oblasti
    const codeSection = document.getElementById('console-code');
    const codeOutput = document.getElementById('code-output');
    const codeInfo = codeSection.querySelector('.code-info');
    
    codeInfo.innerHTML = `
        <p><strong>🧪 TESTOVACÍ VERZE V2 - Nejspolehlivější metoda</strong></p>
        <p><strong>1. Otevřete stránku se seznamem cestovních příkazů</strong></p>
        <p><strong>2a. Stiskněte F12 na klávesnici</strong></p>
        <p><strong>2b. V horním panelu vyberte Console <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='16' height='16'%3E%3Cpath fill='currentColor' d='M2 1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zm0 1v12h12V2H2zm2 2h8v1H4V4zm0 2h8v1H4V6zm0 2h8v1H4V8zm0 2h5v1H4v-1z'/%3E%3C/svg%3E" alt="Console ikona" style="vertical-align: middle; margin: 0 2px;"/></strong> (pravděpodobně se při prvním spuštění budete nacházet na záložce Sources <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='16' height='16'%3E%3Cpath fill='currentColor' d='M12 4.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5V5a.5.5 0 0 1 .5-.5h8zm-8 7V5H4v6.5zm8-6.5H5v6h7V5z'/%3E%3Cpath fill='currentColor' d='M8 10.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z'/%3E%3C/svg%3E" alt="Sources ikona (brouk)" style="vertical-align: middle; margin: 0 2px;"/>)</p>
        <p><strong>2c. V konzoli z bezpečnostních důvodů nefunguje vkládání, napište tedy "Allow pasting"</strong> (toto je třeba udělat jen při prvním spuštění)</p>
        <p><strong>3. Vložte níže uvedený kód</strong> do konzole a stiskněte Enter</p>
        <p><strong>4. V žádném případě během procesu automatického vyplňování na nic neklikejte až do jeho dokončení. Pokud je potřeba ukončit proces auto vyplňování, stiskněte klávesu Esc.</strong></p>
        <p><em>Script používá konzistentní metodu hledání podle textu uživatele</em></p>
        <p style="color: #9c27b0; font-weight: bold;">⚡ Async/await pro lepší kontrolu časování</p>
    `;
    
    codeOutput.value = script;
    codeSection.style.display = 'block';
    codeSection.scrollIntoView({ behavior: 'smooth' });
}

// VERZE V3 - Nová testovací verze
function generateAutoFillScriptV3() {
    // Získání dat z formuláře (stejně jako původní funkce)
    const data = {
        odjezdDatum: document.getElementById('odjezdDatum').value,
        odjezdCas: document.getElementById('odjezdCas').value,
        prijezdCas: document.getElementById('prijezdCas').value,
        konecVykonu: document.getElementById('konecVykonu').value,
        prijezdCasZpet: document.getElementById('prijezdCasZpet').value,
        pocatek: document.getElementById('pocatek').value || 'Plzeň',
        mistoJednani: document.getElementById('mistoJednani').value || 'Klatovy',
        doprava: document.getElementById('doprava').value
    };

    if (!data.odjezdDatum) {
        alert('Prosím vyplňte data formuláře před generováním automatického scriptu');
        return;
    }

    const formatovanyDatum = formatovatDatum(data.odjezdDatum);
    const transportOption = data.doprava.toLowerCase().includes('vlak') ? 'R-Vlak / O-Osobní vlak' : 'AUS-Auto služební';

    const script = `// V3 Automatické vyplnění cestovního příkazu
async function startAutoFillV3() {
    console.log('🚀 Spouštím V3 automatické vyplnění cestovního příkazu...');
    
    try {
        // KROK 1: Kliknout na "Vyúčtování"
        console.log('📋 KROK 1: Klikání na "Vyúčtování"...');
        try {
            let found = false;
            
            // První pokus - přímé hledání podle struktury
            const tab = document.querySelector('li[role="tab"] > a[href*="travelDetailTabView"]');
            if (tab && tab.textContent.trim() === 'Vyúčtování') {
                tab.click();
                console.log('✅ Záložka "Vyúčtování" byla nalezena a bylo na ni kliknuto');
                console.log('Nalezený element:', tab);
                found = true;
            }

            // Druhý pokus - hledání přes všechny záložky
            if (!found) {
                const tabs = Array.from(document.querySelectorAll('li.ui-tabs-header a'));
                const vyuctovaniTab = tabs.find(el => el.textContent.trim() === 'Vyúčtování');
                if (vyuctovaniTab) {
                    vyuctovaniTab.click();
                    console.log('✅ Záložka "Vyúčtování" byla nalezena a bylo na ni kliknuto (metoda 2)');
                    console.log('Nalezený element:', vyuctovaniTab);
                    found = true;
                }
            }

            // Pokud nebyla záložka nalezena, vypíšeme diagnostické informace
            if (!found) {
                console.log('❌ Záložka "Vyúčtování" nebyla nalezena');
                console.log('Seznam všech nalezených záložek:');
                document.querySelectorAll('li.ui-tabs-header a').forEach(tab => {
                    console.log(tab.textContent.trim(), tab);
                });
                throw new Error('Záložka "Vyúčtování" nebyla nalezena');
            }
        } catch (error) {
            console.error('❌ Došlo k chybě:', error);
            throw error;
        }

        // Čekání 3 sekundy
        console.log('⏳ Čekám 3 sekundy...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // KROK 2: Označit řádek s cestovním příkazem
        console.log('📋 KROK 2: Označuji řádek s cestovním příkazem...');
        try {
            // Hledáme td element obsahující text "SC plánovaná od"
            const cells = Array.from(document.querySelectorAll('td[role="gridcell"]'));
            const targetCell = cells.find(cell => cell.textContent.includes('SC plánovaná od'));

            if (targetCell) {
                // Kontrola datumu před pokračováním
                const cellText = targetCell.textContent.trim();
                console.log('Nalezený text:', cellText);
                
                // Extrakce datumu z textu (např. "SC plánovaná od 03.09.2025 07:00 do...")
                const dateMatch = cellText.match(/SC plánovaná od (\\d{2}\\.\\d{2}\\.\\d{4})/);
                if (dateMatch && dateMatch[1]) {
                    const scDate = dateMatch[1]; // např. "03.09.2025"
                    const expectedDate = "${formatovanyDatum}"; // naše datum z formuláře
                    
                    console.log('Datum SC:', scDate);
                    console.log('Očekávané datum:', expectedDate);
                    
                    if (scDate !== expectedDate) {
                        console.error('❌ CHYBA: Datum SC nesouhlasí!');
                        console.error('Datum SC má být: ' + scDate);
                        console.error('Ale my jsme uvedli: ' + expectedDate);
                        console.error('🔍 DOPORUČENÍ: Zkontrolujte datum v formuláři nebo vyberte správný cestovní příkaz');
                        throw new Error('Nesouhlasí datum SC - proces ukončen');
                    }
                    
                    console.log('✅ Kontrola datumu prošla - datum SC souhlasí');
                } else {
                    console.log('⚠️ Nepodařilo se extrahovat datum z textu, pokračuji bez kontroly');
                }
                
                targetCell.click();
                console.log('✅ Buňka obsahující "SC plánovaná od" byla nalezena a bylo na ni kliknuto');
                console.log('Nalezený element:', targetCell);
            } else {
                console.log('❌ Buňka obsahující "SC plánovaná od" nebyla nalezena');
                console.log('Seznam všech buněk tabulky:');
                cells.forEach(cell => {
                    console.log(cell.textContent.trim());
                });
                throw new Error('Řádek s "SC plánovaná od" nebyl nalezen');
            }
        } catch (error) {
            console.error('❌ Došlo k chybě:', error);
            throw error;
        }

        // Čekání 3 sekundy
        console.log('⏳ Čekám 3 sekundy...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // KROK 3: Otevřít tabulku pro přidání cesty na služební cestu
        console.log('📋 KROK 3: Otevírám tabulku "Přidat přesun na SC"...');
        try {
            // Hledáme tlačítko pro přidání přesunu podle title atributu
            const addTransportButton = document.querySelector('a[title="Přidat přesun na SC"]');
            
            if (addTransportButton) {
                addTransportButton.click();
                console.log('✅ Tlačítko "Přidat přesun na SC" bylo nalezeno a bylo na něj kliknuto');
                console.log('Nalezený element:', addTransportButton);
            } else {
                // Pokud se nepodařilo najít tlačítko přímo, zkusíme alternativní způsob
                const allMenuItems = Array.from(document.querySelectorAll('.ui-menuitem a'));
                const transportButton = allMenuItems.find(item => item.title === 'Přidat přesun na SC');
                
                if (transportButton) {
                    transportButton.click();
                    console.log('✅ Tlačítko "Přidat přesun na SC" bylo nalezeno alternativní metodou a bylo na něj kliknuto');
                    console.log('Nalezený element:', transportButton);
                } else {
                    console.log('❌ Tlačítko "Přidat přesun na SC" nebylo nalezeno');
                    // Vypíšeme všechna dostupná tlačítka pro diagnostiku
                    console.log('Dostupná tlačítka v menu:');
                    document.querySelectorAll('.ui-menuitem a').forEach(button => {
                        console.log('Tlačítko:', button.title, button);
                    });
                    throw new Error('Tlačítko "Přidat přesun na SC" nebylo nalezeno');
                }
            }
        } catch (error) {
            console.error('❌ Došlo k chybě:', error);
            throw error;
        }

        // Čekání 3 sekundy
        console.log('⏳ Čekám 3 sekundy...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // KROK 4: Vyplnit tabulku "Přesun na služební cestu" (kód z tlačítka "Přesun tam")
        console.log('📋 KROK 4: Vyplňuji tabulku "Přesun na služební cestu"...');
        
        function fillInputsAfterLabel(labelText, values) {
            var labels = document.querySelectorAll('label');
            for (var i = 0; i < labels.length; i++) {
                var label = labels[i];
                if (label.textContent.trim().includes(labelText)) {
                    var inputId = label.getAttribute('for');
                    var firstInput = inputId ? document.getElementById(inputId) : null;
                    if (firstInput) {
                        var allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
                        var startIndex = allInputs.indexOf(firstInput);
                        for (var j = 0; j < values.length; j++) {
                            if (allInputs[startIndex + j]) {
                                allInputs[startIndex + j].value = values[j];
                            }
                        }
                    }
                }
            }
        }

        function clickTransportPlusButton() {
            try {
                const transportCell = Array.from(document.querySelectorAll('.ui-panelgrid-cell'))
                    .find(cell => cell.textContent.trim() === 'Dopravní prostředky');
                
                if (!transportCell) {
                    console.log('❌ Buňka s textem "Dopravní prostředky" nebyla nalezena');
                    return false;
                }

                const parentRow = transportCell.closest('.ui-grid-row');
                if (!parentRow) {
                    console.log('❌ Nepodařilo se najít rodičovský řádek');
                    return false;
                }

                const plusButton = parentRow.querySelector('a[title="Přidat"]');
                if (plusButton) {
                    console.log('✅ Tlačítko plus bylo nalezeno');
                    plusButton.click();
                    console.log('✅ Bylo kliknuto na tlačítko plus');
                    return true;
                } else {
                    console.log('❌ Tlačítko plus nebylo nalezeno');
                    return false;
                }
            } catch (error) {
                console.error('❌ Došlo k chybě:', error);
                return false;
            }
        }

        function processTransportSelection() {
            if (!clickTransportPlusButton()) {
                return;
            }

            setTimeout(function() {
                var dropdownId = '_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm:j_idt2518';
                var escapedDropdownId = dropdownId.replace(/(:|\\.|\\[|\\]|\\/)/g, '\\\\$1');
                var dropdown = document.querySelector('#' + escapedDropdownId);

                if (dropdown) {
                    var trigger = dropdown.querySelector('.ui-selectonemenu-trigger');
                    if (trigger) {
                        trigger.click();
                    }

                    var items = dropdown.querySelectorAll('option');
                    var itemToSelect = Array.from(items).find(item => item.textContent.trim() === "${transportOption}");

                    if (itemToSelect) {
                        itemToSelect.selected = true;
                        dropdown.querySelector('select').dispatchEvent(new Event('change'));
                        console.log("Položka '${transportOption}' byla vybrána.");
                    } else {
                        console.log("Položka '${transportOption}' nebyla nalezena.");
                    }
                } else {
                    console.log("Rozevírací seznam nebyl nalezen.");
                }

                executeSave();
            }, 1000);
        }

        function executeSave() {
            PrimeFaces.ab({
                s: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm:j_idt2512",
                f: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm",
                p: "@widgetVar(editTransportTypeDlg)",
                u: "@widgetVar(editTransportTypeDlg) @widgetVar(transportTypesTable) @widgetVar(transportTypesTable4TWT) @widgetVar(growl)",
                onst: function(cfg) {
                    startBlock();
                },
                onco: function(xhr, status, args, data) {
                    stopBlock();
                    console.log("✅ První tabulka byla úspěšně vyplněna a uložena!");
                    
                    // Pokračujeme krokem 5 po 3 sekundách
                    setTimeout(() => {
                        continueStep5();
                    }, 3000);
                }
            });
        }

        // Hodnoty pro "Přesun tam"
        const values = ["${formatovanyDatum}", "${data.odjezdCas}", "${data.prijezdCas}", "${data.pocatek}", "${data.mistoJednani}"];
        
        // Vyplnění hodnot
        fillInputsAfterLabel("Datum", values);

        // Zavolej funkci pro výběr dopravního prostředku
        processTransportSelection();

        // Pokračování definujeme jako samostatnou funkci
        function continueStep5() {
            console.log('⏳ Čekám 3 sekundy...');
            
            // KROK 5: Stisknout "Uložit a zadat prac. výkon"
            console.log('📋 KROK 5: Stiskávám "Uložit a zadat prac. výkon"...');
            
            function clickSaveAndAddWork() {
                try {
                    // Hledáme tlačítko podle role a title
                    const workButton = document.querySelector('a[role="menuitem"][title="Uložit a zadat prac. výkon"]');
                    
                    if (workButton) {
                        console.log('✅ Tlačítko "Uložit a zadat prac. výkon" bylo nalezeno');
                        workButton.click();
                        console.log('✅ Bylo kliknuto na tlačítko');
                        
                        // Pokračujeme krokem 6 po 3 sekundách
                        setTimeout(() => {
                            continueStep6();
                        }, 3000);
                        
                    } else {
                        console.log('❌ Tlačítko nebylo nalezeno');
                        
                        // Pro diagnostiku vypíšeme všechna dostupná tlačítka v menu
                        const allMenuItems = document.querySelectorAll('a[role="menuitem"]');
                        console.log('Dostupná tlačítka v menu:');
                        allMenuItems.forEach(button => {
                            console.log('Tlačítko:', button.title);
                        });
                    }
                } catch (error) {
                    console.error('❌ Došlo k chybě:', error);
                }
            }

            clickSaveAndAddWork();
        }

        function continueStep6() {
            console.log('⏳ Čekám 3 sekundy...');
            
            // KROK 6: Vyplnit tabulku "Detail výkonu"
            console.log('📋 KROK 6: Vyplňuji tabulku "Detail výkonu" (kód z tlačítka "Detail výkonu")...');
            
            function fillInputsAfterLabel(labelText, values) {
                var labels = document.querySelectorAll('label');
                for (var i = 0; i < labels.length; i++) {
                    var label = labels[i];
                    if (label.textContent.trim().includes(labelText)) {
                        var inputId = label.getAttribute('for');
                        var firstInput = inputId ? document.getElementById(inputId) : null;
                        if (firstInput) {
                            var allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
                            var startIndex = allInputs.indexOf(firstInput);
                            for (var j = 0; j < values.length; j++) {
                                if (allInputs[startIndex + j]) {
                                    allInputs[startIndex + j].value = values[j];
                                }
                            }
                        }
                    }
                }
            }
            
            // Hodnoty pro "Detail výkonu"
            const values = ["${formatovanyDatum}", "${data.prijezdCas}", "${data.konecVykonu}", "${data.mistoJednani}"];
            fillInputsAfterLabel("Datum", values);
            
            console.log('✅ Tabulka "Detail výkonu" byla vyplněna');
            
            // Pokračujeme krokem 7 po 3 sekundách
            setTimeout(() => {
                continueStep7();
            }, 3000);
        }

        function continueStep7() {
            console.log('⏳ Čekám 3 sekundy...');
            
            // KROK 7: Stisknout "Uložit a zadat přesun"
            console.log('📋 KROK 7: Stiskávám "Uložit a zadat přesun"...');
            
            function clickSaveAndAddTransport() {
                PrimeFaces.ab({
                    s: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm:j_idt2752",
                    f: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm",
                    p: "@widgetVar(twWorkDetailDlg)",
                    u: "@widgetVar(twWorkDetailDlg) @widgetVar(twTransportDetailDlg) @widgetVar(travelBillingTable) @widgetVar(confirmDlg) @widgetVar(growl)",
                    onst: function(cfg) {
                        startBlock();
                    },
                    onco: function(xhr, status, args, data) {
                        stopBlock();
                        console.log('✅ Tlačítko "Uložit a zadat přesun" bylo úspěšně provedeno');
                        
                        // Pokračujeme krokem 8 po 3 sekundách
                        setTimeout(() => {
                            continueStep8();
                        }, 3000);
                    }
                });
            }

            // Zavoláme funkci
            clickSaveAndAddTransport();
        }

        function continueStep8() {
            console.log('⏳ Čekám 3 sekundy...');
            
            // KROK 8: Vyplnit tabulku "Cesta zpět"
            console.log('📋 KROK 8: Vyplňuji tabulku "Cesta zpět" (kód z tlačítka "Přesun zpět")...');
            
            function fillInputsAfterLabel(labelText, values) {
                var labels = document.querySelectorAll('label');
                for (var i = 0; i < labels.length; i++) {
                    var label = labels[i];
                    if (label.textContent.trim().includes(labelText)) {
                        var inputId = label.getAttribute('for');
                        var firstInput = inputId ? document.getElementById(inputId) : null;
                        if (firstInput) {
                            var allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
                            var startIndex = allInputs.indexOf(firstInput);
                            for (var j = 0; j < values.length; j++) {
                                if (allInputs[startIndex + j]) {
                                    allInputs[startIndex + j].value = values[j];
                                }
                            }
                        }
                    }
                }
            }
            
            // Hodnoty pro "Cesta zpět"
            const values = ["${formatovanyDatum}", "${data.konecVykonu}", "${data.prijezdCasZpet}", "${data.mistoJednani}", "${data.pocatek}"];
            fillInputsAfterLabel("Datum", values);
            
            console.log('✅ Tabulka "Cesta zpět" byla vyplněna');
            
            // Pokračujeme krokem 9 po 3 sekundách
            setTimeout(() => {
                continueStep9();
            }, 3000);
        }

        function continueStep9() {
            console.log('⏳ Čekám 3 sekundy...');
            
            // KROK 9: "Uložit a zadat pobyt" - robustnější způsob
            console.log('📋 KROK 9: Stiskávám "Uložit a zadat pobyt"...');
            
            function clickSaveAndAddStay() {
                // Funkce pro nalezení ID tlačítka podle textu
                function findButtonIdByText(buttonText) {
                    const menuItems = document.querySelectorAll('.ui-menuitem-link');
                    for (const item of menuItems) {
                        const textSpan = item.querySelector('.ui-menuitem-text');
                        if (textSpan && textSpan.textContent.trim() === buttonText) {
                            // Získáme onclick atribut a z něj vytáhneme ID
                            const onclickAttr = item.getAttribute('onclick');
                            if (onclickAttr) {
                                const match = onclickAttr.match(/s:"([^"]+)"/);
                                if (match && match[1]) {
                                    return match[1].split(':').pop(); // Vrátí samotné ID bez prefixu
                                }
                            }
                        }
                    }
                    return null;
                }

                // Funkce pro získání widgetVar z aktuálního dialogu
                function getCurrentDialogWidgetVar() {
                    // Hledáme otevřený dialog
                    const activeDialog = document.querySelector('.ui-dialog:not([style*="display: none"])');
                    if (activeDialog) {
                        return activeDialog.id.replace('_panel', '');
                    }
                    return 'twTransportDetailDlg'; // Výchozí hodnota
                }

                // Počkáme na otevření menu
                setTimeout(() => {
                    const buttonId = findButtonIdByText('Uložit a zadat pobyt');
                    const currentWidgetVar = getCurrentDialogWidgetVar();

                    if (buttonId) {
                        console.log('✅ Nalezeno ID tlačítka:', buttonId);
                        
                        PrimeFaces.ab({
                            s: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm:" + buttonId,
                            f: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm",
                            p: "@widgetVar(" + currentWidgetVar + ")",
                            u: "@widgetVar(" + currentWidgetVar + ") @widgetVar(twStayDetailDlg) @widgetVar(travelBillingTable) @widgetVar(confirmDlg) @widgetVar(growl)",
                            onst: function(cfg) {
                                startBlock();
                            },
                            onco: function(xhr, status, args, data) {
                                stopBlock();
                                console.log('✅ Tlačítko "Uložit a zadat pobyt" bylo úspěšně provedeno');
                                
                                // Pokračujeme krokem 10 po 3 sekundách
                                setTimeout(() => {
                                    continueStep10();
                                }, 3000);
                            }
                        });
                    } else {
                        console.error('❌ Tlačítko "Uložit a zadat pobyt" nebylo nalezeno');
                        
                        // Pro diagnostiku vypíšeme všechna dostupná tlačítka
                        const allMenuItems = document.querySelectorAll('.ui-menuitem-link .ui-menuitem-text');
                        console.log('Dostupná tlačítka:');
                        allMenuItems.forEach(item => {
                            console.log('Tlačítko:', item.textContent.trim());
                        });
                        
                        console.log('🔄 V3: Proces dokončen s chybou v kroku 9');
                    }
                }, 100); // Krátké zpoždění pro jistotu, že menu je otevřené
            }

            // Přidáme sledování změn v DOM
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && 
                        mutation.target.classList.contains('ui-menu-list')) {
                        // Menu bylo aktualizováno, můžeme znovu spustit funkci
                        console.log('📝 Detekována změna v menu');
                    }
                });
            });

            // Začneme sledovat změny v menu
            const menuElement = document.querySelector('.ui-menu-list');
            if (menuElement) {
                observer.observe(menuElement, {
                    childList: true,
                    subtree: true
                });
            }

            // Zavoláme funkci
            clickSaveAndAddStay();
        }

        function continueStep10() {
            console.log('⏳ Čekám 3 sekundy...');
            
            // KROK 10: Vyplnit tabulku "Detail pobytu"
            console.log('📋 KROK 10: Vyplňuji tabulku "Detail pobytu na služební cestě"...');
            
            function fillInputsAfterLabel(labelText, values) {
                var labels = document.querySelectorAll('label');
                for (var i = 0; i < labels.length; i++) {
                    var label = labels[i];
                    if (label.textContent.trim().includes(labelText)) {
                        var inputId = label.getAttribute('for');
                        var firstInput = inputId ? document.getElementById(inputId) : null;
                        if (firstInput) {
                            var allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
                            var startIndex = allInputs.indexOf(firstInput);
                            for (var j = 0; j < values.length; j++) {
                                if (allInputs[startIndex + j]) {
                                    allInputs[startIndex + j].value = values[j];
                                }
                            }
                        }
                    }
                }
            }
            
            // Hodnoty pro "Detail pobytu" (Datum, Pobyt od, Pobyt do, Místo pobytu)
            const values = ["${formatovanyDatum}", "${data.prijezdCas}", "${data.konecVykonu}", "${data.mistoJednani}"];
            fillInputsAfterLabel("Datum", values);
            
            console.log('✅ Tabulka "Detail pobytu na služební cestě" byla vyplněna');
            
            // Pokračujeme krokem 11 po 3 sekundách
            setTimeout(() => {
                continueStep11();
            }, 3000);
        }

        function continueStep11() {
            console.log('⏳ Čekám 3 sekundy...');
            
            // KROK 11: Stisknout tlačítko "Uložit"
            console.log('📋 KROK 11: Stiskávám tlačítko "Uložit"...');
            
            function clickSave() {
                // Najdeme dialog podle jeho záhlaví
                const dialogHeader = Array.from(document.querySelectorAll('.ui-outputlabel-label'))
                    .find(el => el.textContent === 'Detail pobytu na SC');
                
                if (!dialogHeader) {
                    console.error('❌ Dialog "Detail pobytu na SC" nebyl nalezen');
                    console.log('🔄 V3: Proces dokončen s chybou v kroku 11');
                    return;
                }

                // Najdeme dialog container
                const dialog = dialogHeader.closest('.ui-dialog');
                if (!dialog) {
                    console.error('❌ Nepodařilo se najít container dialogu');
                    console.log('🔄 V3: Proces dokončen s chybou v kroku 11');
                    return;
                }

                // Najdeme tlačítko Uložit v tomto konkrétním dialogu
                const saveButton = Array.from(dialog.querySelectorAll('.ui-menuitem-text'))
                    .find(el => el.textContent === 'Uložit');

                if (!saveButton) {
                    console.error('❌ Tlačítko "Uložit" nebylo nalezeno v dialogu');
                    console.log('🔄 V3: Proces dokončen s chybou v kroku 11');
                    return;
                }

                // Najdeme odkaz (a tag) obsahující onclick handler
                const saveLink = saveButton.closest('a.ui-menuitem-link');
                if (!saveLink) {
                    console.error('❌ Nepodařilo se najít odkaz tlačítka Uložit');
                    console.log('🔄 V3: Proces dokončen s chybou v kroku 11');
                    return;
                }

                // Získáme ID z onclick atributu
                const onclickAttr = saveLink.getAttribute('onclick');
                const match = onclickAttr.match(/s:"([^"]+)"/);
                if (!match || !match[1]) {
                    console.error('❌ Nepodařilo se extrahovat ID z onclick atributu');
                    console.log('🔄 V3: Proces dokončen s chybou v kroku 11');
                    return;
                }

                const buttonId = match[1].split(':').pop();
                console.log('✅ Nalezeno ID tlačítka:', buttonId);

                // Získáme widgetVar z dialogu
                const dialogId = dialog.id;
                const widgetVar = dialogId.replace('_panel', '');

                // Provedeme akci uložení
                PrimeFaces.ab({
                    s: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm:" + buttonId,
                    f: "_applicantRequestOverview_WAR_workflow_web_INSTANCE_snT90jId9iGb_:mainForm",
                    p: "@widgetVar(" + widgetVar + ")",
                    u: "@widgetVar(" + widgetVar + ") @widgetVar(travelBillingTable) @widgetVar(confirmDlg) @widgetVar(growl)",
                    onst: function(cfg) {
                        startBlock();
                    },
                    onco: function(xhr, status, args, data) {
                        stopBlock();
                        console.log('✅ Tlačítko "Uložit" bylo úspěšně provedeno');
                        
                        // Pokračujeme krokem 12 po 3 sekundách
                        setTimeout(() => {
                            continueStep12();
                        }, 3000);
                    }
                });
            }

            // Zavoláme funkci
            clickSave();
        }

        function continueStep12() {
            console.log('⏳ Čekám 3 sekundy...');
            
            // KROK 12: Stisknout tlačítko "Zavřít"
            console.log('📋 KROK 12: Stiskávám tlačítko "Zavřít"...');
            
            function clickClose() {
                // Najdeme dialog podle jeho záhlaví
                const dialogHeader = Array.from(document.querySelectorAll('.ui-outputlabel-label'))
                    .find(el => el.textContent === 'Detail pobytu na SC');
                
                if (dialogHeader) {
                    // Postupujeme nahoru v DOM až najdeme dialog container
                    const dialog = dialogHeader.closest('.ui-dialog');
                    
                    if (dialog) {
                        console.log('✅ Nalezen dialog "Detail pobytu na SC"');
                        
                        // Najdeme tlačítko zavřít v tomto konkrétním dialogu
                        const closeButton = dialog.querySelector('.ui-dialog-titlebar-close');
                        
                        if (closeButton) {
                            console.log('✅ Nalezeno tlačítko zavřít');
                            closeButton.click();
                            console.log('✅ Dialog byl zavřen');
                            console.log('🎉 V3 DOKONČENO - všech 12 kroků bylo provedeno úspěšně!');
                        } else {
                            console.error('❌ Tlačítko zavřít nebylo nalezeno v dialogu');
                            console.log('🔄 V3: Proces dokončen s chybou v posledním kroku');
                        }
                    } else {
                        console.error('❌ Nepodařilo se najít container dialogu');
                        console.log('🔄 V3: Proces dokončen s chybou v posledním kroku');
                    }
                } else {
                    console.error('❌ Dialog "Detail pobytu na SC" nebyl nalezen');
                    console.log('🔄 V3: Proces dokončen s chybou v posledním kroku');
                }
            }

            // Zavoláme funkci
            clickClose();
        }
        
    } catch (error) {
        console.error('❌ V3: Došlo k chybě v procesu:', error.message);
        console.log('🔄 V3: Proces byl ukončen z důvodu chyby');
    }
}

startAutoFillV3();`;

    // Zobrazení V3 scriptu
    const codeSection = document.getElementById('console-code');
    const codeOutput = document.getElementById('code-output');
    const codeInfo = codeSection.querySelector('.code-info');
    
    codeInfo.innerHTML = `
        <p><strong>🧪 V3 - POSTUPNÉ AUTOMATICKÉ VYPLNĚNÍ</strong></p>
        <p><strong>1. Otevřete stránku se seznamem cestovních příkazů</strong></p>
        <p><strong>2a. Stiskněte F12 na klávesnici</strong></p>
        <p><strong>2b. V horním panelu vyberte Console <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='16' height='16'%3E%3Cpath fill='currentColor' d='M2 1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zm0 1v12h12V2H2zm2 2h8v1H4V4zm0 2h8v1H4V6zm0 2h8v1H4V8zm0 2h5v1H4v-1z'/%3E%3C/svg%3E" alt="Console ikona" style="vertical-align: middle; margin: 0 2px;"/></strong> (pravděpodobně se při prvním spuštění budete nacházet na záložce Sources <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='16' height='16'%3E%3Cpath fill='currentColor' d='M12 4.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5V5a.5.5 0 0 1 .5-.5h8zm-8 7V5H4v6.5zm8-6.5H5v6h7V5z'/%3E%3Cpath fill='currentColor' d='M8 10.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z'/%3E%3C/svg%3E" alt="Sources ikona (brouk)" style="vertical-align: middle; margin: 0 2px;"/>)</p>
        <p><strong>2c. V konzoli z bezpečnostních důvodů nefunguje vkládání, napište tedy "Allow pasting"</strong> (toto je třeba udělat jen při prvním spuštění)</p>
        <p><strong>3. Vložte níže uvedený kód</strong> do konzole a stiskněte Enter</p>
        <p><strong>4. V žádném případě během procesu automatického vyplňování na nic neklikejte až do jeho dokončení. Pokud je potřeba ukončit proces auto vyplňování, stiskněte klávesu Esc.</strong></p>
        <p><em>V3 dělá všechny kroky postupně s 3sekundovými pauzami</em></p>
        <p style="color: #28a745; font-weight: bold;">⚡ Kroky: Otevření záložky Vyúčtování → Postupné načítání a vyplnění formulářů cest tam / zpět, vyplnění pracovního výkonu a pobytu na SC</p>
    `;
    
    codeOutput.value = script;
    codeSection.style.display = 'block';
    codeSection.scrollIntoView({ behavior: 'smooth' });
}

// Funkce pro kopírování do schránky
