# 🚂⚡ Železniční a elektrotechnický Quiz

Pokročilý quiz systém pro otázky z oblasti drážních zabezpečovacích zařízení a elektrotechniky s podporou kategorií a vysvětlení.

## 📋 Přehled

Tento quiz byl vytvořen na základě SQLite databáze `Otazky_Quiz.db` (1099 otázek) a 4 TXT souborů s elektrotechnickými otázkami (410 otázek), celkem obsahuje **1509 otázek** rozdělených do **17 kategorií** zabývajících se různými aspekty železniční dopravy a elektrotechniky.

## 🎯 Funkce

### ✨ Hlavní funkce
- **Výběr kategorií** - můžete si vybrat z 17 specializovaných kategorií nebo všech otázek
- **Drážní zabezpečovací zařízení** - 13 kategorií se zaměřením na železniční systémy
- **Elektrotechnika** - 4 nové kategorie pokrývající elektrotechnické aspekty
- **Nastavitelný počet otázek** - 10, 20, 50 otázek nebo všechny z vybrané kategorie
- **Náhodné pořadí otázek** - každé spuštění kvízu zamíchá otázky
- **Okamžitá zpětná vazba** - zelená/červená pro správné/nesprávné odpovědi
- **Detailní vysvětlení** - po zodpovězení otázky se zobrazí vysvětlení (pokud existuje)
- **Modální okno s vysvětlením** - vysvětlení se zobrazí v přehledném okně, které musíte potvrdit
- **Předčasné ukončení** - možnost ukončit quiz kdykoli s vyhodnocením dosavadních výsledků
- **Responzivní design** - funguje na počítači, tabletu i telefonu

### ⌨️ Ovládání
- **Myš/dotek** - kliknutí na odpovědi a tlačítka
- **Klávesnice**:
  - `1`, `A` - odpověď A
  - `2`, `B` - odpověď B  
  - `3`, `C` - odpověď C
  - `Enter` nebo `Mezerník` - další otázka / pokračovat po vysvětlení / potvrdit ukončení
  - `Escape` - ukončit quiz / zavřít modální okno / zrušit ukončení

## 📂 Struktura souborů

### 🌐 Webové soubory
- `index.html` - hlavní HTML struktura
- `style.css` - CSS styly pro vzhled
- `script.js` - JavaScript logika

### 📊 Data soubory
- `categories.json` - seznam kategorií s počty otázek
- `questions_all.json` - všech 1509 otázek v jednom souboru
- `questions_elektro_all.json` - pouze elektrotechnické otázky (410)
- `questions_[kategorie].json` - jednotlivé kategorie (17 souborů)

### 🔧 Pomocné soubory  
- `Otazky_Quiz.db` - původní SQLite databáze
- `otazky_elektro/` - složka s TXT soubory elektrotechnických otázek
- `export_db.py` - skript pro export SQLite databáze do JSON
- `convert_elektro.py` - skript pro převod TXT souborů do JSON
- `analyze_db.py` - skript pro analýzu struktury databáze

## 📚 Kategorie otázek

### 🚂 Drážní zabezpečovací zařízení (13 kategorií)
1. **_03_UTZ_RTEZ_DUCR** - 222 otázek
2. **_00_SŽ_Změny** - 237 otázek  
3. **ČSN_34_2650** - 140 otázek
4. **ČSN_34_2613_ed3** - 114 otázek
5. **TNŽ_34_2620** - 93 otázek
6. **_01_ČSN_34_2600_ed_2** - 59 otázek
7. **ČSN_37_5711** - 58 otázek
8. **_02_ČSN_EN_50125_3** - 36 otázek
9. **_00_Official_2203__2015_** - 35 otázek
10. **_00_Official_4343__2015_** - 35 otázek
11. **_00_Official_4700__2015_** - 35 otázek
12. **SŽ_T31** - 28 otázek
13. **SŽ_T1** - 7 otázek

### ⚡ Elektrotechnika (4 kategorie)
14. **Elektrotechnika - Všeobecné** - 140 otázek
15. **Elektrotechnika - Ochrana před bleskem** - 100 otázek  
16. **Elektrotechnika - Ochrana před dotykem** - 100 otázek
17. **Elektrotechnika - OB** - 70 otázek

## 🗄️ Struktura JSON dat

### Struktura otázky:
```json
{
  "id": "kategorie_123",
  "question": "Text otázky",
  "answers": ["Odpověď A", "Odpověď B", "Odpověď C"],
  "correct": 1,
  "explanation": "Vysvětlení správné odpovědi",
  "category": "název_kategorie"
}
```

### Struktura kategorie:
```json
{
  "id": "název_kategorie", 
  "name": "Formátovaný název",
  "count": 123,
  "filename": "questions_název_kategorie.json"
}
```

## 🚀 Spuštění

1. Otevřete `index.html` ve webovém prohlížeči
2. Vyberte kategorii otázek
3. Nastavte počet otázek
4. Zahajte quiz

## 🔄 Aktualizace dat

Pro aktualizaci otázek z databáze:

```bash
python export_db.py
```

Tento skript:
- Načte data z `Otazky_Quiz.db`
- Exportuje je do JSON formátu
- Vytvoří soubory pro jednotlivé kategorie
- Aktualizuje souhrnný soubor a kategorie

## 📱 Kompatibilita

- **Prohlížeče**: Chrome, Firefox, Safari, Edge (moderní verze)
- **Zařízení**: Desktop, tablet, smartphone
- **Rozlišení**: optimalizováno pro všechna rozlišení

## 🛠️ Technologie

- **HTML5** - struktura
- **CSS3** - styling s flexboxem a gridem
- **Vanilla JavaScript** - funkcionalita bez závislostí
- **SQLite** - původní databáze
- **Python** - skripty pro export dat

## 📈 Statistiky

- **Celkem otázek**: 1,509
- **Kategorií**: 17 (13 drážních + 4 elektrotechnické)
- **Průměrná délka otázky**: ~80 znaků
- **Pokrytí témat**: Komplexní železniční a elektrotechnická problematika

---

*Vytvořeno pro účely studia a testování znalostí z železniční problematiky.*