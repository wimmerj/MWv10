import json

def verify_elektro_questions():
    """Ověří strukturu a obsah elektrotechnických otázek"""
    
    elektro_files = [
        "questions_Elektro_Vseobecne.json",
        "questions_Elektro_OB.json", 
        "questions_Elektro_Ochrana_Blesk.json",
        "questions_Elektro_Ochrana_Dotyk.json"
    ]
    
    print("=== OVĚŘENÍ ELEKTROTECHNICKÝCH OTÁZEK ===\n")
    
    total_questions = 0
    issues = []
    
    for filename in elektro_files:
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                questions = json.load(f)
            
            print(f"📁 {filename}")
            print(f"   Počet otázek: {len(questions)}")
            
            # Ověření struktury každé otázky
            for i, q in enumerate(questions):
                required_fields = ['id', 'question', 'answers', 'correct', 'explanation', 'category']
                
                for field in required_fields:
                    if field not in q:
                        issues.append(f"{filename}: Otázka {i+1} nemá pole '{field}'")
                
                # Ověření odpovědí
                if 'answers' in q and len(q['answers']) != 3:
                    issues.append(f"{filename}: Otázka {i+1} nemá 3 odpovědi (má {len(q['answers'])})")
                
                # Ověření správného indexu
                if 'correct' in q and 'answers' in q:
                    if q['correct'] < 0 or q['correct'] >= len(q['answers']):
                        issues.append(f"{filename}: Otázka {i+1} má neplatný index správné odpovědi")
                
                # Kontrola délky vysvětlení
                if 'explanation' in q and len(q['explanation']) > 10:
                    has_explanation = True
                else:
                    has_explanation = False
            
            explanations_count = sum(1 for q in questions if len(q.get('explanation', '')) > 10)
            print(f"   Otázky s vysvětlením: {explanations_count}")
            print(f"   ✅ Struktura OK")
            
            total_questions += len(questions)
            
        except Exception as e:
            issues.append(f"Chyba při načítání {filename}: {e}")
            print(f"   ❌ Chyba: {e}")
        
        print()
    
    print(f"📊 CELKOVÉ STATISTIKY")
    print(f"   Celkem elektro otázek: {total_questions}")
    print(f"   Nalezených problémů: {len(issues)}")
    
    if issues:
        print(f"\n⚠️  PROBLÉMY:")
        for issue in issues:
            print(f"   - {issue}")
    else:
        print(f"\n🎉 Všechny elektrotechnické otázky jsou správně naformátované!")

if __name__ == "__main__":
    verify_elektro_questions()