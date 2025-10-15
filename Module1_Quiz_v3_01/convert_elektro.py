import re
import json
import os

def parse_txt_questions(file_path, category_name):
    """Parsuje TXT soubor s otázkami a převede je do JSON formátu"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    questions = []
    
    # Rozdělení obsahu na jednotlivé otázky podle číslování
    question_blocks = re.split(r'\n(?=\d+\))', content.strip())
    
    for i, block in enumerate(question_blocks):
        if not block.strip():
            continue
            
        lines = [line.strip() for line in block.strip().split('\n') if line.strip()]
        
        if len(lines) < 6:
            print(f"Varování: Neúplná otázka {i+1} v souboru {file_path}")
            continue
        
        # První řádek obsahuje číslo a otázku
        question_line = lines[0]
        # Odstranění číslování z otázky
        question_text = re.sub(r'^\d+\)\s*', '', question_line)
        
        # Následující 3 řádky jsou odpovědi
        answers = lines[1:4]
        
        # 4. řádek je správná odpověď
        correct_answer_text = lines[4]
        
        # Zbývající řádky jsou vysvětlení (může být více řádků)
        explanation_lines = lines[5:]
        explanation = ' '.join(explanation_lines) if explanation_lines else ''
        
        # Najdeme index správné odpovědi
        correct_index = -1
        for j, answer in enumerate(answers):
            if answer.strip() == correct_answer_text.strip():
                correct_index = j
                break
        
        if correct_index == -1:
            print(f"Varování: Nepodařilo se najít správnou odpověď pro otázku {i+1}: '{correct_answer_text}'")
            print(f"Dostupné odpovědi: {answers}")
            # Pokusíme se najít nejpodobnější odpověď
            for j, answer in enumerate(answers):
                if correct_answer_text.lower().strip() in answer.lower().strip():
                    correct_index = j
                    break
            if correct_index == -1:
                correct_index = 0  # Fallback na první odpověď
        
        question_obj = {
            "id": i + 1,
            "question": question_text,
            "answers": answers,
            "correct": correct_index,
            "explanation": explanation,
            "category": category_name
        }
        
        questions.append(question_obj)
    
    return questions

def convert_elektro_questions():
    """Hlavní funkce pro převod všech elektrotechnických otázek"""
    
    elektro_dir = "otazky_elektro"
    
    if not os.path.exists(elektro_dir):
        print(f"Složka {elektro_dir} neexistuje!")
        return
    
    # Mapování názvů souborů na kategorie
    file_mapping = {
        "Questions - Všeobecné.txt": "Elektro_Vseobecne",
        "Questions - OB.txt": "Elektro_OB",
        "Questions - ochrana před bleskem (LPS).txt": "Elektro_Ochrana_Blesk",
        "Questions - Ochrana před nebezpečným dotykovým napětím.txt": "Elektro_Ochrana_Dotyk"
    }
    
    all_elektro_questions = []
    elektro_categories = []
    
    print("=== PŘEVOD ELEKTROTECHNICKÝCH OTÁZEK ===")
    
    for filename, category_name in file_mapping.items():
        file_path = os.path.join(elektro_dir, filename)
        
        if not os.path.exists(file_path):
            print(f"Soubor {filename} nenalezen!")
            continue
        
        print(f"\nZpracovávám: {filename}")
        print(f"Kategorie: {category_name}")
        
        try:
            questions = parse_txt_questions(file_path, category_name)
            
            # Uložení do samostatného JSON souboru
            output_filename = f"questions_{category_name}.json"
            with open(output_filename, 'w', encoding='utf-8') as f:
                json.dump(questions, f, ensure_ascii=False, indent=2)
            
            print(f"  → Převedeno {len(questions)} otázek")
            print(f"  → Uloženo do {output_filename}")
            
            # Přidání do celkového seznamu
            all_elektro_questions.extend(questions)
            
            # Přidání kategorie
            elektro_categories.append({
                "id": category_name,
                "name": category_name.replace("_", " "),
                "count": len(questions),
                "filename": output_filename
            })
            
        except Exception as e:
            print(f"Chyba při zpracování {filename}: {e}")
    
    # Uložení všech elektro otázek do jednoho souboru
    if all_elektro_questions:
        with open("questions_elektro_all.json", 'w', encoding='utf-8') as f:
            json.dump(all_elektro_questions, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ Celkem převedeno {len(all_elektro_questions)} elektrotechnických otázek")
        print(f"✅ Uloženo do questions_elektro_all.json")
        
        # Aktualizace hlavního souboru categories.json
        try:
            with open("categories.json", 'r', encoding='utf-8') as f:
                existing_categories = json.load(f)
        except:
            existing_categories = []
        
        # Přidání nových kategorií
        all_categories = existing_categories + elektro_categories
        
        with open("categories.json", 'w', encoding='utf-8') as f:
            json.dump(all_categories, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Aktualizováno categories.json ({len(elektro_categories)} nových kategorií)")
        
        # Aktualizace hlavního souboru se všemi otázkami
        try:
            with open("questions_all.json", 'r', encoding='utf-8') as f:
                existing_questions = json.load(f)
        except:
            existing_questions = []
        
        # Přidání elektro otázek s unikátními ID
        for question in all_elektro_questions:
            question["id"] = f"{question['category']}_{question['id']}"
        
        all_questions = existing_questions + all_elektro_questions
        
        with open("questions_all.json", 'w', encoding='utf-8') as f:
            json.dump(all_questions, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Aktualizováno questions_all.json (celkem {len(all_questions)} otázek)")
    
    print("\n🎉 Převod dokončen!")

if __name__ == "__main__":
    convert_elektro_questions()