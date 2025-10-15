// Železniční Quiz aplikace
class RailwayQuiz {
    constructor() {
        this.categories = [];
        this.allQuestions = [];
        this.currentQuestions = [];
        this.currentCategory = null;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.userAnswers = [];
        this.questionCount = 10;
        
        this.loadData();
    }

    // Načtení kategorií a všech otázek
    async loadData() {
        try {
            // Načtení kategorií
            const categoriesResponse = await fetch('Module1_Quiz_v3_01/categories.json');
            this.categories = await categoriesResponse.json();
            
            // Načtení všech otázek
            const questionsResponse = await fetch('Module1_Quiz_v3_01/questions_all.json');
            this.allQuestions = await questionsResponse.json();
            
            this.initializeCategorySelection();
        } catch (error) {
            console.error('Chyba při načítání dat:', error);
            this.showError('Chyba při načítání dat. Zkontrolujte prosím JSON soubory.');
        }
    }

    // Zobrazení chyby
    showError(message) {
        document.getElementById('category-selection').innerHTML = `
            <div style="text-align: center; color: #d32f2f; padding: 40px;">
                <h2>⚠️ Chyba</h2>
                <p>${message}</p>
            </div>
        `;
    }

    // Inicializace výběru kategorií
    initializeCategorySelection() {
        const categoriesGrid = document.getElementById('categories-grid');
        const allCount = document.getElementById('all-count');
        
        // Aktualizace počtu všech otázek
        allCount.textContent = `${this.allQuestions.length} otázek`;
        
        // Vytvoření karet kategorií
        this.categories.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            
            // Přidání speciální třídy pro elektrotechnické kategorie
            if (category.id.startsWith('Elektro_')) {
                categoryCard.classList.add('elektro');
            }
            
            categoryCard.onclick = () => this.selectCategory(category.id);
            
            categoryCard.innerHTML = `
                <h3>${this.formatCategoryName(category.id)}</h3>
                <p>${category.count} otázek</p>
            `;
            
            categoriesGrid.appendChild(categoryCard);
        });
    }

    // Formátování názvu kategorie
    formatCategoryName(categoryId) {
        // Speciální názvy pro elektrotechnické kategorie
        const specialNames = {
            'Elektro_Vseobecne': '⚡ Elektrotechnika - Všeobecné',
            'Elektro_OB': '⚡ Elektrotechnika - OB',
            'Elektro_Ochrana_Blesk': '⚡ Elektrotechnika - Ochrana před bleskem',
            'Elektro_Ochrana_Dotyk': '⚡ Elektrotechnika - Ochrana před dotykem'
        };
        
        if (specialNames[categoryId]) {
            return specialNames[categoryId];
        }
        
        return categoryId
            .replace(/_/g, ' ')
            .replace(/ed\d+/g, '')
            .replace(/ok$/, '')
            .replace(/^\d+/, '')
            .trim();
    }

    // Výběr kategorie
    selectCategory(categoryId) {
        this.currentCategory = categoryId;
        
        // Získání počtu otázek z výběru
        const questionCountSelect = document.getElementById('question-count');
        const selectedCount = questionCountSelect.value;
        
        if (selectedCount === 'all') {
            this.questionCount = categoryId === 'all' ? this.allQuestions.length : 
                this.allQuestions.filter(q => q.category === categoryId).length;
        } else {
            this.questionCount = parseInt(selectedCount);
        }
        
        // Příprava otázek
        if (categoryId === 'all') {
            this.currentQuestions = [...this.allQuestions];
        } else {
            this.currentQuestions = this.allQuestions.filter(q => q.category === categoryId);
        }
        
        // Zamíchání a omezení počtu
        this.shuffleQuestions();
        this.currentQuestions = this.currentQuestions.slice(0, this.questionCount);
        
        this.initializeQuiz();
    }

    // Zamíchání otázek
    shuffleQuestions() {
        for (let i = this.currentQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.currentQuestions[i], this.currentQuestions[j]] = 
                [this.currentQuestions[j], this.currentQuestions[i]];
        }
    }

    // Inicializace kvízu
    initializeQuiz() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.userAnswers = [];
        
        // Skrytí výběru kategorií a zobrazení kvízu
        document.getElementById('category-selection').classList.add('hidden');
        document.getElementById('quiz-container').classList.remove('hidden');
        document.getElementById('result-container').classList.add('hidden');
        
        // Aktualizace informací
        document.getElementById('total-questions').textContent = this.currentQuestions.length;
        document.getElementById('category-name').textContent = 
            this.currentCategory === 'all' ? 'Všechny kategorie' : 
            this.formatCategoryName(this.currentCategory);
        
        this.showQuestion();
        this.updateProgress();
    }

    // Zobrazení aktuální otázky
    showQuestion() {
        if (this.currentQuestionIndex >= this.currentQuestions.length) {
            this.showResults();
            return;
        }

        const question = this.currentQuestions[this.currentQuestionIndex];
        
        // Aktualizace textu otázky
        document.getElementById('question-text').textContent = question.question;
        
        // Aktualizace odpovědí
        question.answers.forEach((answer, index) => {
            document.getElementById(`answer-text-${index}`).textContent = answer;
            const button = document.getElementById(`answer-${index}`);
            button.className = 'answer-btn';
            button.disabled = false;
        });

        // Reset stavu
        this.selectedAnswer = null;
        const nextBtn = document.getElementById('next-btn');
        nextBtn.disabled = true;
        nextBtn.textContent = 'Další otázka';
        
        // Aktualizace čítače otázek
        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
    }

    // Výběr odpovědi
    selectAnswer(answerIndex) {
        // Odstranění předchozího výběru
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Označení vybrané odpovědi
        const selectedButton = document.getElementById(`answer-${answerIndex}`);
        selectedButton.classList.add('selected');
        
        this.selectedAnswer = answerIndex;
        document.getElementById('next-btn').disabled = false;
    }

    // Přechod na další otázku
    nextQuestion() {
        if (this.selectedAnswer === null) return;

        const question = this.currentQuestions[this.currentQuestionIndex];
        const isCorrect = this.selectedAnswer === question.correct;
        
        // Uložení odpovědi uživatele
        this.userAnswers.push({
            question: question.question,
            userAnswer: this.selectedAnswer,
            correctAnswer: question.correct,
            isCorrect: isCorrect,
            answers: question.answers,
            explanation: question.explanation || '',
            category: question.category
        });

        // Zvýšení skóre pokud je odpověď správná
        if (isCorrect) {
            this.score++;
        }

        // Zobrazení správné/nesprávné odpovědi
        this.showAnswerFeedback(question.correct);

        // Kontrola, zda existuje vysvětlení k zobrazení
        if (this.shouldShowExplanation(question.explanation)) {
            // Zobrazit modální okno s vysvětlením
            setTimeout(() => {
                this.showExplanationModal(question, isCorrect);
            }, 1500);
        } else {
            // Pokračování bez vysvětlení po krátké pauze
            setTimeout(() => {
                this.continueToNextQuestion();
            }, 1500);
        }
    }

    // Kontrola, zda má být zobrazeno vysvětlení
    shouldShowExplanation(explanation) {
        return explanation && 
               explanation.trim() !== '' && 
               explanation.trim() !== '()' && 
               explanation.trim().length > 10;
    }

    // Zobrazení modálního okna s vysvětlením
    showExplanationModal(question, isCorrect) {
        const modal = document.getElementById('explanation-modal');
        const title = document.getElementById('explanation-title');
        const correctAnswerSpan = document.getElementById('modal-correct-answer');
        const userAnswerSpan = document.getElementById('modal-user-answer');
        const explanationText = document.getElementById('explanation-text');

        // Nastavení obsahu
        title.textContent = isCorrect ? 'Správně! Vysvětlení' : 'Vysvětlení správné odpovědi';
        correctAnswerSpan.textContent = question.answers[question.correct];
        userAnswerSpan.textContent = question.answers[this.selectedAnswer];
        
        // Nastylování odpovědi uživatele
        userAnswerSpan.className = isCorrect ? 'user-correct' : 'user-incorrect';
        
        explanationText.textContent = question.explanation;

        // Zobrazení modálu
        modal.classList.remove('hidden');
        
        // Focus na tlačítko pokračovat
        document.getElementById('continue-btn').focus();
    }

    // Pokračování na další otázku (po zavření modálu nebo bez vysvětlení)
    continueToNextQuestion() {
        this.currentQuestionIndex++;
        this.updateProgress();
        this.showQuestion();
    }

    // Zavření modálu a pokračování
    continueQuiz() {
        const modal = document.getElementById('explanation-modal');
        modal.classList.add('hidden');
        this.continueToNextQuestion();
    }

    // Zobrazení zpětné vazby k odpovědi
    showAnswerFeedback(correctAnswerIndex) {
        const buttons = document.querySelectorAll('.answer-btn');
        const nextBtn = document.getElementById('next-btn');
        
        buttons.forEach((button, index) => {
            button.disabled = true;
            
            if (index === correctAnswerIndex) {
                button.classList.add('correct');
            } else if (index === this.selectedAnswer && index !== correctAnswerIndex) {
                button.classList.add('incorrect');
            }
        });

        // Zakázání tlačítka "Další otázka" protože se zobrazí buď vysvětlení nebo se automaticky pokračuje
        nextBtn.disabled = true;
        nextBtn.textContent = 'Pokračování...';
    }

    // Aktualizace progress baru
    updateProgress() {
        const progress = (this.currentQuestionIndex / this.currentQuestions.length) * 100;
        document.getElementById('progress').style.width = `${progress}%`;
    }

    // Zobrazení výsledků
    showResults() {
        document.getElementById('quiz-container').classList.add('hidden');
        document.getElementById('result-container').classList.remove('hidden');

        const answeredQuestions = this.userAnswers.length;
        const totalQuestions = this.currentQuestions.length;
        const percentage = Math.round((this.score / answeredQuestions) * 100);
        
        document.getElementById('score-percentage').textContent = `${percentage}%`;
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-total').textContent = answeredQuestions;
        document.getElementById('result-category').textContent = 
            this.currentCategory === 'all' ? 'Všechny kategorie' : 
            this.formatCategoryName(this.currentCategory);

        // Pokud byl quiz ukončen předčasně, zobrazíme informaci
        if (answeredQuestions < totalQuestions) {
            const resultContainer = document.querySelector('.result-container h2');
            resultContainer.innerHTML = `🏁 Quiz ukončen předčasně<br><small style="font-size: 0.7em; color: #666;">Zodpovězeno ${answeredQuestions} z ${totalQuestions} otázek</small>`;
        }

        this.showDetailedResults();
    }

    // Zobrazení detailních výsledků
    showDetailedResults() {
        const resultList = document.getElementById('result-list');
        resultList.innerHTML = '';

        this.userAnswers.forEach((answer, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            const questionDiv = document.createElement('div');
            questionDiv.className = 'result-question';
            questionDiv.innerHTML = `<strong>${index + 1}. ${answer.question}</strong>`;
            
            const statusDiv = document.createElement('div');
            statusDiv.className = `result-status ${answer.isCorrect ? 'correct' : 'incorrect'}`;
            statusDiv.textContent = answer.isCorrect ? '✓ Správně' : '✗ Špatně';
            
            // Přidání detailů odpovědi pro nesprávné odpovědi
            if (!answer.isCorrect) {
                const detailDiv = document.createElement('div');
                detailDiv.style.fontSize = '0.9rem';
                detailDiv.style.color = '#666';
                detailDiv.style.marginTop = '8px';
                detailDiv.innerHTML = `
                    <strong>Vaše odpověď:</strong> ${answer.answers[answer.userAnswer]}<br>
                    <strong>Správná odpověď:</strong> ${answer.answers[answer.correctAnswer]}
                `;
                
                // Přidání vysvětlení, pokud existuje
                if (answer.explanation && answer.explanation.trim() !== '' && answer.explanation !== '()') {
                    const explanationDiv = document.createElement('div');
                    explanationDiv.className = 'explanation';
                    explanationDiv.innerHTML = `<strong>Vysvětlení:</strong> ${answer.explanation}`;
                    detailDiv.appendChild(explanationDiv);
                }
                
                questionDiv.appendChild(detailDiv);
            }
            
            resultItem.appendChild(questionDiv);
            resultItem.appendChild(statusDiv);
            resultList.appendChild(resultItem);
        });
    }

    // Restart kvízu se stejnou kategorií
    restart() {
        this.selectCategory(this.currentCategory);
    }

    // Návrat na výběr kategorií
    backToCategories() {
        document.getElementById('quiz-container').classList.add('hidden');
        document.getElementById('result-container').classList.add('hidden');
        document.getElementById('category-selection').classList.remove('hidden');
    }

    // Zobrazení potvrzovacího dialogu pro ukončení quizu
    showEndQuizModal() {
        const modal = document.getElementById('end-quiz-modal');
        const progressSpan = document.getElementById('modal-progress');
        const scoreSpan = document.getElementById('modal-score');
        
        // Aktualizace informací o průběhu
        progressSpan.textContent = `${this.currentQuestionIndex} z ${this.currentQuestions.length}`;
        scoreSpan.textContent = this.score;
        
        // Zobrazení modálu
        modal.classList.remove('hidden');
    }

    // Zavření modálu pro ukončení (pokračování v quizu)
    hideEndQuizModal() {
        const modal = document.getElementById('end-quiz-modal');
        modal.classList.add('hidden');
    }

    // Ukončení quizu s vyhodnocením aktuálních výsledků
    forceEndQuiz() {
        // Pokud není žádná otázka zodpovězena, ukončíme bez výsledků
        if (this.userAnswers.length === 0) {
            this.backToCategories();
            return;
        }

        // Aktualizace celkového počtu otázek na počet zodpovězených
        this.currentQuestions = this.currentQuestions.slice(0, this.userAnswers.length);
        
        // Zobrazení výsledků
        this.showResults();
    }
}

// Globální instance kvízu
let quiz;

// Spuštění kvízu po načtení stránky
document.addEventListener('DOMContentLoaded', () => {
    quiz = new RailwayQuiz();
});

// Globální funkce pro HTML onclick události
function selectCategory(categoryId) {
    quiz.selectCategory(categoryId);
}

function selectAnswer(answerIndex) {
    quiz.selectAnswer(answerIndex);
}

function nextQuestion() {
    quiz.nextQuestion();
}

function restartQuiz() {
    quiz.restart();
}

function backToCategories() {
    quiz.backToCategories();
}

function continueQuiz() {
    quiz.continueQuiz();
}

function endQuiz() {
    quiz.showEndQuizModal();
}

function confirmEndQuiz() {
    quiz.hideEndQuizModal();
    quiz.forceEndQuiz();
}

function cancelEndQuiz() {
    quiz.hideEndQuizModal();
}

// Podpora klávesových zkratek
document.addEventListener('keydown', (event) => {
    // Pokud je modální okno pro ukončení quizu otevřené
    if (!document.getElementById('end-quiz-modal').classList.contains('hidden')) {
        if (event.key === 'Enter') {
            confirmEndQuiz();
            event.preventDefault();
        } else if (event.key === 'Escape') {
            cancelEndQuiz();
            event.preventDefault();
        }
        return;
    }

    // Pokud je modální okno s vysvětlením otevřené
    if (!document.getElementById('explanation-modal').classList.contains('hidden')) {
        if (event.key === 'Enter' || event.key === ' ') {
            continueQuiz();
            event.preventDefault();
        } else if (event.key === 'Escape') {
            continueQuiz();
            event.preventDefault();
        }
        return;
    }

    // Pouze pokud je quiz aktivní
    if (!document.getElementById('quiz-container').classList.contains('hidden')) {
        switch(event.key) {
            case '1':
            case 'a':
            case 'A':
                selectAnswer(0);
                break;
            case '2':
            case 'b':
            case 'B':
                selectAnswer(1);
                break;
            case '3':
            case 'c':
            case 'C':
                selectAnswer(2);
                break;
            case 'Enter':
            case ' ':
                if (!document.getElementById('next-btn').disabled) {
                    nextQuestion();
                }
                event.preventDefault();
                break;
            case 'Escape':
                endQuiz();
                event.preventDefault();
                break;
        }
    }
});