"""
Excel to JSON Converter for Podrobnosti PZS
Převede Excel soubor 02_Podrobnosti_PZS_edited.xlsx na JSON formát
se stejnou strukturou jako původní 02_Podrobnosti_PZS.json
"""

import pandas as pd
import json
from datetime import datetime

def convert_value(val):
    """Konverze hodnot z pandas DataFrame na JSON-kompatibilní formát"""
    # Kontrola na NaN, None nebo prázdné hodnoty
    if pd.isna(val):
        return ""
    
    # Datetime objekty převeď na řetězec
    if isinstance(val, (pd.Timestamp, datetime)):
        return val.strftime('%Y-%m-%d %H:%M:%S')
    
    # Float hodnoty - zkontroluj, jestli jsou celá čísla
    if isinstance(val, float):
        if val.is_integer():
            return int(val)
        return val
    
    # Ostatní hodnoty převeď na string a trim
    return str(val).strip() if val != "" else ""

def excel_to_json(excel_path, json_path):
    """
    Převede Excel soubor na JSON se strukturou kompatibilní s aplikací
    
    Args:
        excel_path: Cesta k Excel souboru
        json_path: Cesta k výstupnímu JSON souboru
    """
    print(f"Načítám Excel soubor: {excel_path}")
    
    # Načtení Excel souboru - načti všechny sloupce a řádky bez přeskakování
    df = pd.read_excel(excel_path, sheet_name='List1', header=None)
    
    print(f"Načteno {len(df)} řádků a {len(df.columns)} sloupců")
    print(f"\nPrvní řádek (index 0):")
    print(df.iloc[0].tolist())
    print(f"\nDruhý řádek - hlavičky (index 1):")
    print(df.iloc[1].tolist())
    print(f"\nTřetí řádek - první data (index 2):")
    print(df.iloc[2].tolist())
    
    # Převedení DataFrame na seznam seznamů (stejná struktura jako původní JSON)
    data_list = []
    for index, row in df.iterrows():
        row_data = [convert_value(val) for val in row]
        data_list.append(row_data)
    
    # Vytvoření výsledné struktury
    result = {
        "List1": data_list
    }
    
    # Uložení do JSON souboru s čitelným formátováním
    print(f"\nUkládám JSON soubor: {json_path}")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Hotovo! JSON soubor byl úspěšně vytvořen.")
    print(f"  - Celkem řádků: {len(data_list)}")
    print(f"  - Celkem sloupců: {len(data_list[1]) if len(data_list) > 1 else 0}")
    print(f"\nNové sloupce (pokud byly přidány):")
    if len(data_list) > 1:
        headers = data_list[1]
        for i, header in enumerate(headers):
            if header and header.strip():
                print(f"  {i}: {header}")

if __name__ == "__main__":
    # Cesty k souborům
    excel_file = "02_Podrobnosti_PZS_edited.xlsx"
    json_file = "02_Podrobnosti_PZS_edited.json"
    
    print("=" * 60)
    print("Excel → JSON Konvertor pro Podrobnosti PZS")
    print("=" * 60)
    
    try:
        excel_to_json(excel_file, json_file)
        print("\n" + "=" * 60)
        print("ÚSPĚCH: Konverze dokončena!")
        print("=" * 60)
        print(f"\nNyní můžete:")
        print(f"1. Zkontrolovat soubor: {json_file}")
        print(f"2. Zkopírovat jej jako: 02_Podrobnosti_PZS.json")
        print(f"   (nebo upravit kód aplikace pro načítání _edited verze)")
        
    except FileNotFoundError:
        print(f"\n❌ CHYBA: Soubor '{excel_file}' nebyl nalezen!")
        print(f"   Ujistěte se, že soubor existuje ve stejné složce jako tento skript.")
    except Exception as e:
        print(f"\n❌ CHYBA při konverzi: {str(e)}")
        import traceback
        traceback.print_exc()
