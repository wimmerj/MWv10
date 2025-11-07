# Souhrn změn - Přidání nových sloupců do Podrobnosti PZS

## Datum změn
2025-01-XX (doplňte aktuální datum)

## Co bylo provedeno

### 1. Vytvořen Python konvertor (convert_excel_to_json.py)
**Účel**: Převádí Excel soubory na JSON formát kompatibilní s webovou aplikací

**Funkce**:
- Načte Excel soubor `02_Podrobnosti_PZS_edited.xlsx`
- Zachová všechny sloupce a řádky
- Převede datum na formát `YYYY-MM-DD HH:MM:SS`
- Převede prázdné hodnoty na prázdné řetězce `""`
- Uloží výsledek jako `02_Podrobnosti_PZS_edited.json`

**Použití**:
```powershell
python convert_excel_to_json.py
```

### 2. Vytvořen batch skript pro snadnou konverzi (convert_excel.bat)
**Účel**: Zjednodušuje proces konverze pro uživatele bez znalosti Python příkazů

**Funkce**:
- Automaticky detekuje virtuální prostředí Python
- Kontroluje existenci Excel souboru
- Spouští konverzi
- Nabízí automatické nahrazení původního JSON souboru
- Vytváří zálohu před nahrazením

**Použití**:
```powershell
.\convert_excel.bat
```

### 3. Upravena webová aplikace (vrstvy-prohlizec.js)

#### Změna 1: Funkce `showExcelData()` (řádek ~1439)
**Před změnou**:
```javascript
const relevantData = sheetData.slice(dataStartIndex).map(row => row && row.slice ? row.slice(1, 19) : []);
const headers = sheetData[headerRowIndex] ? sheetData[headerRowIndex].slice(1, 19) : [];
```

**Po změně**:
```javascript
// Dynamicky načteme všechny sloupce (kromě prvního prázdného)
const maxColumns = sheetData[headerRowIndex] ? sheetData[headerRowIndex].length : 0;
const relevantData = sheetData.slice(dataStartIndex).map(row => row && row.slice ? row.slice(1, maxColumns) : []);
const headers = sheetData[headerRowIndex] ? sheetData[headerRowIndex].slice(1, maxColumns) : [];
```

**Důvod**: Pevně nastavený rozsah `slice(1, 19)` omezoval zobrazení pouze na prvních 17 sloupců. Nyní se automaticky načtou všechny dostupné sloupce.

#### Změna 2: Funkce `performSearch()` (řádek ~3256)
**Před změnou**:
```javascript
const headers = sheetData[headerRowIndex] ? sheetData[headerRowIndex].slice(1, 19) : [];
```

**Po změně**:
```javascript
const maxColumns = sheetData[headerRowIndex] ? sheetData[headerRowIndex].length : 0;
const headers = sheetData[headerRowIndex] ? sheetData[headerRowIndex].slice(1, maxColumns) : [];
```

**Důvod**: Vyhledávání nyní pracuje se všemi sloupci, ne jen s prvními 17.

#### Změna 3: Smyčka v `performSearch()` (řádek ~3273)
**Před změnou**:
```javascript
const row = rawRow.slice(1, 19);
```

**Po změně**:
```javascript
const row = rawRow.slice(1, maxColumns);
```

**Důvod**: Zajištění konzistence při prohledávání všech sloupců.

### 4. Vytvořena dokumentace

#### EXCEL_TO_JSON_INSTRUKCE.md
Kompletní návod pro:
- Přidávání nových sloupců do Excel souboru
- Převod Excel → JSON
- Nahrazení původního JSON
- Testování změn
- Řešení problémů

#### test_new_columns.html
Testovací stránka pro ověření:
- Správného načtení JSON
- Zobrazení všech sloupců
- Zvýraznění nově přidaných sloupců
- Formátování dat

## Nové sloupce v databázi

### Struktura "Podrobnosti PZS" - PŘED
```
Index | Název sloupce
------|---------------
0     | (prázdný)
1     | č.
2     | druh
3     | místo
4     | trať
5     | km
6     | č.PZS
7     | r.v.
8     | RZ
9     | VRZ
10    | r. VRZ
11    | posl. RZ
12    | Provedení
13    | Násl.RZ
14    | Udržující
15    | Telefon
16    | Hypertext
```
**Celkem**: 17 sloupců

### Struktura "Podrobnosti PZS" - PO
```
Index | Název sloupce
------|---------------
0     | (prázdný)
1     | č.
2     | druh
3     | místo
4     | trať
5     | km
6     | č.PZS
7     | r.v.
8     | RZ
9     | VRZ
10    | r. VRZ
11    | posl. RZ
12    | Provedení
13    | Násl.RZ
14    | Číslo PZ        ← NOVÝ
15    | Datum UTZ       ← NOVÝ
16    | Násl.UTZ        ← NOVÝ
17    | Udržující
18    | Telefon
19    | Hypertext
```
**Celkem**: 20 sloupců

## Výhody dynamického řešení

### ✅ Automatická detekce sloupců
- Při přidání nových sloupců není nutné měnit JavaScript kód
- Aplikace automaticky zobrazí všechny dostupné sloupce
- Flexibilita pro budoucí rozšíření

### ✅ Zpětná kompatibilita
- Starší JSON soubory s 17 sloupci stále fungují
- Nové JSON soubory s 20+ sloupci fungují stejně dobře

### ✅ Snadná údržba
- Jeden konverzní skript pro všechny změny
- Batch soubor pro uživatele bez znalosti Python
- Dokumentace pro budoucí úpravy

## Testování

### Test 1: Základní funkčnost
1. Otevřít `test_new_columns.html`
2. Ověřit, že se zobrazují všechny sloupce (20)
3. Ověřit, že nové sloupce jsou zvýrazněny

### Test 2: Webová aplikace
1. Otevřít `vrstvy-prohlizec.html`
2. Načíst data (automaticky nebo ručně)
3. Kliknout na nějakou vrstvu
4. Ověřit zobrazení tabulky s novými sloupci
5. Vybrat řádek v první tabulce
6. Ověřit, že druhá tabulka zobrazuje všechny sloupce

### Test 3: Vyhledávání
1. Ve webové aplikaci otevřít "Užitečné funkce"
2. Vyhledat nějaký PZS nebo km
3. Ověřit, že výsledky obsahují všechny sloupce

## Soubory v projektu

### Nové soubory
```
convert_excel_to_json.py          - Python konvertor
convert_excel.bat                 - Batch skript pro konverzi
EXCEL_TO_JSON_INSTRUKCE.md       - Návod pro použití
test_new_columns.html            - Testovací stránka
02_Podrobnosti_PZS_edited.xlsx   - Excel s novými sloupci
02_Podrobnosti_PZS_edited.json   - JSON s novými sloupci
02_Podrobnosti_PZS_backup.json   - Záloha původního JSON
```

### Upravené soubory
```
vrstvy-prohlizec.js              - Dynamická detekce sloupců
02_Podrobnosti_PZS.json          - Nahrazen novým (20 sloupců)
```

## Závěr
Všechny úpravy byly úspěšně provedeny. Webová aplikace nyní:
- ✅ Automaticky detekuje počet sloupců
- ✅ Zobrazuje všechny nové sloupce
- ✅ Zachovává zpětnou kompatibilitu
- ✅ Má snadný systém pro budoucí přidávání sloupců

## Další kroky (volitelné)
1. Otestovat na reálných datech
2. Aktualizovat původní `02_Podrobnosti_PZS.xlsx` s novými sloupci
3. Smazat testovací soubory po ověření funkčnosti
4. Vytvořit git commit se změnami

---
**Připravil**: GitHub Copilot  
**Datum**: 2025-01-XX
