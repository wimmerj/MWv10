import sqlite3
import json
import os

def export_database_to_json():
    """Exportuje všechny tabulky z databáze do JSON souborů"""
    
    conn = sqlite3.connect("Otazky_Quiz.db")
    cursor = conn.cursor()
    
    # Získání seznamu všech tabulek kromě sqlite_sequence
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence';")
    tables = cursor.fetchall()
    
    print(f"Exportuji {len(tables)} tabulek...")
    
    for table in tables:
        table_name = table[0]
        print(f"Exportuji tabulku: {table_name}")
        
        # Získání dat z tabulky
        cursor.execute(f"SELECT * FROM {table_name};")
        rows = cursor.fetchall()
        
        # Získání názvů sloupců
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Převod na seznam slovníků
        questions_data = []
        for row in rows:
            row_dict = dict(zip(columns, row))
            
            # Určení indexu správné odpovědi
            correct_answer_text = row_dict['spravna_odpoved']
            answers = [row_dict['odpoved_a'], row_dict['odpoved_b'], row_dict['odpoved_c']]
            
            # Najdeme index správné odpovědi
            correct_index = -1
            for i, answer in enumerate(answers):
                if answer == correct_answer_text:
                    correct_index = i
                    break
            
            # Vytvoření struktury kompatibilní s quizem
            question_obj = {
                "id": row_dict['id'],
                "question": row_dict['otazka'],
                "answers": answers,
                "correct": correct_index,
                "explanation": row_dict['vysvetleni'] if row_dict['vysvetleni'] else "",
                "category": table_name
            }
            
            questions_data.append(question_obj)
        
        # Uložení do JSON souboru
        filename = f"questions_{table_name}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(questions_data, f, ensure_ascii=False, indent=2)
        
        print(f"  → Uloženo {len(questions_data)} otázek do {filename}")
    
    # Vytvoření souhrnného souboru se všemi otázkami
    print("\nVytvářím souhrnný soubor...")
    all_questions = []
    
    for table in tables:
        table_name = table[0]
        cursor.execute(f"SELECT * FROM {table_name};")
        rows = cursor.fetchall()
        
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = [column[1] for column in cursor.fetchall()]
        
        for row in rows:
            row_dict = dict(zip(columns, row))
            
            correct_answer_text = row_dict['spravna_odpoved']
            answers = [row_dict['odpoved_a'], row_dict['odpoved_b'], row_dict['odpoved_c']]
            
            correct_index = -1
            for i, answer in enumerate(answers):
                if answer == correct_answer_text:
                    correct_index = i
                    break
            
            question_obj = {
                "id": f"{table_name}_{row_dict['id']}",
                "question": row_dict['otazka'],
                "answers": answers,
                "correct": correct_index,
                "explanation": row_dict['vysvetleni'] if row_dict['vysvetleni'] else "",
                "category": table_name
            }
            
            all_questions.append(question_obj)
    
    # Uložení souhrnného souboru
    with open("questions_all.json", 'w', encoding='utf-8') as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)
    
    print(f"  → Uloženo {len(all_questions)} otázek celkem do questions_all.json")
    
    # Vytvoření seznamu kategorií
    categories = []
    for table in tables:
        table_name = table[0]
        cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
        count = cursor.fetchone()[0]
        
        categories.append({
            "id": table_name,
            "name": table_name.replace("_", " ").title(),
            "count": count,
            "filename": f"questions_{table_name}.json"
        })
    
    with open("categories.json", 'w', encoding='utf-8') as f:
        json.dump(categories, f, ensure_ascii=False, indent=2)
    
    print(f"  → Uloženo {len(categories)} kategorií do categories.json")
    
    conn.close()
    print("\nExport dokončen!")

if __name__ == "__main__":
    export_database_to_json()