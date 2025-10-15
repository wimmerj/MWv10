import sqlite3
import json

def analyze_database(db_path):
    """Analyzuje strukturu SQLite databáze a vypíše informace o tabulkách"""
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Získání seznamu tabulek
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print("=== STRUKTURA DATABÁZE ===")
    print(f"Počet tabulek: {len(tables)}")
    print()
    
    for table in tables:
        table_name = table[0]
        print(f"📋 TABULKA: {table_name}")
        print("-" * 50)
        
        # Struktura tabulky
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = cursor.fetchall()
        
        print("Sloupce:")
        for col in columns:
            col_id, name, data_type, not_null, default_val, is_pk = col
            pk_indicator = " (PRIMARY KEY)" if is_pk else ""
            null_indicator = " NOT NULL" if not_null else ""
            print(f"  - {name}: {data_type}{null_indicator}{pk_indicator}")
        
        # Počet záznamů
        cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
        count = cursor.fetchone()[0]
        print(f"Počet záznamů: {count}")
        
        # Ukázka dat (prvních 3 záznamů)
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 3;")
        sample_data = cursor.fetchall()
        
        if sample_data:
            print("Ukázka dat:")
            for i, row in enumerate(sample_data, 1):
                print(f"  {i}. {row}")
        
        print()
    
    conn.close()

if __name__ == "__main__":
    analyze_database("Otazky_Quiz.db")