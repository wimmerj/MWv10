/* 
==============================================
    INTERAKTIVNÍ VRSTVOVÝ PROHLÍŽEČ
==============================================

OPTIMALIZACE VÝKONU:
- Hover efekty byly deaktivovány pro rychlost
- Místo pixel collision detection používáme předem definované klikací oblasti
- Všechny hover systémy jsou zakomentovány, ale zachovány

MAPOVÁNÍ VRSTEV:
1. Aktivovat "Mapování vrstev" v sekci "Zobrazení a nástroje"
2. Kliknout na vrstvu v panelu "Vrstvy" pro výběr
3. Natáhnout čáru myší na obrázku pro definování klikatelné oblasti
4. Kliknout "Uložit mapování" pro potvrzení
5. Mapování se automaticky ukládá do localStorage
6. Export/import přes tlačítka v mapovacím panelu

NASTAVENÍ KLIKACÍCH OBLASTÍ (starý systém):
1. Zapnout debug mode tlačítkem nebo v konzoli: toggleDebugMode()
2. Klikat na canvas pro získání souřadnic
3. V konzoli použít: setClickableArea("nazev.png", x, y, width, height)
4. Pro rychlé nastavení: setupAllClickableAreas()
5. Export/import: exportClickableAreas() / importClickableAreas(json)

DOSTUPNÉ FUNKCE V KONZOLI:
- enableDebugMode() / disableDebugMode()
- toggleClickableAreasDisplay()
- setClickableArea(layer, x, y, w, h)
- setClickableAreaFromCorners(layer, x1, y1, x2, y2)
- printAllClickableAreas()
- exportClickableAreas()
- setupAllClickableAreas()
- toggleLayerMapping() - zapne/vypne mapovací mód
- exportLayerMappings() - export čárových mapování
- ensureAllLayersHaveLineMappings() - převede obdélníková mapování na čárová
- showMappingStatus() - zobrazí stav všech mapování
- clearAllMappings() - vyčistí všechna mapování
- resetToDefaultMappings() - reset na původní obdélníková mapování
*/

// Globální proměnné
let backgroundImage = null;
let layers = {};
let layerElements = {};
let currentCompositeImage = null;
let excelData1 = null;
let excelData2 = null;
let canvas, ctx;
let isHovering = false;
let lastActiveLayer = null;

// Nové proměnné pro JSON podporu
let jsonLoaded1 = false;
let jsonLoaded2 = false;

// Proměnné pro posouvání a zoom
let offsetX = 0;
let offsetY = 0;
let scale = 1;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

// Inicializace aplikace
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    canvas = document.getElementById('imageCanvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    
    // Event listenery pro tlačítka
    document.getElementById('loadMainFolder').addEventListener('click', () => {
        document.getElementById('mainFolderInput').click();
    });
    
    document.getElementById('loadBackground').addEventListener('click', () => {
        document.getElementById('backgroundInput').click();
    });
        
    document.getElementById('loadExcel1').addEventListener('click', () => {
        document.getElementById('excel1Input').click();
    });
    
    document.getElementById('loadExcel2').addEventListener('click', () => {
        document.getElementById('excel2Input').click();
    });
    
    document.getElementById('resetView').addEventListener('click', resetView);
    
    document.getElementById('testExcelData').addEventListener('click', testExcelData);
    
    // Event listenery pro file inputy
    document.getElementById('mainFolderInput').addEventListener('change', handleMainFolderLoad);
    document.getElementById('backgroundInput').addEventListener('change', handleBackgroundLoad);
    document.getElementById('excel1Input').addEventListener('change', (e) => handleExcelLoad(e, 1));
    document.getElementById('excel2Input').addEventListener('change', (e) => handleExcelLoad(e, 2));
    
    // Event listenery pro canvas
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);
    
    // Event listener pro změnu velikosti okna
    window.addEventListener('resize', resizeCanvas);
    
    // Event listener pro hledání (Enter klávesa)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Event listener pro filtrování (Enter klávesa)
    const filterInput = document.getElementById('filterValue');
    if (filterInput) {
        filterInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                applyDataFilter();
            }
        });
    }
    
    // Inicializace možností sloupců pro filtrování
    setTimeout(() => {
        updateColumnOptions();
    }, 1000); // Počkej až se načtou data
    
    setInfoLabel('Aplikace byla úspěšně inicializována. Použijte kolečko myši pro zoom, táhněte pro posouvání. Pokouším se načíst data automaticky...');
    
    // Automatické načtení dat při spuštění
    autoLoadData();
    autoLoadLayerMappings();
}

// Nové funkce pro JSON podporu
async function loadJSONData() {
    setInfoLabel('Pokouším se načíst JSON soubory...');
    
    // Zkusíme načíst JSON soubory
    await tryLoadJSON1();
    await tryLoadJSON2();
    
    // Aktualizujeme stav tlačítek
    updateExcelButtonsState();
}

async function tryLoadJSON1() {
    try {
        const response = await fetch('./01_Detail_PZS.json');
        if (response.ok) {
            const jsonData = await response.json();
            excelData1 = jsonData;
            jsonLoaded1 = true;
            console.log('JSON soubor 1 byl úspěšně načten:', excelData1);
            setInfoLabel('JSON soubor 1 byl úspěšně načten.');
            return true;
        }
    } catch (error) {
        console.log('JSON soubor 1 nenalezen nebo chyba při načítání:', error);
    }
    return false;
}

async function tryLoadJSON2() {
    try {
        const response = await fetch('./02_Podrobnosti_PZS.json');
        if (response.ok) {
            const jsonData = await response.json();
            excelData2 = jsonData;
            jsonLoaded2 = true;
            console.log('JSON soubor 2 byl úspěšně načten:', excelData2);
            setInfoLabel('JSON soubor 2 byl úspěšně načten.');
            return true;
        }
    } catch (error) {
        console.log('JSON soubor 2 nenalezen nebo chyba při načítání:', error);
    }
    return false;
}

function updateExcelButtonsState() {
    const excel1Button = document.getElementById('loadExcel1');
    const excel2Button = document.getElementById('loadExcel2');
    
    // Pokud jsou JSON soubory načteny, deaktivujeme tlačítka
    if (jsonLoaded1) {
        excel1Button.disabled = true;
        excel1Button.textContent = 'JSON 1 načten';
        excel1Button.style.opacity = '0.6';
    } else {
        excel1Button.disabled = false;
        excel1Button.textContent = 'Načíst Excel 1';
        excel1Button.style.opacity = '1';
    }
    
    if (jsonLoaded2) {
        excel2Button.disabled = true;
        excel2Button.textContent = 'JSON 2 načten';
        excel2Button.style.opacity = '0.6';
    } else {
        excel2Button.disabled = false;
        excel2Button.textContent = 'Načíst Excel 2';
        excel2Button.style.opacity = '1';
    }
}

function resizeCanvas() {
    const imagePanel = document.querySelector('.image-panel');
    canvas.width = imagePanel.clientWidth;
    canvas.height = imagePanel.clientHeight;
    
    if (currentCompositeImage) {
        displayImage(currentCompositeImage);
    }
}

function handleMainFolderLoad(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setInfoLabel('Zpracovávám soubory z hlavní složky...');
    
    // Převedení FileList na pole pro snadnější práci
    const filesArray = Array.from(files);
    
    // Inicializace počítadel
    let loadedComponents = {
        background: false,
        layers: 0,
        excel1: false,
        excel2: false,
        json1: false,
        json2: false
    };
    
    // Vyčištění předchozích dat
    backgroundImage = null;
    layers = {};
    layerElements = {};
    excelData1 = null;
    excelData2 = null;
    jsonLoaded1 = false;
    jsonLoaded2 = false;
    document.getElementById('layersList').innerHTML = '';
    
    // Najít a načíst pozadí (03_BG.png)
    const backgroundFile = filesArray.find(file => 
        file.name === '03_BG.png'
    );
    
    if (backgroundFile) {
        loadBackgroundFromFile(backgroundFile).then(() => {
            loadedComponents.background = true;
            // Inicializace checkboxů na základě mapování
            initializeLayerCheckboxesFromMappings();
            checkAndUpdateStatus(loadedComponents);
        }).catch(error => {
            console.error('Chyba při načítání pozadí:', error);
        });
    }
        
    // Najít a načíst JSON soubory nejprve
    const json1File = filesArray.find(file => 
        file.name === '01_Detail_PZS.json'
    );
    
    const json2File = filesArray.find(file => 
        file.name === '02_Podrobnosti_PZS.json'
    );
    
    if (json1File) {
        loadJSONFromFile(json1File, 1).then(() => {
            loadedComponents.json1 = true;
            jsonLoaded1 = true;
            checkAndUpdateStatus(loadedComponents);
        }).catch(error => {
            console.error('Chyba při načítání JSON 1:', error);
        });
    }
    
    if (json2File) {
        loadJSONFromFile(json2File, 2).then(() => {
            loadedComponents.json2 = true;
            jsonLoaded2 = true;
            checkAndUpdateStatus(loadedComponents);
        }).catch(error => {
            console.error('Chyba při načítání JSON 2:', error);
        });
    }
    
    // Najít a načíst Excel soubory pouze pokud JSON nejsou načteny
    const excel1File = filesArray.find(file => 
        file.name === '01_Detail_PZS.xlsx'
    );
    
    const excel2File = filesArray.find(file => 
        file.name === '02_Podrobnosti_PZS.xlsx'
    );
    
    // Načteme Excel pouze pokud JSON není k dispozici
    if (excel1File && !json1File) {
        loadExcelFromFile(excel1File, 1).then(() => {
            loadedComponents.excel1 = true;
            checkAndUpdateStatus(loadedComponents);
        }).catch(error => {
            console.error('Chyba při načítání Excel 1:', error);
        });
    }
    
    if (excel2File && !json2File) {
        loadExcelFromFile(excel2File, 2).then(() => {
            loadedComponents.excel2 = true;
            checkAndUpdateStatus(loadedComponents);
        }).catch(error => {
            console.error('Chyba při načítání Excel 2:', error);
        });
    }
    
    // Aktualizace stavu tlačítek a po krátké prodlevě
    setTimeout(() => {
        checkAndUpdateStatus(loadedComponents);
        updateExcelButtonsState();
    }, 1000);
}

async function loadJSONFromFile(file, jsonNumber) {
    console.log(`Loading JSON file ${jsonNumber} from folder:`, file.name);
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const jsonData = JSON.parse(e.target.result);
                
                console.log(`JSON ${jsonNumber} from folder loaded successfully`);
                
                if (jsonNumber === 1) {
                    excelData1 = jsonData;
                    console.log('excelData1 loaded from JSON folder:', excelData1);
                } else {
                    excelData2 = jsonData;
                    console.log('excelData2 loaded from JSON folder:', excelData2);
                }
                
                resolve();
            } catch (error) {
                console.error(`Error loading JSON ${jsonNumber} from folder:`, error);
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

function checkAndUpdateStatus(loadedComponents) {
    const status = [];
    
    if (loadedComponents.background) {
        status.push('pozadí');
    }
    
    if (loadedComponents.layers > 0) {
        status.push(`${loadedComponents.layers} vrstev`);
    }
    
    if (loadedComponents.json1) {
        status.push('JSON 1');
    } else if (loadedComponents.excel1) {
        status.push('Excel 1');
    }
    
    if (loadedComponents.json2) {
        status.push('JSON 2');
    } else if (loadedComponents.excel2) {
        status.push('Excel 2');
    }
    
    if (status.length > 0) {
        setInfoLabel(`Z hlavní složky bylo načteno: ${status.join(', ')}.`);
    } else {
        setInfoLabel('Z hlavní složky nebyly nalezeny žádné očekávané soubory. Zkontrolujte strukturu složky.', true);
    }
}

async function loadBackgroundFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                backgroundImage = img;
                updateCompositeImage();
                resolve();
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function loadExcelFromFile(file, excelNumber) {
    console.log(`Loading Excel file ${excelNumber} from folder:`, file.name);
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                
                console.log(`Excel ${excelNumber} from folder - sheet names:`, workbook.SheetNames);
                
                const excelData = {};
                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
                    excelData[sheetName] = jsonData;
                    console.log(`Sheet ${sheetName} from folder has ${jsonData.length} rows`);
                });
                
                if (excelNumber === 1) {
                    excelData1 = excelData;
                    console.log('excelData1 loaded from folder:', excelData1);
                } else {
                    excelData2 = excelData;
                    console.log('excelData2 loaded from folder:', excelData2);
                }
                
                resolve();
            } catch (error) {
                console.error(`Error loading Excel ${excelNumber} from folder:`, error);
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function handleBackgroundLoad(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.includes('png')) {
        setInfoLabel('Podporovány jsou pouze PNG soubory!', true);
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            backgroundImage = img;
            // Inicializace checkboxů na základě mapování
            initializeLayerCheckboxesFromMappings();
            updateCompositeImage();
            setInfoLabel('Pozadí bylo úspěšně načteno.');
        };
        img.onerror = function() {
            setInfoLabel('Chyba při načítání pozadí!', true);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}


// NOVÁ FUNKCE - Vytvoření checkboxů na základě mapování vrstev (bez načítání obrázků)
function initializeLayerCheckboxesFromMappings() {
    const layersList = document.getElementById('layersList');
    layersList.innerHTML = ''; // Vyčistit seznam
    layerElements = {};
    
    // Vytvoříme checkboxy pro všechny vrstvy z mapování
    Object.keys(clickableAreas).forEach(layerName => {
        createLayerCheckbox(layerName);
    });
    
    console.log('Vytvořeny checkboxy pro vrstvy z mapování:', Object.keys(clickableAreas));
}

function createLayerCheckbox(layerName) {
    const layersList = document.getElementById('layersList');
    
    const layerItem = document.createElement('div');
    layerItem.className = 'layer-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `layer_${layerName}`;
    checkbox.checked = true;
    checkbox.addEventListener('change', updateCompositeImage);
    
    const label = document.createElement('label');
    label.htmlFor = `layer_${layerName}`;
    label.textContent = layerName;
    
    // Přidáme click handler pro výběr vrstvy v mapovacím módu
    layerItem.addEventListener('click', function(event) {
        // Pokud klik nebyl na checkbox, můžeme zpracovat výběr pro mapování
        if (isLayerMappingMode && event.target !== checkbox) {
            selectLayerForMapping(layerName);
            event.preventDefault();
            event.stopPropagation();
        }
    });
    
    layerItem.appendChild(checkbox);
    layerItem.appendChild(label);
    layersList.appendChild(layerItem);
    
    layerElements[layerName] = checkbox;
}

function updateCompositeImage() {
    if (!backgroundImage) {
        setInfoLabel('Nejprve načtěte pozadí!', true);
        return;
    }
    
    // Použití nové funkce pro full redraw - kreslí pouze pozadí bez vrstev
    drawLayersOptimized(true);    
}

function displayImage(image) {
    if (!image) {
        // Pokud nemáme obrázek, použijeme novou funkci pro full redraw
        drawLayersOptimized(true);
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Výpočet velikosti pro zachování poměru stran
    const baseScale = Math.min(canvas.width / image.width, canvas.height / image.height);
    const currentScale = baseScale * scale;
    const scaledWidth = image.width * currentScale;
    const scaledHeight = image.height * currentScale;
    
    // Vycentrování obrázku s přidaným offsetem
    const baseX = (canvas.width - scaledWidth) / 2;
    const baseY = (canvas.height - scaledHeight) / 2;
    const x = baseX + offsetX;
    const y = baseY + offsetY;
    
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
    
    // Uložení parametrů pro další použití
    canvas.imageScale = currentScale;
    canvas.imageOffsetX = x;
    canvas.imageOffsetY = y;
    canvas.scaledWidth = scaledWidth;
    canvas.scaledHeight = scaledHeight;
    canvas.baseScale = baseScale;
}

function handleMouseDown(event) {
    // Nejdříve zkusíme mapovací mód
    if (handleMappingMouseDown(event)) {
        return; // Mapovací mód zpracoval událost
    }
    
    if (event.button === 0) { // Levé tlačítko myši
        isDragging = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        canvas.style.cursor = 'grabbing';
        event.preventDefault();
    }
}

function handleMouseUp(event) {
    // Nejdříve zkusíme mapovací mód
    if (handleMappingMouseUp(event)) {
        return; // Mapovací mód zpracoval událost
    }
    
    if (event.button === 0) {
        isDragging = false;
        canvas.style.cursor = 'grab';
    }
}

function handleWheel(event) {
    event.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Zoom směrem k pozici myši
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const oldScale = scale;
    scale = Math.max(0.1, Math.min(5, scale * zoomFactor)); // Omezení zoom rozsahu
    
    if (scale !== oldScale) {
        // Přizpůsobení offsetu tak, aby zoom směřoval k myši
        const scaleChange = scale / oldScale;
        offsetX = mouseX - (mouseX - offsetX) * scaleChange;
        offsetY = mouseY - (mouseY - offsetY) * scaleChange;
        
        // Použití nové funkce pro full redraw
        drawLayersOptimized(true);
    }
}

function resetView() {
    offsetX = 0;
    offsetY = 0;
    scale = 1;
    // Použití nové funkce pro full redraw
    drawLayersOptimized(true);
}

function handleMouseMove(event) {
    // Nejdříve zkusíme mapovací mód
    if (handleMappingMouseMove(event)) {
        return; // Mapovací mód zpracoval událost
    }
    
    // Pokud táhneme, aktualizujeme offset
    if (isDragging) {
        const deltaX = event.clientX - lastMouseX;
        const deltaY = event.clientY - lastMouseY;
        
        offsetX += deltaX;
        offsetY += deltaY;
        
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        
        // Použití nové funkce pro full redraw
        drawLayersOptimized(true);
        return;
    }
    
}

function handleMouseLeave() {
    if (isHovering) {
        restoreOriginalStates();
        isHovering = false;
    }
}

function findActiveLayer(x, y) {
    // Procházení vrstev v opačném pořadí (shora dolů)
    const layerNames = Object.keys(layers).reverse();
    
    for (const layerName of layerNames) {
        const checkbox = layerElements[layerName];
        if (checkbox && checkbox.checked) {
            // Simulace kontroly pixel alpha kanálu
            // V reálné implementaci by bylo třeba získat pixel data
            if (isPixelVisible(layers[layerName], x, y)) {
                return layerName;
            }
        }
    }
    return null;
}

function isPixelVisible(layerImg, x, y) {
    // Vytvoření dočasného canvasu pro kontrolu pixelu
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = layerImg.width;
    tempCanvas.height = layerImg.height;
    
    tempCtx.drawImage(layerImg, 0, 0);
    
    try {
        const imageData = tempCtx.getImageData(Math.floor(x), Math.floor(y), 1, 1);
        const alpha = imageData.data[3];
        return alpha > 0; // Pixel je viditelný, pokud má alpha > 0
    } catch (e) {
        // Fallback pokud nelze získat pixel data (např. kvůli CORS)
        return true;
    }
}


// ===========================================
// JEDNODUCHÉ ŘEŠENÍ - BEZ HOVER EFEKTU
// ===========================================

function handleLayerHover(activeLayer) {
    // Deaktivován hover efekt - nic se neděje při hover
    lastActiveLayer = activeLayer;
}

function restoreOriginalStates() {
    // Deaktivován hover efekt - nic se neděje
}

// ===========================================
// DEBUGGING A VIZUALIZACE KLIKACÍCH OBLASTÍ
// ===========================================

// Globální proměnná pro zobrazení/skrytí oblastí
let showClickableAreas = false;
let debugMode = false;

function toggleClickableAreasDisplay() {
    showClickableAreas = !showClickableAreas;
    drawLayersOptimized(true); // Překreslíme s/bez oblastí
    
    const button = document.getElementById('toggleAreasButton');
    if (button) {
        button.textContent = showClickableAreas ? 'Skrýt oblasti' : 'Zobrazit oblasti';
    }
}

function toggleDebugMode() {
    debugMode = !debugMode;
    const button = document.getElementById('debugModeButton');
    if (button) {
        button.textContent = debugMode ? 'Vypnout debug' : 'Debug mode';
    }
    
    if (debugMode) {
        setInfoLabel('Debug mode aktivní - klikněte pro získání souřadnic', false);
        console.log('Debug mode aktivován - klikněte na canvas pro získání souřadnic');
        console.log('Dostupné debug funkce:');
        console.log('- enableDebugMode() / disableDebugMode()');
        console.log('- setClickableArea(layerName, x, y, width, height)');
        console.log('- printAllClickableAreas()');
        console.log('- showImageInfo() - zobrazí rozměry obrázku');
        
        // Automaticky zobrazíme informace o obrázku
        showImageInfo();
    } else {
        setInfoLabel('Debug mode deaktivován', false);
        console.log('Debug mode deaktivován');
    }
}

// Funkce pro zobrazení informací o obrázku
function showImageInfo() {
    if (!backgroundImage) {
        console.log('Žádný obrázek není načten');
        return;
    }
    
    console.log('=== INFORMACE O OBRÁZKU ===');
    console.log(`Původní rozměry: ${backgroundImage.width} x ${backgroundImage.height} px`);
    
    if (canvas.imageScale && canvas.scaledWidth && canvas.scaledHeight) {
        console.log(`Aktuální škálování: ${(canvas.imageScale / canvas.baseScale * 100).toFixed(1)}%`);
        console.log(`Zobrazené rozměry: ${Math.round(canvas.scaledWidth)} x ${Math.round(canvas.scaledHeight)} px`);
        console.log(`Pozice na canvas: (${Math.round(canvas.imageOffsetX)}, ${Math.round(canvas.imageOffsetY)})`);
    }
    
    console.log('Canvas rozměry:', canvas.width, 'x', canvas.height, 'px');
    console.log('');
    console.log('PRO NASTAVENÍ OBLASTÍ:');
    console.log('1. Zapněte zobrazení oblastí tlačítkem "Zobrazit oblasti"');
    console.log('2. Klikejte na obrázek v debug módu pro získání souřadnic');
    console.log('3. Použijte setClickableArea("vrstva.png", x, y, width, height)');
    console.log('');
}

function enableDebugMode() {
    debugMode = true;
    console.log('Debug mode aktivován - klikněte na canvas pro získání souřadnic');
}

function disableDebugMode() {
    debugMode = false;
    console.log('Debug mode deaktivován');
}

// Funkce pro získání souřadnic v rámci obrázku
function getImageCoordinates(canvasX, canvasY) {
    if (!canvas.imageOffsetX || !canvas.imageScale) return null;
    
    const imageX = (canvasX - canvas.imageOffsetX) / canvas.imageScale;
    const imageY = (canvasY - canvas.imageOffsetY) / canvas.imageScale;
    
    return { x: Math.round(imageX), y: Math.round(imageY) };
}

// Funkce pro snadnější nastavení klikacích oblastí
function setClickableArea(layerName, x, y, width, height) {
    clickableAreas[layerName] = { x, y, width, height };
    console.log(`Oblast pro ${layerName} nastavena:`, clickableAreas[layerName]);
}

// Funkce pro výpis všech aktuálních oblastí
function printAllClickableAreas() {
    console.log('Aktuální klikací oblasti:');
    for (const [layerName, area] of Object.entries(clickableAreas)) {
        console.log(`${layerName}:`, area);
    }
}

function drawClickableAreasOverlay() {
    if (!showClickableAreas || !backgroundImage) return;
    
    ctx.save();
    
    // Nakreslíme všechny definované oblasti
    for (const [layerName, area] of Object.entries(clickableAreas)) {
        // Kontrola, zda je vrstva aktivní (volitelná - můžeme zobrazit i neaktivní)
        const checkbox = layerElements[layerName];
        
        // Změníme barvu podle stavu vrstvy
        if (!checkbox || !checkbox.checked) {
            ctx.strokeStyle = '#ff4444';  // Červený pro neaktivní
            ctx.fillStyle = 'rgba(255, 68, 68, 0.15)';
        } else {
            ctx.strokeStyle = '#44ff44';  // Zelený pro aktivní
            ctx.fillStyle = 'rgba(68, 255, 68, 0.15)';
        }
        
        if (area.type === 'line') {
            // Kreslení čárové oblasti
            const startCanvasX = canvas.imageOffsetX + (area.startX * canvas.imageScale);
            const startCanvasY = canvas.imageOffsetY + (area.startY * canvas.imageScale);
            const endCanvasX = canvas.imageOffsetX + (area.endX * canvas.imageScale);
            const endCanvasY = canvas.imageOffsetY + (area.endY * canvas.imageScale);
            const thickness = area.thickness * canvas.imageScale;
            
            // Klikatelná oblast (tloušťka)
            ctx.lineWidth = thickness;
            ctx.lineCap = 'round';
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.moveTo(startCanvasX, startCanvasY);
            ctx.lineTo(endCanvasX, endCanvasY);
            ctx.stroke();
            
            // Střední čára
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.moveTo(startCanvasX, startCanvasY);
            ctx.lineTo(endCanvasX, endCanvasY);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Body na koncích
            const pointRadius = 4;
            ctx.fillStyle = ctx.strokeStyle;
            ctx.beginPath();
            ctx.arc(startCanvasX, startCanvasY, pointRadius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(endCanvasX, endCanvasY, pointRadius, 0, 2 * Math.PI);
            ctx.fill();
            
            // Popisek
            const midX = (startCanvasX + endCanvasX) / 2;
            const midY = (startCanvasY + endCanvasY) / 2;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(midX - 75, midY - 15, 150, 30);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(layerName.replace('.png', ''), midX, midY + 4);
            ctx.textAlign = 'left';
            
        } else {
            // Kreslení obdélníkové oblasti (starý systém)
            const canvasX = canvas.imageOffsetX + (area.x * canvas.imageScale);
            const canvasY = canvas.imageOffsetY + (area.y * canvas.imageScale);
            const canvasWidth = area.width * canvas.imageScale;
            const canvasHeight = area.height * canvas.imageScale;
            
            // Silnější obrys
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 4]); // Delší čárkovaný styl
            
            // Nakreslíme oblast
            ctx.fillRect(canvasX, canvasY, canvasWidth, canvasHeight);
            ctx.strokeRect(canvasX, canvasY, canvasWidth, canvasHeight);
            
            // Přidáme popisek s pozadím
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(canvasX + 2, canvasY + 2, 150, 35);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(layerName.replace('.png', ''), canvasX + 5, canvasY + 17);
            
            // Přidáme souřadnice do popisku
            ctx.font = '10px Arial';
            ctx.fillText(`${area.x},${area.y} (${area.width}x${area.height})`, canvasX + 5, canvasY + 30);
            ctx.setLineDash([]);
        }
    }
    
    ctx.restore();
}

function drawLayersOptimized(forceFullRedraw = false) {
    // Jednoduchá verze - vždy jen překreslí všechny aktivní vrstvy
    drawFullImage();
}

function drawFullImage() {
    if (!backgroundImage) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Výpočet velikosti pro zachování poměru stran
    const baseScale = Math.min(canvas.width / backgroundImage.width, canvas.height / backgroundImage.height);
    const currentScale = baseScale * scale;
    const scaledWidth = backgroundImage.width * currentScale;
    const scaledHeight = backgroundImage.height * currentScale;
    
    // Vycentrování obrázku s přidaným offsetem
    const baseX = (canvas.width - scaledWidth) / 2;
    const baseY = (canvas.height - scaledHeight) / 2;
    const x = baseX + offsetX;
    const y = baseY + offsetY;
    
    // Kreslení pozadí
    ctx.drawImage(backgroundImage, x, y, scaledWidth, scaledHeight);
    
    // Zobrazit všechny aktivní vrstvy
    Object.keys(layers).forEach(layerName => {
        const checkbox = layerElements[layerName];
        if (checkbox && checkbox.checked) {
            ctx.drawImage(layers[layerName], x, y, scaledWidth, scaledHeight);
        }
    });
    
    // Uložení parametrů pro další použití
    canvas.imageScale = currentScale;
    canvas.imageOffsetX = x;
    canvas.imageOffsetY = y;
    canvas.scaledWidth = scaledWidth;
    canvas.scaledHeight = scaledHeight;
    canvas.baseScale = baseScale;
    
    // Nakreslíme klikací oblasti pokud jsou zapnuté
    drawClickableAreasOverlay();
    
    // Nakreslíme mapovací čáry pokud je mapovací mód aktivní
    drawMappingLines();
}

// ===========================================
// PEVNĚ DEFINOVANÉ OBLASTI PRO RYCHLÉ KLIKÁNÍ
// ===========================================

// Definice klikacích oblastí pro jednotlivé vrstvy
// Souřadnice jsou v původní velikosti obrázku (nejsou škálované)
// Výchozí mapování vrstev (čárová mapování ze souboru layer_mappings.json)
let clickableAreas = {
    "522A.png": {
        "type": "line",
        "startX": 2537,
        "startY": 594,
        "endX": 2207,
        "endY": 790,
        "thickness": 150
    },
    "709B.png": {
        "type": "line",
        "startX": 2210,
        "startY": 1963,
        "endX": 3238,
        "endY": 2508,
        "thickness": 150
    },
    "710A.png": {
        "type": "line",
        "startX": 2199,
        "startY": 2627,
        "endX": 3238,
        "endY": 2687,
        "thickness": 150
    },
    "710B.png": {
        "type": "line",
        "startX": 1569,
        "startY": 2872,
        "endX": 2132,
        "endY": 2776,
        "thickness": 150
    },
    "711.png": {
        "type": "line",
        "startX": 1916,
        "startY": 1821,
        "endX": 2347,
        "endY": 3273,
        "thickness": 150
    },
    "712A.png": {
        "type": "line",
        "startX": 1564,
        "startY": 1909,
        "endX": 1541,
        "endY": 3367,
        "thickness": 150
    },
    "712B.png": {
        "type": "line",
        "startX": 986,
        "startY": 2044,
        "endX": 1465,
        "endY": 2013,
        "thickness": 150
    },
    "713A.png": {
        "type": "line",
        "startX": 2935,
        "startY": 1160,
        "endX": 2046,
        "endY": 1693,
        "thickness": 150
    },
    "714A.png": {
        "type": "line",
        "startX": 2723,
        "startY": 1551,
        "endX": 2595,
        "endY": 2011,
        "thickness": 150
    },
    "714B.png": {
        "type": "line",
        "startX": 2562,
        "startY": 845,
        "endX": 2163,
        "endY": 1467,
        "thickness": 150
    },
    "714C.png": {
        "type": "line",
        "startX": 1711,
        "startY": 748,
        "endX": 1452,
        "endY": 1367,
        "thickness": 150
    },
    "717A.png": {
        "type": "line",
        "startX": 179,
        "startY": 1471,
        "endX": 991,
        "endY": 3004,
        "thickness": 150
    },
    "717B.png": {
        "type": "line",
        "startX": 1016,
        "startY": 1334,
        "endX": 270,
        "endY": 1413,
        "thickness": 150
    },
    "717C.png": {
        "type": "line",
        "startX": 1430,
        "startY": 2557,
        "endX": 1045,
        "endY": 2818,
        "thickness": 150
    },
    "719.png": {
        "type": "line",
        "startX": 2045,
        "startY": 460,
        "endX": 1953,
        "endY": 1671,
        "thickness": 150
    },
    "720A.png": {
        "type": "line",
        "startX": 288,
        "startY": 486,
        "endX": 1683,
        "endY": 1777,
        "thickness": 150
    },
    "legenda.png": {
        "type": "line",
        "startX": 3163,
        "startY": 123,
        "endX": 3168,
        "endY": 1023,
        "thickness": 150
    },
    "nadpis.png": {
        "type": "line",
        "startX": 2717,
        "startY": 195,
        "endX": 795,
        "endY": 171,
        "thickness": 150
    },
    "PLZEŇ.png": {
        "type": "line",
        "startX": 1899,
        "startY": 1759,
        "endX": 1739,
        "endY": 1783,
        "thickness": 150
    }
};

// Funkce pro vyčištění všech mapování (návrat k defaultnímu stavu)
function clearAllMappings() {
    layerLineMappings = {};
    clickableAreas = {};
    console.log('Všechna mapování vyčištěna');
    saveLayerMappingsToStorage();
    drawLayersOptimized(true);
}

// Funkce pro reset na defaultní čárová mapování ze souboru layer_mappings.json
function resetToDefaultMappings() {
    layerLineMappings = {
        "522A.png": { "startX": 2537, "startY": 594, "endX": 2207, "endY": 790, "thickness": 150 },
        "710A.png": { "startX": 2199, "startY": 2627, "endX": 3238, "endY": 2687, "thickness": 150 },
        "710B.png": { "startX": 1569, "startY": 2872, "endX": 2132, "endY": 2776, "thickness": 150 },
        "712B.png": { "startX": 986, "startY": 2044, "endX": 1465, "endY": 2013, "thickness": 150 },
        "713A.png": { "startX": 2935, "startY": 1160, "endX": 2046, "endY": 1693, "thickness": 150 },
        "717B.png": { "startX": 1016, "startY": 1334, "endX": 270, "endY": 1413, "thickness": 150 },
        "714C.png": { "startX": 1711, "startY": 748, "endX": 1452, "endY": 1367, "thickness": 150 },
        "709B.png": { "startX": 2210, "startY": 1963, "endX": 3238, "endY": 2508, "thickness": 150 },
        "712A.png": { "startX": 1564, "startY": 1909, "endX": 1541, "endY": 3367, "thickness": 150 },
        "711.png": { "startX": 1916, "startY": 1821, "endX": 2347, "endY": 3273, "thickness": 150 },
        "714A.png": { "startX": 2723, "startY": 1551, "endX": 2595, "endY": 2011, "thickness": 150 },
        "714B.png": { "startX": 2562, "startY": 845, "endX": 2163, "endY": 1467, "thickness": 150 },
        "717A.png": { "startX": 179, "startY": 1471, "endX": 991, "endY": 3004, "thickness": 150 },
        "717C.png": { "startX": 1430, "startY": 2557, "endX": 1045, "endY": 2818, "thickness": 150 },
        "719.png": { "startX": 2045, "startY": 460, "endX": 1953, "endY": 1671, "thickness": 150 },
        "nadpis.png": { "startX": 2717, "startY": 195, "endX": 795, "endY": 171, "thickness": 150 },
        "PLZEŇ.png": { "startX": 1899, "startY": 1759, "endX": 1739, "endY": 1783, "thickness": 150 },
        "720A.png": { "startX": 288, "startY": 486, "endX": 1683, "endY": 1777, "thickness": 150 },
        "legenda.png": { "startX": 3163, "startY": 123, "endX": 3168, "endY": 1023, "thickness": 150 }
    };
    clickableAreas = {
        "522A.png": { "type": "line", "startX": 2537, "startY": 594, "endX": 2207, "endY": 790, "thickness": 150 },
        "709B.png": { "type": "line", "startX": 2210, "startY": 1963, "endX": 3238, "endY": 2508, "thickness": 150 },
        "710A.png": { "type": "line", "startX": 2199, "startY": 2627, "endX": 3238, "endY": 2687, "thickness": 150 },
        "710B.png": { "type": "line", "startX": 1569, "startY": 2872, "endX": 2132, "endY": 2776, "thickness": 150 },
        "711.png": { "type": "line", "startX": 1916, "startY": 1821, "endX": 2347, "endY": 3273, "thickness": 150 },
        "712A.png": { "type": "line", "startX": 1564, "startY": 1909, "endX": 1541, "endY": 3367, "thickness": 150 },
        "712B.png": { "type": "line", "startX": 986, "startY": 2044, "endX": 1465, "endY": 2013, "thickness": 150 },
        "713A.png": { "type": "line", "startX": 2935, "startY": 1160, "endX": 2046, "endY": 1693, "thickness": 150 },
        "714A.png": { "type": "line", "startX": 2723, "startY": 1551, "endX": 2595, "endY": 2011, "thickness": 150 },
        "714B.png": { "type": "line", "startX": 2562, "startY": 845, "endX": 2163, "endY": 1467, "thickness": 150 },
        "714C.png": { "type": "line", "startX": 1711, "startY": 748, "endX": 1452, "endY": 1367, "thickness": 150 },
        "717A.png": { "type": "line", "startX": 179, "startY": 1471, "endX": 991, "endY": 3004, "thickness": 150 },
        "717B.png": { "type": "line", "startX": 1016, "startY": 1334, "endX": 270, "endY": 1413, "thickness": 150 },
        "717C.png": { "type": "line", "startX": 1430, "startY": 2557, "endX": 1045, "endY": 2818, "thickness": 150 },
        "719.png": { "type": "line", "startX": 2045, "startY": 460, "endX": 1953, "endY": 1671, "thickness": 150 },
        "720A.png": { "type": "line", "startX": 288, "startY": 486, "endX": 1683, "endY": 1777, "thickness": 150 },
        "legenda.png": { "type": "line", "startX": 3163, "startY": 123, "endX": 3168, "endY": 1023, "thickness": 150 },
        "nadpis.png": { "type": "line", "startX": 2717, "startY": 195, "endX": 795, "endY": 171, "thickness": 150 },
        "PLZEŇ.png": { "type": "line", "startX": 1899, "startY": 1759, "endX": 1739, "endY": 1783, "thickness": 150 }
    };
    console.log('Reset na defaultní čárová mapování ze souboru layer_mappings.json');
    saveLayerMappingsToStorage();
    drawLayersOptimized(true);
}

function findClickableArea(mouseX, mouseY) {
    // Kontrola, zda máme parametry obrázku
    if (!canvas.imageOffsetX || !canvas.imageScale) {
        console.log('Chyba: Parametry obrázku nejsou k dispozici');
        return null;
    }
    
    // Převod souřadnic myši na souřadnice v původním obrázku
    const imgX = (mouseX - canvas.imageOffsetX) / canvas.imageScale;
    const imgY = (mouseY - canvas.imageOffsetY) / canvas.imageScale;
    
    console.log(`Klik na canvas: (${mouseX}, ${mouseY}) -> Obrázek: (${Math.round(imgX)}, ${Math.round(imgY)})`);
    
    // Kontrola, zda je klik uvnitř obrázku
    if (imgX < 0 || imgY < 0 || imgX > backgroundImage.width || imgY > backgroundImage.height) {
        console.log('Klik mimo obrázek');
        return null;
    }
    
    // Kontrola, zda je myš nad obrázkem
    if (imgX < 0 || imgX >= backgroundImage.width || imgY < 0 || imgY >= backgroundImage.height) {
        return null;
    }
    
    // Projdeme všechny definované oblasti
    for (const [layerName, area] of Object.entries(clickableAreas)) {
        // Kontrola, zda je vrstva aktivní (checkbox checked)
        const checkbox = layerElements[layerName];
        if (!checkbox || !checkbox.checked) {
            continue; // Přeskočíme neaktivní vrstvy
        }
        
        // Detekce podle typu oblasti
        let isInArea = false;
        
        if (area.type === 'line') {
            // Čárové mapování - kontrola vzdálenosti od čáry
            isInArea = isPointNearLine(imgX, imgY, area.startX, area.startY, area.endX, area.endY, area.thickness);
        } else {
            // Obdélníkové mapování (starý systém)
            isInArea = (imgX >= area.x && imgX <= area.x + area.width &&
                       imgY >= area.y && imgY <= area.y + area.height);
        }
        
        if (isInArea) {
            console.log(`✅ Nalezena aktivní oblast: ${layerName} (${area.type || 'rectangle'})`);
            return layerName;
        }
    }
    
    console.log('❌ Klik není v žádné aktivní oblasti');
    
    // Pro debugging - ukázat všechny aktivní oblasti
    const activeAreas = [];
    for (const [layerName, area] of Object.entries(clickableAreas)) {
        const checkbox = layerElements[layerName];
        if (checkbox && checkbox.checked) {
            if (area.type === 'line') {
                activeAreas.push(`${layerName}: čára (${area.startX},${area.startY})→(${area.endX},${area.endY}) tl:${area.thickness}`);
            } else {
                activeAreas.push(`${layerName}: obdélník (${area.x}-${area.x + area.width}, ${area.y}-${area.y + area.height})`);
            }
        }
    }
    
    if (activeAreas.length > 0) {
        console.log('Aktivní oblasti:', activeAreas);
    } else {
        console.log('⚠️ Žádné vrstvy nejsou aktivní (zaškrtnuté)');
    }
    
    return null; // Klik není v žádné definované oblasti
}

// Pomocná funkce pro výpočet vzdálenosti bodu od úsečky
function isPointNearLine(pointX, pointY, lineStartX, lineStartY, lineEndX, lineEndY, thickness) {
    // Vektor čáry
    const lineVecX = lineEndX - lineStartX;
    const lineVecY = lineEndY - lineStartY;
    
    // Vektor od začátku čáry k bodu
    const pointVecX = pointX - lineStartX;
    const pointVecY = pointY - lineStartY;
    
    // Délka čáry na druhou
    const lineLengthSq = lineVecX * lineVecX + lineVecY * lineVecY;
    
    // Pokud je čára bod, kontrolujeme vzdálenost od bodu
    if (lineLengthSq === 0) {
        const dist = Math.sqrt(pointVecX * pointVecX + pointVecY * pointVecY);
        return dist <= thickness;
    }
    
    // Projekce bodu na čáru (parametr t)
    const t = Math.max(0, Math.min(1, (pointVecX * lineVecX + pointVecY * lineVecY) / lineLengthSq));
    
    // Nejbližší bod na úsečce
    const closestX = lineStartX + t * lineVecX;
    const closestY = lineStartY + t * lineVecY;
    
    // Vzdálenost od nejbližšího bodu
    const distX = pointX - closestX;
    const distY = pointY - closestY;
    const distance = Math.sqrt(distX * distX + distY * distY);
    
    return distance <= thickness;
}

function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Debug mode - vypisování souřadnic
    if (debugMode) {
        const imageCoords = getImageCoordinates(mouseX, mouseY);
        if (imageCoords) {
            console.log(`Canvas: (${mouseX}, ${mouseY}) -> Image: (${imageCoords.x}, ${imageCoords.y})`);
            setInfoLabel(`Souřadnice: Canvas (${mouseX}, ${mouseY}) -> Image (${imageCoords.x}, ${imageCoords.y})`, false);
            
            // Kopírovat do schránky pro snadné použití
            const coordText = `x: ${imageCoords.x}, y: ${imageCoords.y}`;
            navigator.clipboard.writeText(coordText).then(() => {
                console.log(`Souřadnice zkopírovány do schránky: ${coordText}`);
            });
        }
        return; // V debug módu nevolej další akce
    }
    
    if (!backgroundImage || !excelData1) {
        setInfoLabel('Nejprve načtěte pozadí a Excel soubor s daty!', true);
        return;
    }
    
    // Použití nového systému s pevně definovanými oblastmi
    const clickedLayer = findClickableArea(mouseX, mouseY);
    
    if (clickedLayer) {
        console.log(`Kliknuto na vrstvu: ${clickedLayer}`);
        showExcelData(clickedLayer);
    } else {
        console.log('Klik mimo definované oblasti');
        setInfoLabel('Klikněte na některou z označených oblastí pro zobrazení dat.', false);
    }
}

function handleExcelLoad(event, excelNumber) {
    // Tato funkce se volá pouze pokud JSON soubor nebyl načten
    const file = event.target.files[0];
    if (!file) return;
    
    console.log(`Loading Excel file ${excelNumber}:`, file.name);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            
            console.log(`Excel ${excelNumber} sheet names:`, workbook.SheetNames);
            
            const excelData = {};
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
                excelData[sheetName] = jsonData;
                console.log(`Sheet ${sheetName} has ${jsonData.length} rows`);
            });
            
            if (excelNumber === 1) {
                excelData1 = excelData;
                console.log('excelData1 set to:', excelData1);
                setInfoLabel(`Excel soubor 1 byl úspěšně načten. Listy: ${Object.keys(excelData).join(', ')}`);
            } else {
                excelData2 = excelData;
                console.log('excelData2 set to:', excelData2);
                setInfoLabel(`Excel soubor 2 byl úspěšně načten. Listy: ${Object.keys(excelData).join(', ')}`);
            }
            
        } catch (error) {
            console.error(`Error loading Excel file ${excelNumber}:`, error);
            setInfoLabel(`Chyba při načítání Excel souboru ${excelNumber}: ${error.message}`, true);
        }
    };
    reader.readAsArrayBuffer(file);
}

function showExcelData(layerName) {
    const sheetName = layerName.replace('.png', '');
    
    // Debug informace
    console.log('showExcelData called with layerName:', layerName);
    console.log('sheetName:', sheetName);
    console.log('excelData1:', excelData1);
    console.log('excelData2:', excelData2);
    
    if (!excelData1) {
        setInfoLabel('Excel soubor 1 není načten. Nejprve načtěte Excel soubory.', true);
        return;
    }
    
    console.log('Available sheets in excelData1:', Object.keys(excelData1));
    
    if (!excelData1[sheetName]) {
        setInfoLabel(`List '${sheetName}' nebyl nalezen v Excel souboru 1. Dostupné listy: ${Object.keys(excelData1).join(', ')}`, true);
        return;
    }
    
    try {
        const sheetData = excelData1[sheetName];
        console.log('sheetData for', sheetName, ':', sheetData);
        
        if (!sheetData || sheetData.length === 0) {
            setInfoLabel(`List '${sheetName}' neobsahuje žádná data.`, true);
            return;
        }
        
        // Zpracování dat podle formátu z Python aplikace
        // Data začínají od řádku 5 (index 4), sloupce B až S (index 1-18)
        console.log('Raw sheetData structure:');
        sheetData.slice(0, 6).forEach((row, i) => {
            console.log(`Row ${i}:`, row);
        });
        
        // Flexibilnější zpracování - zkus najít hlavičky
        let headerRowIndex = -1;
        let dataStartIndex = -1;
        
        // Hledání řádku s hlavičkami (řádek s nejvíce neprázdnými buňkami)
        for (let i = 0; i < Math.min(10, sheetData.length); i++) {
            const row = sheetData[i];
            if (row && row.length > 0) {
                const nonEmptyCount = row.filter(cell => cell && String(cell).trim() !== '').length;
                console.log(`Row ${i} has ${nonEmptyCount} non-empty cells:`, row);
                if (nonEmptyCount > 3) { // Předpokládáme, že hlavičky mají alespoň 3 sloupce
                    headerRowIndex = i;
                    dataStartIndex = i + 1;
                    break;
                }
            }
        }
        
        // Fallback na původní logiku pouze pokud nenajdeme lepší hlavičky
        if (headerRowIndex === -1) {
            // Zkusíme různé možnosti pro headerRowIndex
            if (sheetData.length > 4 && sheetData[3] && sheetData[3].some(cell => cell && !String(cell).includes('Unnamed'))) {
                headerRowIndex = 3;
                dataStartIndex = 4;
                console.log('Using fallback: headerRowIndex = 3 (řádek 4 v Excelu)');
            } else if (sheetData.length > 0 && sheetData[0] && sheetData[0].some(cell => cell && !String(cell).includes('Unnamed'))) {
                headerRowIndex = 0;
                dataStartIndex = 1;
                console.log('Using fallback: headerRowIndex = 0 (první řádek)');
            } else {
                headerRowIndex = 0;
                dataStartIndex = 1;
                console.log('Using last fallback: headerRowIndex = 0');
            }
        }
        
        console.log('Using headerRowIndex:', headerRowIndex, 'dataStartIndex:', dataStartIndex);
        
        const relevantData = sheetData.slice(dataStartIndex).map(row => row && row.slice ? row.slice(1, 19) : []);
        const headers = sheetData[headerRowIndex] ? sheetData[headerRowIndex].slice(1, 19) : [];
        
        // Filtrování prázdných řádků
        const filteredData = relevantData.filter(row => {
            return row && row.some(cell => cell && String(cell).trim() !== '');
        });
        
        console.log('headers:', headers);
        console.log('relevantData length:', relevantData.length);
        console.log('filteredData length:', filteredData.length);
        console.log('Sample filtered data:', filteredData.slice(0, 3));
        
        displayDataModal(sheetName, headers, filteredData);
        
    } catch (error) {
        console.error('Error in showExcelData:', error);
        setInfoLabel(`Chyba při zpracování dat pro vrstvu '${sheetName}': ${error.message}`, true);
    }
}

function displayDataModal(sheetName, headers, data) {
    console.log('displayDataModal called with:');
    console.log('sheetName:', sheetName);
    console.log('headers:', headers);
    console.log('data:', data);
    console.log('headers.length:', headers.length);
    console.log('data.length:', data.length);
    
    const modal = document.getElementById('dataModal');
    const modalTitle = document.getElementById('modalTitle');
    const dataContainer = document.getElementById('excelDataContainer');
    
    modalTitle.textContent = `Data pro vrstvu: ${sheetName}`;
    
    // Vyčištění předchozího obsahu
    dataContainer.innerHTML = '';
    
    // Debug: Kontrola prvních několika řádků dat
    if (data.length > 0) {
        console.log('First few rows of data:');
        data.slice(0, 3).forEach((row, i) => {
            console.log(`Row ${i}:`, row);
        });
    }
    
    // Vytvoření kontejneru pro obě tabulky
    const tablesContainer = document.createElement('div');
    tablesContainer.style.display = 'flex';
    tablesContainer.style.flexDirection = 'column';
    tablesContainer.style.height = '100%';
    tablesContainer.style.gap = '10px';
    
    // První tabulka (data z prvního Excel souboru)
    const firstTableContainer = document.createElement('div');
    firstTableContainer.style.flex = '1';
    firstTableContainer.style.border = '1px solid #ddd';
    firstTableContainer.style.borderRadius = '5px';
    firstTableContainer.style.overflow = 'hidden';
    
    const firstTableHeader = document.createElement('h3');
    firstTableHeader.textContent = 'Detail PZS';
    firstTableHeader.style.margin = '0';
    firstTableHeader.style.padding = '10px';
    firstTableHeader.style.backgroundColor = '#f8f9fa';
    firstTableHeader.style.borderBottom = '1px solid #ddd';
    firstTableContainer.appendChild(firstTableHeader);
    
    const firstTableWrapper = document.createElement('div');
    firstTableWrapper.style.padding = '10px';
    firstTableWrapper.style.overflow = 'auto';
    firstTableWrapper.style.maxHeight = '300px';
    
    const firstTable = createDataTable(headers, data, 'first-table');
    firstTableWrapper.appendChild(firstTable);
    firstTableContainer.appendChild(firstTableWrapper);
    
    // Druhá tabulka (data z druhého Excel souboru)
    const secondTableContainer = document.createElement('div');
    secondTableContainer.style.flex = '1';
    secondTableContainer.style.border = '1px solid #ddd';
    secondTableContainer.style.borderRadius = '5px';
    secondTableContainer.style.overflow = 'hidden';
    
    const secondTableHeader = document.createElement('h3');
    secondTableHeader.textContent = 'Podrobnosti PZS';
    secondTableHeader.style.margin = '0';
    secondTableHeader.style.padding = '10px';
    secondTableHeader.style.backgroundColor = '#f8f9fa';
    secondTableHeader.style.borderBottom = '1px solid #ddd';
    secondTableContainer.appendChild(secondTableHeader);
    
    const secondTableWrapper = document.createElement('div');
    secondTableWrapper.style.padding = '10px';
    secondTableWrapper.style.overflow = 'auto';
    secondTableWrapper.style.maxHeight = '300px';
    
    const secondTable = createDataTable([], [], 'second-table');
    secondTableWrapper.appendChild(secondTable);
    secondTableContainer.appendChild(secondTableWrapper);
    
    // Přidání event listeneru pro výběr řádků v první tabulce
    firstTable.addEventListener('click', function(event) {
        const row = event.target.closest('tr');
        if (row && row.dataset.rowIndex !== undefined) {
            // Odstranění předchozího výběru
            firstTable.querySelectorAll('tr.selected').forEach(tr => {
                tr.classList.remove('selected');
                tr.style.backgroundColor = '';
            });
            
            // Přidání nového výběru
            row.classList.add('selected');
            row.style.backgroundColor = '#e3f2fd';
            
            // Aktualizace druhé tabulky
            updateSecondTable(secondTable, row.dataset.rowIndex, data, headers);
        }
    });
    
    tablesContainer.appendChild(firstTableContainer);
    tablesContainer.appendChild(secondTableContainer);
    dataContainer.appendChild(tablesContainer);
    
    // Zobrazení modalu
    modal.style.display = 'flex';
}

// Funkce pro formátování zobrazených hodnot (podobně jako v Python konvertoru)
function formatDisplayValue(val) {
    // Kontrola na null, undefined, prázdný řetězec a různé varianty "null"
    if (val === null || val === undefined || val === "" || 
        (typeof val === 'string' && (val.toLowerCase() === "null" || val.trim() === ""))) {
        return "—"; // Em dash místo prázdných hodnot
    }
    
    // Kontrola na datum
    if (typeof val === 'string' && val.length >= 10 && val.includes('-')) {
        try {
            // Formát YYYY-MM-DD nebo YYYY-MM-DD HH:MM:SS
            const datePart = val.split(' ')[0]; // Vezme jen datumovou část
            const date = new Date(datePart);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('cs-CZ'); // Formát DD.MM.YYYY
            }
        } catch (e) {
            // Pokud parsování data selže, vrátíme původní hodnotu
        }
    }
    
    return String(val);
}

function createDataTable(headers, data, tableId) {
    console.log(`createDataTable called for ${tableId}:`);
    console.log('headers:', headers);
    console.log('data:', data);
    console.log('headers.length:', headers.length);
    console.log('data.length:', data.length);
    
    const table = document.createElement('table');
    table.className = 'excel-table';
    table.id = tableId;
    
    // Vytvoření hlavičky
    if (headers.length > 0) {
        console.log('Creating table header...');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        headers.forEach((header, index) => {
            const th = document.createElement('th');
            th.textContent = header || `Column ${index + 1}`;
            headerRow.appendChild(th);
            console.log(`Header ${index}: "${header}"`);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
    } else {
        console.log('No headers provided, skipping header creation');
    }
    
    // Vytvoření těla tabulky
    console.log('Creating table body...');
    const tbody = document.createElement('tbody');
    
    data.forEach((row, index) => {
        console.log(`Creating row ${index}:`, row);
        const tr = document.createElement('tr');
        tr.dataset.rowIndex = index;
        tr.style.cursor = 'pointer';
        
        // Podmíněné obarvení pro první tabulku (Detail PZS)
        let isGrayRow = false;
        if (tableId === 'first-table' && row && row.length > 0) {
            const firstColumnValue = row[0] ? String(row[0]).trim() : '';
            if (firstColumnValue !== 'S - Světelná PZZ') {
                tr.classList.add('gray-row');
                tr.style.backgroundColor = '#f0f0f0'; // Světle šedá barva - trvale
                isGrayRow = true;
                console.log(`Row ${index} marked as gray because first column is: "${firstColumnValue}"`);
            } else {
                console.log(`Row ${index} kept normal because first column is: "${firstColumnValue}"`);
            }
        }
        
        // Hover efekt
        tr.addEventListener('mouseenter', function() {
            if (!this.classList.contains('selected')) {
                // Pokud je to šedý řádek, udělej ho o něco tmavší při hoveru
                if (this.classList.contains('gray-row')) {
                    this.style.backgroundColor = '#e0e0e0';
                } else {
                    this.style.backgroundColor = '#f5f5f5';
                }
            }
        });
        
        tr.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                // Obnov původní barvu
                if (this.classList.contains('gray-row')) {
                    this.style.backgroundColor = '#f0f0f0'; // Vrat šedou barvu
                } else {
                    this.style.backgroundColor = ''; // Vrat normální barvu
                }
            }
        });
        
        // Pokud máme hlavičky, použij jejich počet, jinak použij délku řádku
        const columnCount = headers.length > 0 ? headers.length : (row ? row.length : 0);
        
        for (let colIndex = 0; colIndex < columnCount; colIndex++) {
            const td = document.createElement('td');
            const cellValue = row && row[colIndex] !== undefined ? row[colIndex] : '';
            td.textContent = formatDisplayValue(cellValue); // Použití nové funkce pro formátování
            tr.appendChild(td);
        }
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    console.log(`Table ${tableId} created with ${tbody.children.length} rows`);
    return table;
}

function updateSecondTable(secondTable, selectedRowIndex, firstTableData, firstTableHeaders) {
    console.log('=== UPDATE SECOND TABLE ===');
    console.log('selectedRowIndex:', selectedRowIndex);
    console.log('firstTableData:', firstTableData);
    console.log('firstTableHeaders:', firstTableHeaders);
    console.log('excelData2:', excelData2);
    
    if (!excelData2) {
        console.log('excelData2 is not loaded');
        secondTable.innerHTML = '<tr><td colspan="100%">Druhý Excel soubor není načten</td></tr>';
        return;
    }
    
    console.log('Available sheets in excelData2:', Object.keys(excelData2));
    
    // Zkusíme najít správný list - může být "List1", "Sheet1", nebo jiný
    let sheet2Data = null;
    let sheetName = null;
    
    const possibleSheetNames = ['List1', 'Sheet1', 'List 1', 'Sheet 1'];
    for (const name of possibleSheetNames) {
        if (excelData2[name]) {
            sheet2Data = excelData2[name];
            sheetName = name;
            break;
        }
    }
    
    // Pokud nenajdeme známý list, použijeme první dostupný
    if (!sheet2Data) {
        const availableSheets = Object.keys(excelData2);
        if (availableSheets.length > 0) {
            sheetName = availableSheets[0];
            sheet2Data = excelData2[sheetName];
        }
    }
    
    if (!sheet2Data || sheet2Data.length === 0) {
        console.log('No valid sheet data found in excelData2');
        secondTable.innerHTML = '<tr><td colspan="100%">Druhý Excel soubor neobsahuje použitelná data</td></tr>';
        return;
    }
    
    console.log(`Using sheet "${sheetName}" with ${sheet2Data.length} rows`);
    console.log('First few rows of sheet2Data:');
    sheet2Data.slice(0, 5).forEach((row, i) => {
        console.log(`Row ${i}:`, row);
    });

    try {
        // Flexibilní hledání hlaviček v druhém Excel souboru
        let headerRowIndex = -1;
        let dataStartIndex = -1;
        
        for (let i = 0; i < Math.min(10, sheet2Data.length); i++) {
            const row = sheet2Data[i];
            if (row && row.length > 0) {
                const nonEmptyCount = row.filter(cell => cell && String(cell).trim() !== '').length;
                if (nonEmptyCount > 3) {
                    headerRowIndex = i;
                    dataStartIndex = i + 1;
                    break;
                }
            }
        }
        
        if (headerRowIndex === -1) {
            headerRowIndex = 0;
            dataStartIndex = 1;
        }
        
        console.log('Sheet2 headerRowIndex:', headerRowIndex, 'dataStartIndex:', dataStartIndex);
        
        const sheet2Headers = sheet2Data[headerRowIndex] || [];
        const sheet2DataRows = sheet2Data.slice(dataStartIndex);
        
        console.log('sheet2Headers:', sheet2Headers);
        console.log('sheet2DataRows length:', sheet2DataRows.length);
        
        // Nalezení sloupce "Hypertext" a sloupce pro PZS
        let hypertextColIndex = -1;
        let pzsColIndex = -1;
        
        sheet2Headers.forEach((header, index) => {
            const headerStr = String(header || '').trim().toLowerCase();
            if (headerStr === "hypertext") {
                hypertextColIndex = index;
            }
            if (headerStr.includes('pzs') || headerStr.includes('číslo') || headerStr.includes('č.')) {
                pzsColIndex = index;
            }
        });
        
        console.log('hypertextColIndex:', hypertextColIndex);
        console.log('pzsColIndex in sheet2:', pzsColIndex);
        
        // Pokud nenajdeme PZS sloupec, zkusíme různé indexy
        if (pzsColIndex === -1) {
            // Zkusíme obvyklé pozice
            const possibleIndexes = [5, 6, 0, 1, 2]; // sloupec G (5), H (6), A (0), B (1), C (2)
            for (const idx of possibleIndexes) {
                if (idx < sheet2Headers.length) {
                    console.log(`Trying index ${idx} with header "${sheet2Headers[idx]}"`);
                    // Zkusíme najít nějakou hodnotu podobnou PZS
                    const sampleValue = sheet2DataRows.length > 0 && sheet2DataRows[0][idx] ? String(sheet2DataRows[0][idx]) : '';
                    if (sampleValue.match(/P\d+/i)) {
                        pzsColIndex = idx;
                        console.log(`Found PZS-like values at index ${idx}`);
                        break;
                    }
                }
            }
        }
        
        // Vytvoření viditelných sloupců (bez Hypertext)
        const visibleHeaders = sheet2Headers.filter((_, index) => index !== hypertextColIndex);
        
        // Získání hodnoty č.PZS z vybraného řádku první tabulky
        const pzsColumnIndex = firstTableHeaders.findIndex(header => 
            String(header || '').toLowerCase().includes('pzs') || 
            String(header || '').toLowerCase().includes('č.')
        );
        
        console.log('pzsColumnIndex in first table:', pzsColumnIndex);
        
        if (pzsColumnIndex === -1 || selectedRowIndex >= firstTableData.length) {
            console.log('Invalid selection or PZS column not found in first table');
            secondTable.innerHTML = '<tr><td colspan="100%">Neplatný výběr nebo sloupec č.PZS nenalezen v první tabulce</td></tr>';
            return;
        }
        
        const selectedPzsValue = String(firstTableData[selectedRowIndex][pzsColumnIndex] || '').trim();
        console.log('Looking for PZS value:', selectedPzsValue);
        
        // Vyčištění druhé tabulky
        secondTable.innerHTML = '';
        
        // Vytvoření nové hlavičky
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        visibleHeaders.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header || '';
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        secondTable.appendChild(thead);
        
        // Vytvoření těla tabulky
        const tbody = document.createElement('tbody');
        let matchCount = 0;
        
        // Hledání odpovídajících řádků
        sheet2DataRows.forEach((row, index) => {
            if (!row) return;
            
            // Zkusíme všechny možné sloupce pro PZS
            let foundMatch = false;
            const possiblePzsIndexes = pzsColIndex !== -1 ? [pzsColIndex] : [0, 1, 2, 5, 6];
            
            for (const idx of possiblePzsIndexes) {
                const pzsValue = String(row[idx] || '').trim();
                console.log(`Checking row ${index}, column ${idx}: "${pzsValue}" vs "${selectedPzsValue}"`);
                
                if (pzsValue === selectedPzsValue) {
                    foundMatch = true;
                    matchCount++;
                    console.log(`MATCH found at row ${index}, column ${idx}`);
                    
                    const tr = document.createElement('tr');
                    
                    // Přidání hodnot bez sloupce Hypertext
                    row.forEach((cellValue, colIndex) => {
                        if (colIndex !== hypertextColIndex) {
                            const td = document.createElement('td');
                            let displayValue = formatDisplayValue(cellValue); // Použití nové funkce
                            
                            // Pokud má hyperlink, označíme ho vizuálně
                            if (hypertextColIndex !== -1 && row[hypertextColIndex]) {
                                if (colIndex === 3) {
                                    displayValue = `_${displayValue}_`;
                                    td.style.color = 'blue';
                                    td.style.cursor = 'pointer';
                                    td.title = 'Klikněte pro otevření odkazu';
                                    
                                    td.addEventListener('click', function() {
                                        const url = String(row[hypertextColIndex]);
                                        openHyperlink(url);
                                    });
                                }
                            }
                            
                            td.textContent = displayValue;
                            tr.appendChild(td);
                        }
                    });
                    
                    tbody.appendChild(tr);
                    break; // Našli jsme shodu, nepokračujeme s dalšími sloupci
                }
            }
        });
        
        secondTable.appendChild(tbody);
        
        console.log(`Found ${matchCount} matching rows`);
        
        if (matchCount === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = visibleHeaders.length;
            td.textContent = `Žádná data nenalezena pro č.PZS: "${selectedPzsValue}" (prohledáno ${sheet2DataRows.length} řádků)`;
            td.style.textAlign = 'center';
            td.style.fontStyle = 'italic';
            tr.appendChild(td);
            tbody.appendChild(tr);
        }
        
    } catch (error) {
        console.error('Chyba při aktualizaci druhé tabulky:', error);
        secondTable.innerHTML = `<tr><td colspan="100%">Chyba při zpracování dat: ${error.message}</td></tr>`;
    }
}

function openHyperlink(url) {
    if (!url) return;
    
    try {
        if (url.toLowerCase().startsWith('http://') || url.toLowerCase().startsWith('https://') || url.toLowerCase().startsWith('www.')) {
            // Webový odkaz
            window.open(url, '_blank');
        } else {
            // Pro ostatní typy odkazů (síťové cesty, lokální soubory) - kopírování do schránky
            // Pokus o zkopírování cesty do schránky
            navigator.clipboard.writeText(url).then(() => {
                alert(`Cesta zkopírována do schránky:\n${url}\n\nCestu nyní můžete vložit (Ctrl+V) do Průzkumníka Windows.`);
            }).catch(err => {
                // Záložní řešení, pokud clipboard API nefunguje
                alert(`Odkaz: ${url}\n\nPozor: Pro bezpečnostní důvody nelze automaticky otevírat lokální soubory a síťové cesty z webového prohlížeče.\n\nChyba při kopírování: ${err.message}`);
            });
                
        }
    } catch (error) {
        alert(`Chyba při otevírání odkazu:\n${url}\n\nChyba: ${error.message}`);
    }
}

function closeModal() {
    document.getElementById('dataModal').style.display = 'none';
    
    // Pokud jsme v režimu vyhledávání, obnov všechny vrstvy při zavření modalu
    if (isInSearchMode) {
        restoreAllLayers();
        isInSearchMode = false;
        setInfoLabel('Modal zavřen - všechny vrstvy obnoveny');
    }
}

function setInfoLabel(text, isError = false) {
    const infoLabel = document.getElementById('infoLabel');
    infoLabel.textContent = text;
    infoLabel.className = isError ? 'info-label error' : 'info-label';
}

// Uzavření modalu při kliknutí na pozadí
document.getElementById('dataModal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeModal();
    }
});

// Uzavření modalu při stisknutí Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Automatické načtení dat při spuštění
async function autoLoadData() {
    try {
        setInfoLabel('Automatické načítání dat...');
        
        // Nejprve zkusíme načíst JSON soubory
        await loadJSONData();
        
        // Automatické načtení pozadí
        await autoLoadBackground();
        
        // Po načtení pozadí inicializujeme checkboxy z mapování
        if (backgroundImage) {
            initializeLayerCheckboxesFromMappings();
        }
        
        // Automatické načtení Excel souborů pouze pokud JSON nebyly načteny
        if (!jsonLoaded1) {
            await autoLoadExcel1();
        }
        
        if (!jsonLoaded2) {
            await autoLoadExcel2();
        }
        
        // Aktualizujeme stav tlačítek po načtení
        updateExcelButtonsState();
        
        setInfoLabel('Automatické načítání dokončeno.');
        
    } catch (error) {
        setInfoLabel('Automatické načítání selhalo. Použijte tlačítka pro ruční načtení.', true);
        console.error('Auto-load error:', error);
    }
}

// Automatické načtení layer_mappings.json
async function autoLoadLayerMappings() {
    try {
        const response = await fetch('./layer_mappings.json');
        if (response.ok) {
            const data = await response.json();
            
            // Použijeme existující importování funkci
            const result = processLayerMappingsData(data);
            
            if (result.success) {
                console.log('Layer mappings byly automaticky načteny:', data);
                setInfoLabel('Layer mappings byly automaticky načteny z layer_mappings.json');
                
                // Aktualizujeme UI
                updateLayerButtons();
                if (backgroundImage) {
                    drawScene();
                }
                
                // Zobrazíme statistiky
                showMappingStatus();
            } else {
                console.warn('Problém s automatickým načtením layer mappings:', result.message);
            }
        } else {
            console.log('Soubor layer_mappings.json nebyl nalezen - to je v pořádku');
        }
    } catch (error) {
        console.log('Nepodařilo se načíst layer_mappings.json automaticky:', error.message);
    }
}

// Funkce pro zpracování dat layer mappings (používá se při importu i automatickém načítání)
function processLayerMappingsData(data) {
    try {
        console.log('Zpracovávám data mapování:', data);
        
        // Nejdříve zkontrolujeme strukturu dat
        if (!data || typeof data !== 'object') {
            return { success: false, message: 'Neplatná struktura JSON souboru' };
        }
        
        // ÚPLNĚ VYČISTÍME STARÁ MAPOVÁNÍ
        layerLineMappings = {};
        clickableAreas = {};
        
        // Import čárových mapování
        if (data.lineMappings && typeof data.lineMappings === 'object') {
            layerLineMappings = { ...data.lineMappings };
            console.log('Načtena čárová mapování:', Object.keys(layerLineMappings));
        }
        
        // Import klikacích oblastí - nahradíme kompletně, ne přidáme
        if (data.clickableAreas && typeof data.clickableAreas === 'object') {
            // Projdeme každou oblast a zkontrolujeme její strukturu
            for (const [layerName, area] of Object.entries(data.clickableAreas)) {
                if (area && typeof area === 'object') {
                    // Ověříme, zda má oblast platnou strukturu
                    if (area.type === 'line') {
                        // Čárová oblast - musí mít startX, startY, endX, endY, thickness
                        if (typeof area.startX === 'number' && 
                            typeof area.startY === 'number' && 
                            typeof area.endX === 'number' && 
                            typeof area.endY === 'number' && 
                            typeof area.thickness === 'number') {
                            clickableAreas[layerName] = { ...area };
                            console.log(`Načtena čárová oblast pro ${layerName}`);
                        } else {
                            console.warn(`Neplatná čárová oblast pro ${layerName}:`, area);
                        }
                    } else {
                        // Obdélníková oblast - musí mít x, y, width, height
                        if (typeof area.x === 'number' && 
                            typeof area.y === 'number' && 
                            typeof area.width === 'number' && 
                            typeof area.height === 'number') {
                            clickableAreas[layerName] = { ...area };
                            console.log(`Načtena obdélníková oblast pro ${layerName}`);
                        } else {
                            console.warn(`Neplatná obdélníková oblast pro ${layerName}:`, area);
                        }
                    }
                }
            }
        }
        
        // Uložíme změny
        saveLayerMappingsToStorage();
        drawLayersOptimized(true);
        
        const lineCount = Object.keys(layerLineMappings).length;
        const areaCount = Object.keys(clickableAreas).length;
        
        console.log('Mapování vrstev úspěšně zpracováno');
        console.log(`- Čárových mapování: ${lineCount}`);
        console.log(`- Celkem oblastí: ${areaCount}`);
        
        return { 
            success: true, 
            message: `Úspěšně načteno!\nČárová mapování: ${lineCount}\nCelkem oblastí: ${areaCount}`,
            lineCount,
            areaCount
        };
        
    } catch (error) {
        console.error('Chyba při zpracování mapování:', error);
        return { success: false, message: error.message };
    }
}

async function autoLoadBackground() {
    try {
        const response = await fetch('./03_BG.png');
        if (response.ok) {
            const blob = await response.blob();
            const img = new Image();
            
            return new Promise((resolve, reject) => {
                img.onload = function() {
                    backgroundImage = img;
                    // Inicializace checkboxů na základě mapování
                    initializeLayerCheckboxesFromMappings();
                    updateCompositeImage();
                    setInfoLabel('Pozadí bylo automaticky načteno.');
                    resolve();
                };
                img.onerror = reject;
                img.src = URL.createObjectURL(blob);
            });
        } else {
            console.log('Pozadí 03_BG.png nenalezeno, použijte tlačítko pro ruční načtení.');
        }
    } catch (error) {
        console.log('Chyba při automatickém načítání pozadí:', error);
    }
}

async function loadLayerFile(filename) {
    try {
        const response = await fetch(`./Layers_position/${filename}`);
        if (response.ok) {
            const blob = await response.blob();
            const img = new Image();
            
            return new Promise((resolve, reject) => {
                img.onload = function() {
                    layers[filename] = img;
                    resolve();
                };
                img.onerror = reject;
                img.src = URL.createObjectURL(blob);
            });
        } else {
            throw new Error(`Vrstva ${filename} nenalezena`);
        }
    } catch (error) {
        throw error;
    }
}

async function autoLoadExcel1() {
    // Tato funkce se volá pouze pokud JSON nebyl načten
    if (jsonLoaded1) {
        console.log('JSON soubor 1 již načten, přeskakuji Excel 1');
        return;
    }
    
    try {
        console.log('Attempting to auto-load Excel file 1...');
        const response = await fetch('./01_Detail_PZS.xlsx');
        if (response.ok) {
            console.log('Excel file 1 found, loading...');
            const arrayBuffer = await response.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, {type: 'array'});
            
            console.log('Excel 1 sheet names:', workbook.SheetNames);
            
            const excelData = {};
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
                excelData[sheetName] = jsonData;
                console.log(`Auto-loaded sheet ${sheetName} with ${jsonData.length} rows`);
            });
            
            excelData1 = excelData;
            console.log('excelData1 auto-loaded:', excelData1);
            setInfoLabel(`Excel soubor 1 byl automaticky načten. Listy: ${Object.keys(excelData).join(', ')}`);
        } else {
            console.log('Excel soubor 01_Detail_PZS.xlsx nenalezen - response not ok');
        }
    } catch (error) {
        console.log('Chyba při automatickém načítání Excel souboru 1:', error);
    }
}

async function autoLoadExcel2() {
    // Tato funkce se volá pouze pokud JSON nebyl načten
    if (jsonLoaded2) {
        console.log('JSON soubor 2 již načten, přeskakuji Excel 2');
        return;
    }
    
    try {
        console.log('Attempting to auto-load Excel file 2...');
        const response = await fetch('./02_Podrobnosti_PZS.xlsx');
        if (response.ok) {
            console.log('Excel file 2 found, loading...');
            const arrayBuffer = await response.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, {type: 'array'});
            
            console.log('Excel 2 sheet names:', workbook.SheetNames);
            
            const excelData = {};
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
                excelData[sheetName] = jsonData;
                console.log(`Auto-loaded sheet ${sheetName} with ${jsonData.length} rows`);
            });
            
            excelData2 = excelData;
            console.log('excelData2 auto-loaded:', excelData2);
            setInfoLabel(`Excel soubor 2 byl automaticky načten. Listy: ${Object.keys(excelData).join(', ')}`);
        } else {
            console.log('Excel soubor 02_Podrobnosti_PZS.xlsx nenalezen - response not ok');
        }
    } catch (error) {
        console.log('Chyba při automatickém načítání Excel souboru 2:', error);
    }
}

function testExcelData() {
    console.log('=== EXCEL DATA TEST ===');
    console.log('excelData1:', excelData1);
    console.log('excelData2:', excelData2);
    
    if (excelData1) {
        console.log('Excel 1 sheets:', Object.keys(excelData1));
        Object.keys(excelData1).forEach(sheetName => {
            const sheetData = excelData1[sheetName];
            console.log(`Sheet ${sheetName} has ${sheetData.length} rows`);
            
            // Ukázka prvních řádků
            if (sheetData.length > 0) {
                console.log(`First row (headers): `, sheetData[0]);
                if (sheetData.length > 1) {
                    console.log(`Second row (first data): `, sheetData[1]);
                }
                if (sheetData.length > 2) {
                    console.log(`Third row (second data): `, sheetData[2]);
                }
            }
        });
        setInfoLabel(`Excel 1 je načten, obsahuje ${Object.keys(excelData1).length} listů: ${Object.keys(excelData1).join(', ')}`);
    } else {
        setInfoLabel('Excel 1 NENÍ načten!', true);
    }
    
    if (excelData2) {
        console.log('Excel 2 sheets:', Object.keys(excelData2));
        Object.keys(excelData2).forEach(sheetName => {
            const sheetData = excelData2[sheetName];
            console.log(`Sheet ${sheetName} has ${sheetData.length} rows`);
            
            // Ukázka prvních řádků
            if (sheetData.length > 0) {
                console.log(`First row (headers): `, sheetData[0]);
                if (sheetData.length > 1) {
                    console.log(`Second row (first data): `, sheetData[1]);
                }
            }
        });
    } else {
        console.log('Excel 2 is not loaded');
    }
    
    // Informace o načítání JSON
    console.log('JSON Loading Status:');
    console.log('jsonLoaded1:', jsonLoaded1);
    console.log('jsonLoaded2:', jsonLoaded2);
    
    // Test XLSX library
    if (typeof XLSX !== 'undefined') {
        console.log('XLSX library is available:', XLSX.version);
    } else {
        console.log('XLSX library is NOT available!');
        setInfoLabel('XLSX knihovna není načtena!', true);
    }
    
    console.log('Available layers:', Object.keys(layers));
}

// ===========================================
// POMOCNÉ FUNKCE PRO SNADNÉ NASTAVENÍ OBLASTÍ  
// ===========================================

// Funkce pro rychlé nastavení souřadnic všech oblastí
// Zavolejte v konzoli: setupAllClickableAreas()
// Funkce pro vytvoření testovacích oblastí podle velikosti obrázku
function createTestClickableAreas() {
    if (!backgroundImage) {
        console.log('Žádný obrázek není načten');
        setInfoLabel('Nejprve načtěte obrázek!', true);
        return;
    }
    
    const imgWidth = backgroundImage.width;
    const imgHeight = backgroundImage.height;
    
    console.log(`Vytvářím testovací oblasti pro obrázek ${imgWidth}x${imgHeight}`);
    
    // Velikost každé testovací oblasti
    const areaWidth = Math.floor(imgWidth / 4); // 4 oblasti na šířku
    const areaHeight = Math.floor(imgHeight / 5); // 5 oblastí na výšku
    
    // Aktualizace oblastí podle skutečné velikosti obrázku
    const layers = Object.keys(clickableAreas);
    let index = 0;
    
    for (let row = 0; row < 5 && index < layers.length; row++) {
        for (let col = 0; col < 4 && index < layers.length; col++) {
            const layerName = layers[index];
            const x = col * areaWidth;
            const y = row * areaHeight;
            
            clickableAreas[layerName] = {
                x: x,
                y: y,
                width: areaWidth,
                height: areaHeight
            };
            
            console.log(`${layerName}: oblast (${x}, ${y}, ${areaWidth}x${areaHeight})`);
            index++;
        }
    }
    
    // Překreslení s novými oblastmi
    drawLayersOptimized(true);
    
    setInfoLabel(`Vytvořeny testovací oblasti ${areaWidth}x${areaHeight} px pro obrázek ${imgWidth}x${imgHeight}`, false);
    console.log('Testovací oblasti vytvořeny! Zapněte zobrazení oblastí pro kontrolu.');
    console.log('Nyní můžete klikat na zelené oblasti pro test funkcionality.');
}

function setupAllClickableAreas() {
    console.log('=== NASTAVENÍ KLIKACÍCH OBLASTÍ ===');
    console.log('Pro každou vrstvu budete klikat na dva rohy obdélníku:');
    console.log('1. Levý horní roh');
    console.log('2. Pravý dolní roh');
    console.log('');
    console.log('POSTUP:');
    console.log('1. Zapněte debug mode tlačítkem nebo toggleDebugMode()');
    console.log('2. Zapněte zobrazení oblastí tlačítkem');
    console.log('3. Pro každou vrstvu použijte: setClickableArea("nazev.png", x, y, width, height)');
    console.log('4. Zkontrolujte výsledek pomocí: printAllClickableAreas()');
    console.log('');
    console.log('PŘÍKLAD:');
    console.log('setClickableArea("522A.png", 150, 200, 180, 120);');
    console.log('');
    console.log('Dostupné vrstvy:');
    Object.keys(clickableAreas).forEach(layer => {
        console.log(`- ${layer}`);
    });
}

// Funkce pro výpočet výšky a šířky z rohů
function setClickableAreaFromCorners(layerName, topLeftX, topLeftY, bottomRightX, bottomRightY) {
    const width = bottomRightX - topLeftX;
    const height = bottomRightY - topLeftY;
    setClickableArea(layerName, topLeftX, topLeftY, width, height);
}

// Export všech nastavených oblastí jako JSON
function exportClickableAreas() {
    const json = JSON.stringify(clickableAreas, null, 2);
    console.log('Exportované klikací oblasti:');
    console.log(json);
    
    // Zkopírovat do schránky
    navigator.clipboard.writeText(json).then(() => {
        console.log('JSON zkopírován do schránky!');
    });
    
    return json;
}

// Import oblastí z JSON
function importClickableAreas(jsonString) {
    try {
        const imported = JSON.parse(jsonString);
        Object.assign(clickableAreas, imported);
        console.log('Oblasti importovány:', imported);
        drawLayersOptimized(true); // Překreslíme
    } catch (e) {
        console.error('Chyba při importu:', e);
    }
}

// ===========================================
// ROZBALOVACÍ SEKCE V LEVÉM PANELU
// ===========================================

function toggleCollapsible(headerElement) {
    const contentElement = headerElement.nextElementSibling;
    const arrowElement = headerElement.querySelector('.collapsible-arrow');
    
    // Přepínání stavu
    const isExpanded = contentElement.classList.contains('expanded');
    
    if (isExpanded) {
        // Sbalit
        contentElement.classList.remove('expanded');
        headerElement.classList.remove('active');
        arrowElement.textContent = '▶';
    } else {
        // Rozbalit
        contentElement.classList.add('expanded');
        headerElement.classList.add('active');
        arrowElement.textContent = '▼';
    }
    
    // Automaticky uložit stav
    saveSectionsState();
}

// Funkce pro sbalení/rozbalení všech sekcí
function collapseAllSections() {
    const headers = document.querySelectorAll('.collapsible-header');
    headers.forEach(header => {
        const contentElement = header.nextElementSibling;
        const arrowElement = header.querySelector('.collapsible-arrow');
        
        contentElement.classList.remove('expanded');
        header.classList.remove('active');
        arrowElement.textContent = '▶';
    });
    console.log('Všechny sekce sbaleny');
}

function expandAllSections() {
    const headers = document.querySelectorAll('.collapsible-header');
    headers.forEach(header => {
        const contentElement = header.nextElementSibling;
        const arrowElement = header.querySelector('.collapsible-arrow');
        
        contentElement.classList.add('expanded');
        header.classList.add('active');
        arrowElement.textContent = '▼';
    });
    console.log('Všechny sekce rozbaleny');
}

// Funkce pro uložení/načtení stavu sekcí
function saveSectionsState() {
    const state = [];
    const headers = document.querySelectorAll('.collapsible-header');
    
    headers.forEach((header, index) => {
        const contentElement = header.nextElementSibling;
        const isExpanded = contentElement.classList.contains('expanded');
        const title = header.querySelector('.collapsible-title').textContent;
        
        state.push({
            index: index,
            title: title,
            expanded: isExpanded
        });
    });
    
    localStorage.setItem('vrstvy-sections-state', JSON.stringify(state));
    console.log('Stav sekcí uložen:', state);
}

function loadSectionsState() {
    const savedState = localStorage.getItem('vrstvy-sections-state');
    if (!savedState) {
        console.log('Žádný uložený stav sekcí');
        return;
    }
    
    try {
        const state = JSON.parse(savedState);
        const headers = document.querySelectorAll('.collapsible-header');
        
        state.forEach(sectionState => {
            if (sectionState.index < headers.length) {
                const header = headers[sectionState.index];
                const contentElement = header.nextElementSibling;
                const arrowElement = header.querySelector('.collapsible-arrow');
                
                if (sectionState.expanded) {
                    contentElement.classList.add('expanded');
                    header.classList.add('active');
                    arrowElement.textContent = '▼';
                } else {
                    contentElement.classList.remove('expanded');
                    header.classList.remove('active');
                    arrowElement.textContent = '▶';
                }
            }
        });
        
        console.log('Stav sekcí načten:', state);
    } catch (e) {
        console.error('Chyba při načítání stavu sekcí:', e);
    }
}

// Při načtení stránky nastavíme výchozí stav
document.addEventListener('DOMContentLoaded', function() {
    console.log('Rozbalovací sekce inicializovány');
    
    // Nastavíme výchozí stav - všechny sekce zabalené kromě "Užitečné funkce"
    // Necháme výchozí HTML stav (pouze "Užitečné funkce" má třídu expanded)
    // a nebudeme načítat uložený stav
    
    console.log('Dostupné funkce pro ovládání sekcí:');
    console.log('- collapseAllSections() - sbalí všechny sekce');
    console.log('- expandAllSections() - rozbalí všechny sekce');
    console.log('- saveSectionsState() - uloží aktuální stav');
    console.log('- loadSectionsState() - načte uložený stav');
});

// ===========================================
// MAPOVÁNÍ VRSTEV POMOCÍ ČAR
// ===========================================

// Globální proměnné pro mapování vrstev
let isLayerMappingMode = false;
let selectedLayerForMapping = null;
let isDrawingLine = false;
let lineStartX = 0;
let lineStartY = 0;
let lineEndX = 0;
let lineEndY = 0;
let currentMappingLine = null;
let lineThickness = 150; // Tloušťka klikatelné oblasti kolem čáry v pixelech (cca 4cm = 2cm na každou stranu)

// Struktura pro uložení čárových mapování - výchozí hodnoty ze souboru layer_mappings.json
let layerLineMappings = {
    "522A.png": {
        "startX": 2537,
        "startY": 594,
        "endX": 2207,
        "endY": 790,
        "thickness": 150
    },
    "710A.png": {
        "startX": 2199,
        "startY": 2627,
        "endX": 3238,
        "endY": 2687,
        "thickness": 150
    },
    "710B.png": {
        "startX": 1569,
        "startY": 2872,
        "endX": 2132,
        "endY": 2776,
        "thickness": 150
    },
    "712B.png": {
        "startX": 986,
        "startY": 2044,
        "endX": 1465,
        "endY": 2013,
        "thickness": 150
    },
    "713A.png": {
        "startX": 2935,
        "startY": 1160,
        "endX": 2046,
        "endY": 1693,
        "thickness": 150
    },
    "717B.png": {
        "startX": 1016,
        "startY": 1334,
        "endX": 270,
        "endY": 1413,
        "thickness": 150
    },
    "714C.png": {
        "startX": 1711,
        "startY": 748,
        "endX": 1452,
        "endY": 1367,
        "thickness": 150
    },
    "709B.png": {
        "startX": 2210,
        "startY": 1963,
        "endX": 3238,
        "endY": 2508,
        "thickness": 150
    },
    "712A.png": {
        "startX": 1564,
        "startY": 1909,
        "endX": 1541,
        "endY": 3367,
        "thickness": 150
    },
    "711.png": {
        "startX": 1916,
        "startY": 1821,
        "endX": 2347,
        "endY": 3273,
        "thickness": 150
    },
    "714A.png": {
        "startX": 2723,
        "startY": 1551,
        "endX": 2595,
        "endY": 2011,
        "thickness": 150
    },
    "714B.png": {
        "startX": 2562,
        "startY": 845,
        "endX": 2163,
        "endY": 1467,
        "thickness": 150
    },
    "717A.png": {
        "startX": 179,
        "startY": 1471,
        "endX": 991,
        "endY": 3004,
        "thickness": 150
    },
    "717C.png": {
        "startX": 1430,
        "startY": 2557,
        "endX": 1045,
        "endY": 2818,
        "thickness": 150
    },
    "719.png": {
        "startX": 2045,
        "startY": 460,
        "endX": 1953,
        "endY": 1671,
        "thickness": 150
    },
    "nadpis.png": {
        "startX": 2717,
        "startY": 195,
        "endX": 795,
        "endY": 171,
        "thickness": 150
    },
    "PLZEŇ.png": {
        "startX": 1899,
        "startY": 1759,
        "endX": 1739,
        "endY": 1783,
        "thickness": 150
    },
    "720A.png": {
        "startX": 288,
        "startY": 486,
        "endX": 1683,
        "endY": 1777,
        "thickness": 150
    },
    "legenda.png": {
        "startX": 3163,
        "startY": 123,
        "endX": 3168,
        "endY": 1023,
        "thickness": 150
    }
};

function toggleLayerMapping() {
    isLayerMappingMode = !isLayerMappingMode;
    
    const button = document.getElementById('layerMappingButton');
    const mappingPanel = document.getElementById('mappingPanel');
    
    if (isLayerMappingMode) {
        // Aktivace mapovacího módu
        button.textContent = 'Ukončit mapování';
        button.classList.remove('btn-primary');
        button.classList.add('btn-warning');
        mappingPanel.style.display = 'block';
        
        updateMappingStatus();
        console.log('Mapovací mód aktivován');
        console.log('Vyberte vrstvu a natáhněte čáru pro definování klikatelné oblasti');
        
        // Automaticky načteme uložená mapování z JSON
        loadLayerMappingsFromStorage();
        
    } else {
        // Deaktivace mapovacího módu
        button.textContent = 'Mapování vrstev';
        button.classList.remove('btn-warning');
        button.classList.add('btn-primary');
        mappingPanel.style.display = 'none';
        
        selectedLayerForMapping = null;
        currentMappingLine = null;
        isDrawingLine = false;
        
        // Odebereme výběr ze všech vrstev
        clearLayerSelection();
        
        console.log('Mapovací mód deaktivován');
        drawLayersOptimized(true); // Překreslíme bez mapovacích čar
    }
}

function updateMappingStatus() {
    const statusEl = document.getElementById('mappingStatus');
    const saveButton = document.getElementById('saveMappingButton');
    
    if (selectedLayerForMapping) {
        statusEl.textContent = `Vybrána vrstva: ${selectedLayerForMapping}`;
        statusEl.classList.add('active');
        
        // Povolíme tlačítko uložit jen pokud máme nakreslenou čáru
        saveButton.disabled = !currentMappingLine;
    } else {
        statusEl.textContent = 'Žádná vrstva není vybrána';
        statusEl.classList.remove('active');
        saveButton.disabled = true;
    }
}

function clearLayerSelection() {
    // Odebereme třídu selected ze všech layer items
    const layerItems = document.querySelectorAll('.layer-item');
    layerItems.forEach(item => {
        item.classList.remove('selected');
    });
}

function selectLayerForMapping(layerName) {
    if (!isLayerMappingMode) return;
    
    selectedLayerForMapping = layerName;
    currentMappingLine = null; // Resetujeme aktuální čáru
    
    // Vizuálně označíme vybranou vrstvu
    clearLayerSelection();
    
    // Najdeme správný layer item a označíme ho
    const layerItems = document.querySelectorAll('.layer-item');
    layerItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.id === `layer_${layerName}`) {
            item.classList.add('selected');
        }
    });
    
    updateMappingStatus();
    console.log(`Vybrána vrstva pro mapování: ${layerName}`);
    
    // Pokud už máme uložené mapování pro tuto vrstvu, zobrazíme ho
    if (layerLineMappings[layerName]) {
        currentMappingLine = { ...layerLineMappings[layerName] };
        drawLayersOptimized(true);
    }
}

// Modifikace funkce handleCanvasMouseDown pro kreslení čar
function handleMappingMouseDown(event) {
    if (!isLayerMappingMode || !selectedLayerForMapping) return false;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Převedeme na souřadnice obrázku
    const imageCoords = getImageCoordinates(mouseX, mouseY);
    if (!imageCoords) return false;
    
    isDrawingLine = true;
    lineStartX = imageCoords.x;
    lineStartY = imageCoords.y;
    lineEndX = imageCoords.x;
    lineEndY = imageCoords.y;
    
    currentMappingLine = {
        startX: lineStartX,
        startY: lineStartY,
        endX: lineEndX,
        endY: lineEndY,
        thickness: lineThickness
    };
    
    console.log(`Začátek čáry: (${lineStartX}, ${lineStartY})`);
    return true; // Indikuje, že jsme zpracovali událost
}

function handleMappingMouseMove(event) {
    if (!isLayerMappingMode || !isDrawingLine || !selectedLayerForMapping) return false;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Převedeme na souřadnice obrázku
    const imageCoords = getImageCoordinates(mouseX, mouseY);
    if (!imageCoords) return false;
    
    lineEndX = imageCoords.x;
    lineEndY = imageCoords.y;
    
    currentMappingLine = {
        startX: lineStartX,
        startY: lineStartY,
        endX: lineEndX,
        endY: lineEndY,
        thickness: lineThickness
    };
    
    // Překreslíme s aktuální čárou
    drawLayersOptimized(true);
    return true;
}

function handleMappingMouseUp(event) {
    if (!isLayerMappingMode || !isDrawingLine || !selectedLayerForMapping) return false;
    
    isDrawingLine = false;
    
    const length = Math.sqrt(Math.pow(lineEndX - lineStartX, 2) + Math.pow(lineEndY - lineStartY, 2));
    
    if (length < 10) {
        // Příliš krátká čára - zrušíme
        currentMappingLine = null;
        console.log('Čára je příliš krátká - zrušeno');
    } else {
        console.log(`Čára dokončena: (${lineStartX}, ${lineStartY}) -> (${lineEndX}, ${lineEndY}), délka: ${Math.round(length)}px`);
    }
    
    updateMappingStatus();
    drawLayersOptimized(true);
    return true;
}

function saveCurrentMapping() {
    if (!selectedLayerForMapping || !currentMappingLine) {
        console.log('Nelze uložit - chybí vybraná vrstva nebo čára');
        return;
    }
    
    // Uložíme mapování
    layerLineMappings[selectedLayerForMapping] = { ...currentMappingLine };
    
    // Převedeme na nový formát klikacích oblastí (čárový místo obdélníkový)
    clickableAreas[selectedLayerForMapping] = {
        type: 'line',
        startX: currentMappingLine.startX,
        startY: currentMappingLine.startY,
        endX: currentMappingLine.endX,
        endY: currentMappingLine.endY,
        thickness: currentMappingLine.thickness
    };
    
    console.log(`Mapování uloženo pro vrstvu: ${selectedLayerForMapping}`, layerLineMappings[selectedLayerForMapping]);
    
    // Uložíme do localStorage
    saveLayerMappingsToStorage();
    
    // Reset pro další mapování
    selectedLayerForMapping = null;
    currentMappingLine = null;
    clearLayerSelection();
    updateMappingStatus();
    
    drawLayersOptimized(true);
}

function clearCurrentMapping() {
    if (!selectedLayerForMapping) return;
    
    // Odstraníme mapování
    delete layerLineMappings[selectedLayerForMapping];
    delete clickableAreas[selectedLayerForMapping];
    
    currentMappingLine = null;
    
    console.log(`Mapování odstraněno pro vrstvu: ${selectedLayerForMapping}`);
    
    // Uložíme změny
    saveLayerMappingsToStorage();
    
    updateMappingStatus();
    drawLayersOptimized(true);
}

function exportLayerMappings() {
    // Před exportem zajistíme, že všechny vrstvy mají buď čárové mapování nebo defaultní čárové mapování
    ensureAllLayersHaveLineMappings();
    
    const mappingsData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        lineMappings: layerLineMappings,
        clickableAreas: clickableAreas,
        totalLayers: Object.keys(layers).length,
        mappedLayers: Object.keys(layerLineMappings).length
    };
    
    const jsonStr = JSON.stringify(mappingsData, null, 2);
    
    // Vytvoříme a stáhneme soubor
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'layer_mappings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    const mapped = Object.keys(layerLineMappings).length;
    const total = Object.keys(layers).length;
    
    console.log('Mapování vrstev exportováno do layer_mappings.json');
    console.log(`Exportováno: ${mapped} čárových mapování z ${total} vrstev`);
    
    alert(`Export dokončen!\nČárových mapování: ${mapped}\nCelkem vrstev: ${total}`);
}

function ensureAllLayersHaveLineMappings() {
    if (!backgroundImage) {
        console.log('Nemůžu vytvořit defaultní mapování - chybí pozadí');
        return;
    }
    
    const imageWidth = backgroundImage.width;
    const imageHeight = backgroundImage.height;
    
    // Projdeme všechny načtené vrstvy
    Object.keys(layers).forEach((layerName, index) => {
        // Pokud vrstva nemá čárové mapování, vytvoříme defaultní
        if (!layerLineMappings[layerName]) {
            
            let defaultMapping;
            
            // Pokud má vrstva staré obdélníkové mapování, převedeme ho na čárové
            const oldArea = clickableAreas[layerName];
            if (oldArea && oldArea.x !== undefined && oldArea.y !== undefined && 
                oldArea.width !== undefined && oldArea.height !== undefined) {
                
                // Převedeme obdélník na diagonální čáru
                const startX = oldArea.x;
                const startY = oldArea.y;
                const endX = oldArea.x + oldArea.width;
                const endY = oldArea.y + oldArea.height;
                
                defaultMapping = {
                    startX: startX,
                    startY: startY,
                    endX: endX,
                    endY: endY,
                    thickness: Math.max(150, Math.min(oldArea.width, oldArea.height) / 3)
                };
                
                console.log(`Převedeno obdélníkové mapování na čárové pro ${layerName}`);
                
            } else {
                // Vytvoříme úplně nové defaultní diagonální čáru
                const offsetX = (index % 5) * 50; // 5 vrstev na řádek
                const offsetY = Math.floor(index / 5) * 50;
                
                const startX = Math.min(100 + offsetX, imageWidth - 200);
                const startY = Math.min(100 + offsetY, imageHeight - 200);
                const endX = Math.min(startX + 150, imageWidth - 50);
                const endY = Math.min(startY + 100, imageHeight - 50);
                
                defaultMapping = {
                    startX: startX,
                    startY: startY,
                    endX: endX,
                    endY: endY,
                    thickness: 150
                };
                
                console.log(`Vytvořeno nové defaultní mapování pro ${layerName}`);
            }
            
            layerLineMappings[layerName] = defaultMapping;
            
            // Aktualizujeme clickableAreas na čárový typ
            clickableAreas[layerName] = {
                type: 'line',
                ...defaultMapping
            };
        }
    });
    
    // Uložíme změny
    saveLayerMappingsToStorage();
}

// Debug funkce pro zobrazení stavu mapování
function showMappingStatus() {
    console.log('=== STAV MAPOVÁNÍ VRSTEV ===');
    console.log('Načtené vrstvy:', Object.keys(layers));
    console.log('Čárová mapování:', Object.keys(layerLineMappings));
    console.log('Klikací oblasti:', Object.keys(clickableAreas));
    
    console.log('\nDetail oblastí:');
    for (const [layerName, area] of Object.entries(clickableAreas)) {
        if (area.type === 'line') {
            console.log(`${layerName}: ČÁRA (${area.startX},${area.startY})→(${area.endX},${area.endY}) tl:${area.thickness}`);
        } else {
            console.log(`${layerName}: OBDÉLNÍK (${area.x},${area.y}) ${area.width}x${area.height}`);
        }
    }
    
    console.log('\nStatistiky:');
    const totalLayers = Object.keys(layers).length;
    const lineMappings = Object.keys(layerLineMappings).length;
    const lineAreas = Object.values(clickableAreas).filter(area => area.type === 'line').length;
    const rectAreas = Object.values(clickableAreas).filter(area => area.type !== 'line').length;
    
    console.log(`- Celkem vrstev: ${totalLayers}`);
    console.log(`- Čárových mapování: ${lineMappings}`);
    console.log(`- Čárových oblastí: ${lineAreas}`);
    console.log(`- Obdélníkových oblastí: ${rectAreas}`);
    
    return {
        totalLayers,
        lineMappings,
        lineAreas,
        rectAreas
    };
}

function importLayerMappings() {
    const input = document.getElementById('mappingImportInput');
    input.click();
}

// Event listener pro import file input
document.addEventListener('DOMContentLoaded', function() {
    const importInput = document.getElementById('mappingImportInput');
    if (importInput) {
        importInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    console.log('Importuji data z uživatelem vybraného souboru:', data);
                    
                    // Použijeme novou funkci pro zpracování dat
                    const result = processLayerMappingsData(data);
                    
                    if (result.success) {
                        alert(`Import úspěšný!\n${result.message}`);
                    } else {
                        alert(`Chyba při importu:\n${result.message}`);
                    }
                    
                } catch (error) {
                    console.error('Chyba při importu mapování:', error);
                    console.error('Chybný obsah souboru:', e.target.result);
                    alert(`Chyba při čtení JSON souboru:\n${error.message}`);
                }
            };
            reader.readAsText(file);
        });
    }
});

function saveLayerMappingsToStorage() {
    try {
        const data = {
            lineMappings: layerLineMappings,
            clickableAreas: clickableAreas
        };
        localStorage.setItem('layerMappings', JSON.stringify(data));
        console.log('Mapování uloženo do localStorage');
    } catch (error) {
        console.error('Chyba při ukládání mapování:', error);
    }
}

function loadLayerMappingsFromStorage() {
    try {
        const data = localStorage.getItem('layerMappings');
        if (data) {
            const parsed = JSON.parse(data);
            
            console.log('Načítám mapování z localStorage:', parsed);
            
            // ÚPLNĚ VYČISTÍME STARÁ MAPOVÁNÍ (stejně jako při importu)
            layerLineMappings = {};
            clickableAreas = {};
            
            if (parsed.lineMappings) {
                layerLineMappings = { ...parsed.lineMappings };
                console.log('Načtena čárová mapování z localStorage:', Object.keys(layerLineMappings));
            }
            if (parsed.clickableAreas) {
                clickableAreas = { ...parsed.clickableAreas };
                console.log('Načteny klikací oblasti z localStorage:', Object.keys(clickableAreas));
            }
            
            console.log('Mapování načteno z localStorage');
            drawLayersOptimized(true);
        } else {
            console.log('Žádná uložená mapování v localStorage - používám výchozí mapování ze souboru layer_mappings.json');
        }
    } catch (error) {
        console.error('Chyba při načítání mapování:', error);
        // V případě chyby necháme defaultní mapování
        console.log('Používám výchozí mapování ze souboru layer_mappings.json');
    }
}

// Kreslení čar pro mapování
function drawMappingLines() {
    if (!isLayerMappingMode) return;
    
    ctx.save();
    
    // Kreslení všech uložených čár
    for (const [layerName, mapping] of Object.entries(layerLineMappings)) {
        if (mapping.startX !== undefined) {
            drawMappingLine(mapping, '#4CAF50', `${layerName} (uloženo)`);
        }
    }
    
    // Kreslení aktuální čáry (pokud se kreslí)
    if (currentMappingLine && selectedLayerForMapping) {
        drawMappingLine(currentMappingLine, '#2196F3', `${selectedLayerForMapping} (editace)`);
    }
    
    ctx.restore();
}

function drawMappingLine(mapping, color, label) {
    // Převedeme souřadnice čáry na canvas souřadnice
    const startCanvasX = canvas.imageOffsetX + (mapping.startX * canvas.imageScale);
    const startCanvasY = canvas.imageOffsetY + (mapping.startY * canvas.imageScale);
    const endCanvasX = canvas.imageOffsetX + (mapping.endX * canvas.imageScale);
    const endCanvasY = canvas.imageOffsetY + (mapping.endY * canvas.imageScale);
    
    // Kreslíme klikatelnou oblast (tloušťka čáry)
    const thickness = mapping.thickness * canvas.imageScale;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.7;
    
    // Hlavní čára
    ctx.beginPath();
    ctx.moveTo(startCanvasX, startCanvasY);
    ctx.lineTo(endCanvasX, endCanvasY);
    ctx.stroke();
    
    // Kreslíme hranice klikatelné oblasti
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.globalAlpha = 1;
    
    ctx.beginPath();
    ctx.moveTo(startCanvasX, startCanvasY);
    ctx.lineTo(endCanvasX, endCanvasY);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Kreslíme body na koncích
    ctx.fillStyle = color;
    ctx.globalAlpha = 1;
    
    const pointRadius = 6;
    ctx.beginPath();
    ctx.arc(startCanvasX, startCanvasY, pointRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(endCanvasX, endCanvasY, pointRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Popisek
    if (label) {
        const midX = (startCanvasX + endCanvasX) / 2;
        const midY = (startCanvasY + endCanvasY) / 2;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(midX - 60, midY - 15, 120, 30);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label, midX, midY + 4);
        ctx.textAlign = 'left';
    }
}

// =====================================================
// FUNKCE PRO VYHLEDÁVÁNÍ
// =====================================================

// Globální proměnné pro vyhledávání
let currentSearchResults = [];
let currentSearchTerm = '';
let isInSearchMode = false; // Sleduje, zda jsme v režimu vyhledávání

// Hlavní funkce pro vyhledávání
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        clearSearch();
        return;
    }
    
    currentSearchTerm = searchTerm;
    console.log('Provádím vyhledávání pro:', searchTerm);
    
    // Zkontroluj, zda jsou načtena Excel data
    if (!excelData1) {
        setInfoLabel('Nelze vyhledávat - Excel data nejsou načtena!', true);
        return;
    }
    
    // Najdi všechny listy v Excel datech
    const searchResults = [];
    
    Object.keys(excelData1).forEach(sheetName => {
        const sheetData = excelData1[sheetName];
        if (!sheetData || sheetData.length === 0) return;
        
        console.log(`Prohledávám list: ${sheetName}`);
        
        // Najdi správné indexy hlaviček a dat (stejná logika jako showExcelData)
        const { headerRowIndex, dataStartIndex } = findHeaderAndDataIndices(sheetData);
        
        // Získej hlavičky (slice 1,19 stejně jako showExcelData)
        const headers = sheetData[headerRowIndex] ? sheetData[headerRowIndex].slice(1, 19) : [];
        
        // Najdi indexy sloupců "č.PZS" a "km"
        const pzsColumnIndex = findColumnIndex(headers, 'č.PZS');
        const kmColumnIndex = findColumnIndex(headers, 'km');
        
        if (pzsColumnIndex === -1 && kmColumnIndex === -1) {
            console.log(`List ${sheetName} neobsahuje sloupce č.PZS ani km`);
            return;
        }
        
        // Prohledej datové řádky (začni od dataStartIndex)
        for (let rawRowIndex = dataStartIndex; rawRowIndex < sheetData.length; rawRowIndex++) {
            const rawRow = sheetData[rawRowIndex];
            if (!rawRow) continue;
            
            // Použij stejné řezání sloupců jako showExcelData (slice 1,19)
            const row = rawRow.slice(1, 19);
            
            let found = false;
            let foundColumn = '';
            let foundValue = '';
            
            // Kontrola sloupce č.PZS
            if (pzsColumnIndex !== -1 && row[pzsColumnIndex]) {
                const cellValue = String(row[pzsColumnIndex]).trim();
                if (cellValue.toLowerCase().includes(searchTerm.toLowerCase())) {
                    found = true;
                    foundColumn = 'č.PZS';
                    foundValue = cellValue;
                }
            }
            
            // Kontrola sloupce km
            if (!found && kmColumnIndex !== -1 && row[kmColumnIndex]) {
                const cellValue = String(row[kmColumnIndex]).trim();
                if (cellValue.toLowerCase().includes(searchTerm.toLowerCase())) {
                    found = true;
                    foundColumn = 'km';
                    foundValue = cellValue;
                }
            }
            
            if (found) {
                // Vypočti index řádku v tabulce (relativně k dataStartIndex)
                const tableRowIndex = rawRowIndex - dataStartIndex;
                
                searchResults.push({
                    layerName: sheetName,
                    rowIndex: tableRowIndex, // Index pro tabulku (0-based)
                    rawRowIndex: rawRowIndex, // Původní Excel index
                    columnName: foundColumn,
                    value: foundValue,
                    fullRow: row
                });
                console.log(`Nalezen výsledek: ${sheetName}, Excel řádek ${rawRowIndex}, tabulka řádek ${tableRowIndex}, ${foundColumn}: ${foundValue}`);
            }
        }
    });
    
    currentSearchResults = searchResults;
    displaySearchResults(searchResults);
    
    if (searchResults.length > 0) {
        setInfoLabel(`Nalezeno ${searchResults.length} výsledků pro "${searchTerm}"`);
    } else {
        setInfoLabel(`Žádné výsledky pro "${searchTerm}"`, true);
    }
}

// Pomocná funkce pro nalezení indexu sloupce podle názvu
function findColumnIndex(headers, columnName) {
    if (!headers) return -1;
    
    for (let i = 0; i < headers.length; i++) {
        if (headers[i] && String(headers[i]).trim().toLowerCase() === columnName.toLowerCase()) {
            return i;
        }
    }
    return -1;
}

// Pomocná funkce pro nalezení správných indexů hlaviček a dat (stejná logika jako showExcelData)
function findHeaderAndDataIndices(sheetData) {
    let headerRowIndex = -1;
    let dataStartIndex = -1;
    
    // Hledání řádku s hlavičkami (řádek s nejvíce neprázdnými buňkami)
    for (let i = 0; i < Math.min(10, sheetData.length); i++) {
        const row = sheetData[i];
        if (row && row.length > 0) {
            const nonEmptyCount = row.filter(cell => cell && String(cell).trim() !== '').length;
            if (nonEmptyCount > 3) { // Předpokládáme, že hlavičky mají alespoň 3 sloupce
                headerRowIndex = i;
                dataStartIndex = i + 1;
                break;
            }
        }
    }
    
    // Fallback pokud nenajdeme lepší hlavičky
    if (headerRowIndex === -1) {
        headerRowIndex = 0;
        dataStartIndex = 1;
    }
    
    return { headerRowIndex, dataStartIndex };
}

// Zobrazení výsledků hledání
function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    const searchResultsList = document.getElementById('searchResultsList');
    
    if (results.length === 0) {
        searchResults.style.display = 'none';
        return;
    }
    
    searchResults.style.display = 'block';
    searchResultsList.innerHTML = '';
    
    results.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.onclick = () => selectSearchResult(result, index);
        
        const layerDiv = document.createElement('div');
        layerDiv.className = 'search-result-layer';
        layerDiv.textContent = result.layerName;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'search-result-content';
        
        // Zvýrazni hledaný výraz
        const highlightedValue = highlightSearchTerm(result.value, currentSearchTerm);
        contentDiv.innerHTML = `${result.columnName}: ${highlightedValue}`;
        
        resultItem.appendChild(layerDiv);
        resultItem.appendChild(contentDiv);
        searchResultsList.appendChild(resultItem);
    });
}

// Zvýraznění hledaného výrazu
function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="search-result-highlight">$1</span>');
}

// Výběr výsledku hledání
function selectSearchResult(result, index) {
    console.log('Vybírám výsledek hledání:', result);
    
    // Označíme, že jsme v režimu vyhledávání
    isInSearchMode = true;
    
    // Odeber označení z jiných výsledků
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Označit vybraný výsledek
    const resultItems = document.querySelectorAll('.search-result-item');
    if (resultItems[index]) {
        resultItems[index].classList.add('selected');
    }
    
    // 1. Skryj všechny vrstvy
    hideAllLayers();
    
    // 2. Zobraz pouze vrstvu s nalezeným výsledkem
    showOnlyLayer(result.layerName);
    
    // 3. Otevři tabulky pro tuto vrstvu (simuluj kliknutí na vrstvu)
    openLayerTables(result.layerName, result.rowIndex);
    
    setInfoLabel(`Zobrazena vrstva "${result.layerName}" s nalezeným výsledkem`);
}

// Skrytí všech vrstev
function hideAllLayers() {
    const layerCheckboxes = document.querySelectorAll('#layersList input[type="checkbox"]');
    layerCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    updateCompositeImage(); // Překresli scénu
}

// Zobrazení pouze jedné vrstvy
function showOnlyLayer(layerName) {
    const layerCheckboxes = document.querySelectorAll('#layersList input[type="checkbox"]');
    layerCheckboxes.forEach(checkbox => {
        // Porovnáváme s ID checkboxu (formát: layer_nazevVrstvy)
        if (checkbox.id === `layer_${layerName}`) {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
        }
    });
    updateCompositeImage(); // Překresli scénu
}

// Otevření tabulek pro vrstvu a označení konkrétního řádku
function openLayerTables(layerName, rowIndex) {
    console.log(`Otevírám tabulky pro vrstvu: ${layerName}, řádek: ${rowIndex}`);
    
    // Použij existující funkci showExcelData
    showExcelData(layerName);
    
    // Po krátkém zpoždění označit řádek (čekáme až se modal otevře)
    setTimeout(() => {
        // Oprava: označit o řádek výše
        selectTableRow(rowIndex - 1);
        console.log(`Označuji řádek s indexem ${rowIndex - 1} v tabulce (původně ${rowIndex})`);
    }, 200);
}

// Označení řádku v tabulce
function selectTableRow(rowIndex) {
    const firstTable = document.getElementById('first-table');
    if (!firstTable) return;
    
    const tbody = firstTable.querySelector('tbody');
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('tr');
    if (rowIndex >= 0 && rowIndex < rows.length) {
        // Odeber označení z jiných řádků
        rows.forEach(row => row.classList.remove('selected'));
        
        // Označit vybraný řádek
        const targetRow = rows[rowIndex];
        targetRow.classList.add('selected');
        targetRow.style.backgroundColor = '#e3f2fd';
        
        // Scroll na řádek
        targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Simuluj kliknutí pro načtení druhé tabulky
        targetRow.click();
        
        console.log(`Označen řádek ${rowIndex} v první tabulce`);
    }
}

// Vyčištění vyhledávání
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    searchInput.value = '';
    searchResults.style.display = 'none';
    currentSearchResults = [];
    currentSearchTerm = '';
    isInSearchMode = false; // Reset search mode
    
    // Obnov všechny vrstvy
    restoreAllLayers();
    
    setInfoLabel('Vyhledávání vyčištěno a všechny vrstvy obnoveny');
}

// Obnovení všech vrstev do původního stavu
function restoreAllLayers() {
    const layerCheckboxes = document.querySelectorAll('#layersList input[type="checkbox"]');
    layerCheckboxes.forEach(checkbox => {
        checkbox.checked = true; // Zapni všechny vrstvy
    });
    updateCompositeImage(); // Překresli scénu
}

// =====================================================
// FUNKCE PRO FILTROVÁNÍ DAT
// =====================================================

// Globální proměnné pro filtrování
let currentFilterData = null;
let isFilterModalOpen = false;

// Aktualizace možností sloupců na základě vybraného zdroje dat
function updateColumnOptions() {
    const dataSourceRadios = document.querySelectorAll('input[name="dataSource"]');
    const columnSelect = document.getElementById('columnSelect');
    
    let selectedSource = '';
    dataSourceRadios.forEach(radio => {
        if (radio.checked) {
            selectedSource = radio.value;
        }
    });
    
    // Vyčisti předchozí možnosti
    columnSelect.innerHTML = '<option value="">-- Vyberte sloupec --</option>';
    
    let dataSource = null;
    if (selectedSource === 'excel1' && excelData1) {
        dataSource = excelData1;
    } else if (selectedSource === 'excel2' && excelData2) {
        dataSource = excelData2;
    }
    
    if (!dataSource) {
        console.log('Zdroj dat není dostupný pro:', selectedSource);
        return;
    }
    
    // Získej všechny unikátní názvy sloupců ze všech listů
    const allColumns = new Set();
    
    Object.keys(dataSource).forEach(sheetName => {
        const sheetData = dataSource[sheetName];
        if (!sheetData || sheetData.length === 0) return;
        
        // Najdi hlavičky pomocí stejné logiky jako při vyhledávání
        const { headerRowIndex } = findHeaderAndDataIndices(sheetData);
        const headers = sheetData[headerRowIndex] ? sheetData[headerRowIndex] : [];
        
        headers.forEach(header => {
            if (header && String(header).trim() !== '') {
                allColumns.add(String(header).trim());
            }
        });
    });
    
    // Seřaď sloupce abecedně a přidej do selectu
    const sortedColumns = Array.from(allColumns).sort();
    sortedColumns.forEach(column => {
        const option = document.createElement('option');
        option.value = column;
        option.textContent = column;
        columnSelect.appendChild(option);
    });
    
    console.log(`Načteno ${sortedColumns.length} sloupců pro ${selectedSource}:`, sortedColumns);
}

// Aplikace filtru na data
function applyDataFilter() {
    const dataSourceRadios = document.querySelectorAll('input[name="dataSource"]');
    const columnSelect = document.getElementById('columnSelect');
    const filterType = document.getElementById('filterType');
    const filterValue = document.getElementById('filterValue');
    
    // Získej vybraný zdroj dat
    let selectedSource = '';
    dataSourceRadios.forEach(radio => {
        if (radio.checked) {
            selectedSource = radio.value;
        }
    });
    
    const selectedColumn = columnSelect.value;
    const selectedFilterType = filterType.value;
    const selectedFilterValue = filterValue.value.trim();
    
    // Validace
    if (!selectedColumn) {
        alert('Vyberte sloupec pro filtrování!');
        return;
    }
    
    if (!selectedFilterType) {
        alert('Vyberte typ filtru!');
        return;
    }
    
    if ((selectedFilterType === 'contains' || selectedFilterType === 'equals' || 
         selectedFilterType === 'startsWith' || selectedFilterType === 'endsWith') && 
        !selectedFilterValue) {
        alert('Zadejte hodnotu pro filtr!');
        return;
    }
    
    let dataSource = null;
    let dataSourceName = '';
    
    if (selectedSource === 'excel1' && excelData1) {
        dataSource = excelData1;
        dataSourceName = 'Detail PZS (Excel 1)';
    } else if (selectedSource === 'excel2' && excelData2) {
        dataSource = excelData2;
        dataSourceName = 'Podrobnosti PZS (Excel 2)';
    }
    
    if (!dataSource) {
        alert('Zvolený zdroj dat není dostupný!');
        return;
    }
    
    console.log('Aplikuji filtr:', {
        source: selectedSource,
        column: selectedColumn,
        type: selectedFilterType,
        value: selectedFilterValue
    });
    
    // Proveď filtrování
    const filteredData = performDataFiltering(dataSource, selectedColumn, selectedFilterType, selectedFilterValue);
    
    // Zobraz výsledky ve filtrovacím modalu
    showFilterResults(dataSourceName, selectedColumn, selectedFilterType, selectedFilterValue, filteredData);
}

// Provedení filtrování dat
function performDataFiltering(dataSource, columnName, filterType, filterValue) {
    const allFilteredResults = [];
    
    Object.keys(dataSource).forEach(sheetName => {
        const sheetData = dataSource[sheetName];
        if (!sheetData || sheetData.length === 0) return;
        
        // Najdi hlavičky a data
        const { headerRowIndex, dataStartIndex } = findHeaderAndDataIndices(sheetData);
        const headers = sheetData[headerRowIndex] ? sheetData[headerRowIndex] : [];
        
        // Najdi index požadovaného sloupce
        const columnIndex = headers.findIndex(header => 
            header && String(header).trim() === columnName
        );
        
        if (columnIndex === -1) {
            console.log(`Sloupec "${columnName}" nenalezen v listu ${sheetName}`);
            return;
        }
        
        // Filtruj řádky
        for (let i = dataStartIndex; i < sheetData.length; i++) {
            const row = sheetData[i];
            if (!row) continue;
            
            const cellValue = row[columnIndex] ? String(row[columnIndex]).trim() : '';
            let matches = false;
            
            switch (filterType) {
                case 'contains':
                    matches = cellValue.toLowerCase().includes(filterValue.toLowerCase());
                    break;
                case 'equals':
                    matches = cellValue.toLowerCase() === filterValue.toLowerCase();
                    break;
                case 'startsWith':
                    matches = cellValue.toLowerCase().startsWith(filterValue.toLowerCase());
                    break;
                case 'endsWith':
                    matches = cellValue.toLowerCase().endsWith(filterValue.toLowerCase());
                    break;
                case 'notEmpty':
                    matches = cellValue !== '';
                    break;
                case 'isEmpty':
                    matches = cellValue === '';
                    break;
            }
            
            if (matches) {
                allFilteredResults.push({
                    sheetName: sheetName,
                    rowIndex: i,
                    rowData: row,
                    headers: headers,
                    matchedValue: cellValue
                });
            }
        }
    });
    
    console.log(`Filtr nalezl ${allFilteredResults.length} řádků`);
    return allFilteredResults;
}

// Zobrazení výsledků filtru v novém modalu
function showFilterResults(dataSourceName, columnName, filterType, filterValue, filteredData) {
    // Vytvoř modal pro filtrované výsledky
    let filterModal = document.getElementById('filterModal');
    if (!filterModal) {
        filterModal = createFilterModal();
    }
    
    const modalTitle = document.getElementById('filterModalTitle');
    const filterContainer = document.getElementById('filterDataContainer');
    
    // Nastav titulek
    const filterDescription = getFilterDescription(filterType, filterValue);
    modalTitle.textContent = `Filtrované data: ${dataSourceName} - ${columnName} ${filterDescription}`;
    
    // Vyčisti předchozí obsah
    filterContainer.innerHTML = '';
    
    if (filteredData.length === 0) {
        filterContainer.innerHTML = '<div class="no-results">Žádné řádky nevyhovují zadaným kritériím.</div>';
    } else {
        // Vytvoř tabulku s filtrovanými daty
        const table = createFilteredDataTable(filteredData);
        filterContainer.appendChild(table);
    }
    
    // Zobraz modal
    filterModal.style.display = 'block';
    isFilterModalOpen = true;
    
    setInfoLabel(`Filtr nalezl ${filteredData.length} řádků`);
}

// Vytvoření modalu pro filtrované výsledky
function createFilterModal() {
    const modal = document.createElement('div');
    modal.id = 'filterModal';
    modal.className = 'modal';
    modal.style.display = 'none';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="filterModalTitle">Filtrované data</h2>
                <span class="close" onclick="closeFilterModal()">&times;</span>
            </div>
            <div class="modal-body">
                <div id="filterDataContainer"></div>
            </div>
        </div>
    `;
    
    // Přidej event listener pro zavření při kliknutí na pozadí
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeFilterModal();
        }
    });
    
    document.body.appendChild(modal);
    return modal;
}

// Vytvoření tabulky s filtrovanými daty
function createFilteredDataTable(filteredData) {
    const table = document.createElement('table');
    table.className = 'excel-table filter-table';
    
    if (filteredData.length === 0) return table;
    
    // Vytvoř hlavičku (použij hlavičky z prvního řádku)
    const headers = filteredData[0].headers;
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Přidej sloupec pro název listu
    const sheetHeader = document.createElement('th');
    sheetHeader.textContent = 'List';
    sheetHeader.style.backgroundColor = '#e3f2fd';
    headerRow.appendChild(sheetHeader);
    
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header || '';
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Vytvoř tělo tabulky
    const tbody = document.createElement('tbody');
    
    filteredData.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        
        // Hover efekt
        tr.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f5f5f5';
        });
        
        tr.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });
        
        // Sloupec s názvem listu
        const sheetTd = document.createElement('td');
        sheetTd.textContent = item.sheetName;
        sheetTd.style.fontWeight = 'bold';
        sheetTd.style.backgroundColor = '#f8f9fa';
        tr.appendChild(sheetTd);
        
        // Data sloupce
        item.rowData.forEach(cellValue => {
            const td = document.createElement('td');
            td.textContent = cellValue || '';
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    return table;
}

// Popis filtru pro titulek
function getFilterDescription(filterType, filterValue) {
    switch (filterType) {
        case 'contains': return `obsahuje "${filterValue}"`;
        case 'equals': return `= "${filterValue}"`;
        case 'startsWith': return `začíná na "${filterValue}"`;
        case 'endsWith': return `končí na "${filterValue}"`;
        case 'notEmpty': return 'není prázdné';
        case 'isEmpty': return 'je prázdné';
        default: return '';
    }
}

// Zavření filtrovacího modalu
function closeFilterModal() {
    const filterModal = document.getElementById('filterModal');
    if (filterModal) {
        filterModal.style.display = 'none';
    }
    isFilterModalOpen = false;
}

// Vyčištění filtru
function clearDataFilter() {
    const columnSelect = document.getElementById('columnSelect');
    const filterType = document.getElementById('filterType');
    const filterValue = document.getElementById('filterValue');
    
    columnSelect.value = '';
    filterType.value = 'contains';
    filterValue.value = '';
    
    // Zavři filtr modal pokud je otevřený
    closeFilterModal();
    
    setInfoLabel('Filtr dat vyčištěn');
}