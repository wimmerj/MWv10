# Webová verze LayeredImageApp

Tato webová aplikace replikuje funkcionalitu původní Python aplikace `LayeredImageApp11.py`.

## 🆕 NOVÉ! JSON Podpora pro rychlejší načítání

**Webová aplikace nyní podporuje rychlejší JSON soubory místo pomalých Excel souborů!**

### Jak to funguje:
1. **Automatické načítání**: Aplikace se nejprve pokusí načíst JSON soubory (`01_Detail_PZS.json`, `02_Podrobnosti_PZS.json`)
2. **Fallback na Excel**: Pokud JSON soubory nejsou k dispozici, tlačítka zůstanou aktivní pro načtení Excel souborů
3. **Deaktivace tlačítek**: Pokud jsou JSON soubory úspěšně načteny, tlačítka "Načíst Excel 1/2" se deaktivují
4. **Konverze nástroj**: Použijte `excel_to_json_converter.py` pro konverzi Excel souborů na JSON

### Excel to JSON Converter Tool

**Nový Python script `excel_to_json_converter.py`** poskytuje dvě hlavní funkce:

#### 🔄 Záložka 1: Konverze Excel → JSON
- Automatická detekce Excel souborů v aktuální složce
- Manuální výběr Excel souborů
- Konverze na JSON formát kompatibilní s webovou aplikací
- Zachování struktury dat a všech listů
- Podrobný výstup o procesu konverze

#### 🔍 Záložka 2: Porovnání a aktualizace
- Automatické porovnání času modifikace Excel vs JSON souborů
- Detekce změn v obsahu (počet listů, řádků)
- Automatická aktualizace JSON souborů při změnách v Excel
- Vytváření záloh před aktualizací
- Ruční záloha JSON souborů

### Výhody JSON formátu:
- **Rychlejší načítání** - JSON se načítá okamžitě vs. několik sekund pro Excel
- **Menší velikost** - JSON soubory jsou obvykle menší
- **Lepší výkon** - Nižší zátěž prohlížeče
- **Automatická aktualizace** - Tool detekuje změny a aktualizuje JSON

## Nové! Načtení hlavní složky

**Modré tlačítko "Načíst hlavní složku"** umožňuje vybrat celou složku s projektem a automaticky načíst všechny potřebné soubory najednou.

### Jak používat:
1. Klikněte na **"Načíst hlavní složku"** (modré tlačítko)
2. Vyberte složku obsahující všechny soubory projektu
3. Aplikace automaticky najde a načte:
   - `03_BG.png` - pozadí
   - Všechny PNG soubory z `Layers_position/` - vrstvy
   - **JSON soubory** (priorita): `01_Detail_PZS.json`, `02_Podrobnosti_PZS.json`
   - **Excel soubory** (fallback): `01_Detail_PZS.xlsx`, `02_Podrobnosti_PZS.xlsx`

### Výhody:
- **Jedno kliknutí** - načte všechny soubory najednou
- **Automatické rozpoznání** - najde správné soubory podle názvu a umístění
- **Inteligentní priorita** - preferuje rychlé JSON soubory před Excel
- **Zpětná vazba** - zobrazí, které soubory byly úspěšně načteny
- **Bezpečnost** - používá standardní webové API pro výběr souborů

## Automatické načítání souborů (původní funkce)

Aplikace se při spuštění automaticky pokusí načíst následující soubory ze svého adresáře:

### Pozadí
- `03_BG.png` - základní obrázek pozadí

### Vrstvy
Z podsložky `Layers_position/`:
- `522A.png`, `709B.png`, `710A.png`, `710B.png`, `711.png`
- `712A.png`, `712B.png`, `713A.png`, `714A.png`, `714B.png`
- `714C.png`, `717A.png`, `717B.png`, `717C.png`, `719.png`
- `720A.png`, `legenda.png`, `nadpis.png`, `PLZEŇ.png`

### Data soubory (priorita JSON)
- **1. priorita**: `01_Detail_PZS.json`, `02_Podrobnosti_PZS.json` - rychlé JSON soubory
- **2. priorita**: `01_Detail_PZS.xlsx`, `02_Podrobnosti_PZS.xlsx` - Excel soubory (fallback)

## Funkce

1. **🆕 Načtení hlavní složky** - vyberte složku a načtěte vše najednou
2. **🚀 JSON podpora** - rychlejší načítání dat než Excel soubory
3. **⚙️ Excel to JSON Converter** - nástroj pro konverzi a správu dat
4. **🔄 Automatická aktualizace** - detekce změn a aktualizace JSON souborů
5. **Automatické načítání** - při spuštění se načtou všechny dostupné soubory
6. **Interaktivní vrstvy** - hover efekt při pohybu myši
7. **Kliknutí na vrstvu** - zobrazení dat v modalu
8. **Dual tabulky** - zobrazení dat z obou souborů
9. **Hyperlinky** - podpora pro otevírání odkazů (webové URL)
10. **Ruční načítání** - možnost načíst vlastní soubory pomocí jednotlivých tlačítek

## Použití

### Rychlý start (doporučeno):
1. **Konverze Excel → JSON** (jednorazově):
   - Spusťte `python excel_to_json_converter.py`
   - Vyberte záložku "Konverze Excel → JSON"
   - Klikněte "Auto-detekce souborů v aktuální složce"
   - Klikněte "Převést na JSON"
   
2. **Použití webové aplikace**:
   - Otevřete `mainpage.html` ve webovém prohlížeči
   - Klikněte na **"Načíst hlavní složku"** (modré tlačítko)
   - Vyberte složku obsahující všechny soubory projektu
   - Aplikace automaticky načte rychlé JSON soubory

### Pravidelná údržba:
1. **Aktualizace při změnách Excel souborů**:
   - Spusťte `python excel_to_json_converter.py`
   - Vyberte záložku "Porovnání a aktualizace"
   - Klikněte "Najít Excel a JSON soubory v aktuální složce"
   - Klikněte "Porovnat data"
   - Pokud jsou změny, klikněte "Aktualizovat JSON soubory"

### Alternativní použití (bez JSON):
1. Otevřete `mainpage.html` ve webovém prohlížeči
2. Použijte jednotlivá tlačítka pro načtení konkrétních souborů
3. Pohybujte myší nad obrázkem pro zobrazení jednotlivých vrstev
4. Klikněte na vrstvu pro zobrazení dat
5. V první tabulce klikněte na řádek pro zobrazení souvisejících dat v druhé tabulce
6. Dvojklik na řádek s hyperlinkem (označen podtržítky) otevře odkaz

## Technické požadavky

- Moderní webový prohlížeč s podporou HTML5 Canvas a File API
- Soubory musí být organizovány ve správné struktuře adresářů
- Pro automatické načítání je potřeba lokální webový server (kvůli CORS omezením)

## Struktura souborů

```
Hlavní složka/
├── mainpage.html
├── script.js
├── style.css
├── excel_to_json_converter.py      ← NOVÝ! Konverze a správa dat
├── 03_BG.png                       ← automaticky načteno
├── 01_Detail_PZS.json              ← NOVÝ! Rychlé JSON (priorita)
├── 02_Podrobnosti_PZS.json         ← NOVÝ! Rychlé JSON (priorita)
├── 01_Detail_PZS.xlsx              ← Excel (fallback)
├── 02_Podrobnosti_PZS.xlsx         ← Excel (fallback)
└── Layers_position/                ← automaticky načteno
    ├── 522A.png
    ├── 709B.png
    ├── 710A.png
    ├── 710B.png
    ├── 711.png
    ├── 712A.png
    ├── 712B.png
    ├── 713A.png
    ├── 714A.png
    ├── 714B.png
    ├── 714C.png
    ├── 717A.png
    ├── 717B.png
    ├── 717C.png
    ├── 719.png
    ├── 720A.png
    ├── legenda.png
    ├── nadpis.png
    └── PLZEŇ.png
```

### Požadavky pro Excel to JSON Converter:
- Python 3.6+
- pandas (`pip install pandas`)
- openpyxl (`pip install openpyxl`) - pro čtení xlsx souborů
