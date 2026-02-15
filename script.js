// Состояние приложения
let quiz = {
    title: '',
    questions: []
};

let currentMode = 'builder'; // 'builder' или 'quiz'

// Элементы интерфейса
const builderSection = document.getElementById('builder-section');
const quizSection = document.getElementById('quiz-section');
const toggleModeButton = document.getElementById('toggle-mode');
const quizTitleInput = document.getElementById('quiz-title');
const questionTextInput = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const addOptionButton = document.getElementById('add-option');
const correctAnswerSelect = document.getElementById('correct-answer');
const addQuestionButton = document.getElementById('add-question');
const questionsList = document.getElementById('questions-list');
const saveQuizButton = document.getElementById('save-quiz');
const quizTitleDisplay = document.getElementById('quiz-title-display');
const quizQuestionsContainer = document.getElementById('quiz-questions');
const submitQuizButton = document.getElementById('submit-quiz');
const quizResult = document.getElementById('quiz-result');

// Добавление варианта ответа
addOptionButton.addEventListener('click', () => {
    const optionInput = document.createElement('input');
    optionInput.type = 'text';
    optionInput.className = 'option-input';
    optionInput.placeholder = Вариант ответа ${optionsContainer.children.length + 1};
    optionsContainer.appendChild(optionInput);
    
    // Обновляем селектор правильного ответа
    updateCorrectAnswerOptions();
});

// Обновление вариантов в селекторе правильного ответа
function updateCorrectAnswerOptions() {
    correctAnswerSelect.innerHTML = '';
    for (let i = 0; i < optionsContainer.children.length; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = Вариант ${i + 1};
        correctAnswerSelect.appendChild(option);
    }
}

// Добавление вопроса
addQuestionButton.addEventListener('click', () => {
    const questionText = questionTextInput.value.trim();
    const options = Array.from(optionsContainer.getElementsByClassName('option-input'))
        .map(input => input.value.trim())
        .filter(text => text !== '');
    
    if (questionText === '' || options.length < 2) {
        alert('Введите текст вопроса и хотя бы два варианта ответа!');
        return;
    }
    
    const correctAnswerIndex = parseInt(correctAnswerSelect.value);
    
    const question = {
        text: questionText,
        options: options,
        correctAnswer: correctAnswerIndex
    };
    
    quiz.questions.push(question);
    renderQuestionsList();
    clearQuestionForm();
});

// Отображение списка вопросов
function renderQuestionsList() {
    questionsList.innerHTML = '';
    quiz.questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        questionDiv.innerHTML = `
            <strong>Вопрос ${index + 1}:</strong> ${question.text}<br>
            <strong>Варианты:</strong> ${question.options.join(', ')}<br>
            <strong>Правильный ответ:</strong> Вариант ${question.correctAnswer + 1}
            <button onclick="removeQuestion(${index})">Удалить</button>
        `;
        questionsList.appendChild(questionDiv);
    });
}

// Удаление вопроса
window.removeQuestion = function(index) {
    quiz.questions.splice(index, 1);
    renderQuestionsList();
};

// Очистка формы вопроса
function clearQuestionForm() {
    questionTextInput.value = '';
    optionsContainer.innerHTML = `
        <input type="text" class="option-input" placeholder="Вариант ответа 1">
        <input type="text" class="option-input" placeholder="Вариант ответа 2">
    `;
    updateCorrectAnswerOptions();
}

// Сохранение викторины
saveQuizButton.addEventListener('click', () => {
    quiz.title = quizTitleInput.value.trim() || 'Без названия';
    localStorage.setItem('currentQuiz', JSON.stringify(quiz));
    alert('Викторина сохранена!');
});

// Переключение режимов
toggleModeButton.addEventListener('click', () => {
    if (currentMode === 'builder') {
        // Переход в режим викторины
        const savedQuiz = localStorage.getItem('currentQuiz');
        if (!savedQuiz || JSON.parse(savedQuiz).questions.length === 0) {
            alert('Сначала создайте и сохраните викторину!');
            return;
        }
        
        quiz = JSON.parse(savedQuiz);
        builderSection.style.display = 'none';
        quizSection.style.display = 'block';
        toggleModeButton.textContent = 'Вернуться к конструктору';
        currentMode = 'quiz';
        startQuiz();
    } else {
        // Возврат в конструктор
        quizSection.style.display = 'none';
        builderSection.style.display = 'block';
        toggleModeButton.textContent = 'Перейти к режиму викторины';
        currentMode = 'builder';
    }
});
