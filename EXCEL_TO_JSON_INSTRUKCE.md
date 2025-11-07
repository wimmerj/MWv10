# Instrukce pro přidávání nových sloupců do Podrobnosti PZS

## Přehled
Tento dokument popisuje, jak přidat nové sloupce do tabulky "Podrobnosti PZS" a zajistit jejich správné zobrazení ve webové aplikaci.

## Původní struktura
**Původní soubor**: `02_Podrobnosti_PZS.xlsx`
- **Počet sloupců**: 17 (index 0-16)
- **Sloupce**:
  1. (prázdný)
  2. č.
  3. druh
  4. místo
  5. trať
  6. km
  7. č.PZS
  8. r.v.
  9. RZ
  10. VRZ
  11. r. VRZ
  12. posl. RZ
  13. Provedení
  14. Násl.RZ
  15. Udržující
  16. Telefon
  17. Hypertext

## Nová struktura (s přidanými sloupci)
**Nový soubor**: `02_Podrobnosti_PZS_edited.xlsx`
- **Počet sloupců**: 20 (index 0-19)
- **Nově přidané sloupce**:
  - **Sloupec 14**: "Číslo PZ" (mezi "Násl.RZ" a "Udržující")
  - **Sloupec 15**: "Datum UTZ" (mezi "Číslo PZ" a "Násl.UTZ")
  - **Sloupec 16**: "Násl.UTZ" (mezi "Datum UTZ" a "Udržující")

## Postup při přidávání nových sloupců

### Krok 1: Úprava Excel souboru
1. Otevřete soubor `02_Podrobnosti_PZS.xlsx` v Excelu
2. Přidejte nové sloupce na požadované pozice
3. Vyplňte hlavičky nových sloupců v řádku 2 (index 1)
4. Vyplňte data pro nové sloupce
5. Uložte soubor jako `02_Podrobnosti_PZS_edited.xlsx`

### Krok 2: Převod Excel → JSON
1. Otevřete PowerShell v adresáři projektu
2. Aktivujte virtuální prostředí (pokud existuje):
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```
3. Spusťte konvertor:
   ```powershell
   python convert_excel_to_json.py
   ```
4. Skript vytvoří soubor `02_Podrobnosti_PZS_edited.json`

### Krok 3: Záloha a nahrazení původního JSON
```powershell
# Záloha původního souboru
copy 02_Podrobnosti_PZS.json 02_Podrobnosti_PZS_backup.json

# Nahrazení novým souborem
copy 02_Podrobnosti_PZS_edited.json 02_Podrobnosti_PZS.json
```

### Krok 4: Testování
1. Otevřete webovou aplikaci (`vrstvy-prohlizec.html`)
2. Načtěte data (automaticky nebo ručně)
3. Klikněte na nějakou vrstvu pro zobrazení dat
4. Ověřte, že se zobrazují všechny sloupce včetně nově přidaných

## Automatická detekce sloupců
Webová aplikace byla upravena tak, aby **automaticky detekovala počet sloupců** z JSON souboru. To znamená, že:
- Není potřeba upravovat JavaScript kód při přidávání nových sloupců
- Aplikace dynamicky načte všechny dostupné sloupce
- Hlavičky a data se automaticky přizpůsobí

## Technické detaily

### Struktura JSON souboru
```json
{
  "List1": [
    [prázdný řádek],
    [hlavičky - řádek 2],
    [data - řádek 3],
    [data - řádek 4],
    ...
  ]
}
```

### Převodová logika (convert_excel_to_json.py)
- Načte Excel soubor včetně všech sloupců
- Převede hodnoty na JSON-kompatibilní formát:
  - `NaN` → `""`
  - Datum → `"YYYY-MM-DD HH:MM:SS"`
  - Float celá čísla → `int`
  - Ostatní → `string`

### JavaScript úpravy (vrstvy-prohlizec.js)
Změny byly provedeny v následujících funkcích:
1. **`showExcelData()`** - řádek ~1439
   - Změna z: `slice(1, 19)` → `slice(1, maxColumns)`
   - Dynamická detekce počtu sloupců
   
2. **`performSearch()`** - řádek ~3256
   - Změna z: `slice(1, 19)` → `slice(1, maxColumns)`
   - Hledání ve všech sloupcích

## Řešení problémů

### Problém: Nové sloupce se nezobrazují
**Řešení**:
1. Zkontrolujte, že byl vytvořen nový JSON soubor
2. Ověřte, že byl JSON soubor správně nahrazen
3. Vyčistěte cache prohlížeče (Ctrl+F5)
4. Zkontrolujte konzoli prohlížeče pro chyby (F12)

### Problém: Chyba při konverzi Excel → JSON
**Řešení**:
1. Ověřte, že jsou nainstalovány balíčky: `pandas`, `openpyxl`
   ```powershell
   pip install pandas openpyxl
   ```
2. Zkontrolujte, že soubor `02_Podrobnosti_PZS_edited.xlsx` existuje
3. Ověřte, že list má název "List1"

### Problém: Některé hodnoty se zobrazují jako "—"
**Vysvětlení**: 
- Symbol "—" (em dash) se používá místo prázdných hodnot
- To je záměrné a zlepšuje čitelnost tabulky
- Prázdné buňky, `null`, `undefined` se zobrazují jako "—"

## Závěr
Tento systém umožňuje snadné přidávání nových sloupců bez nutnosti úpravy kódu webové aplikace. Stačí:
1. Upravit Excel
2. Spustit konvertor
3. Nahradit JSON soubor
4. Obnovit stránku

## Kontakt
Pokud narazíte na problémy, zkontrolujte:
- Konzoli prohlížeče (F12 → Console)
- Výstup Python skriptu
- Strukturu JSON souboru
