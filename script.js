// Ключ для хранения в localStorage
const QUIZZES_KEY = 'quizzes';

// === Утилиты для работы с URL (Кодирование/Декодирование) ===

// Преобразуем объект в строку для URL (поддержка кириллицы)
function encodeQuizData(data) {
  try {
    const jsonString = JSON.stringify(data);
    // Используем трюк с encodeURIComponent для корректной работы с кириллицей в base64
    return btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
  } catch (e) {
    console.error("Ошибка кодирования:", e);
    return null;
  }
}

// Преобразуем строку из URL обратно в объект
function decodeQuizData(encodedString) {
  try {
    const jsonString = decodeURIComponent(atob(encodedString).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Ошибка декодирования:", e);
    return null;
  }
}

// === Страница создания (Creator) ===

function initCreator() {
  const addBtn = document.getElementById('add-question');
  const saveBtn = document.getElementById('save-quiz');
  const shareBtn = document.getElementById('share-quiz');
  const container = document.getElementById('questions-container');
  const modal = document.getElementById('share-modal');
  const closeModal = document.getElementById('close-modal');
  const copyBtn = document.getElementById('copy-link-btn');
  const shareInput = document.getElementById('share-link-input');

  // Добавление вопроса
  addBtn.addEventListener('click', () => {
    addQuestionBlock(container);
    updateQuestionCount();
    shareBtn.disabled = true; // Ссылка невалидна, если меняем контент
  });

  // Сохранение в LocalStorage
  saveBtn.addEventListener('click', () => {
    const quiz = collectQuizData();
    if (!validateQuiz(quiz)) return;

    saveToLocalStorage(quiz);
    alert('✅ Викторина сохранена в браузере!');
    shareBtn.disabled = false; // Теперь можно делиться
  });

  // Генерация ссылки для шаринга
  shareBtn.addEventListener('click', () => {
    const quiz = collectQuizData();
    if (!validateQuiz(quiz)) return;

    const encoded = encodeQuizData(quiz);
    if (encoded) {
      // Формируем ссылку относительно текущего сайта
      const url = `${window.location.origin}${window.location.pathname.replace('creator.html', 'quiz.html')}?data=${encoded}`;
      
      shareInput.value = url;
      modal.classList.add('active');
    }
  });

  // Закрытие модалки
  closeModal.addEventListener('click', () => modal.classList.remove('active'));
  
  // Копирование ссылки
  copyBtn.addEventListener('click', () => {
    shareInput.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Скопировано!';
    setTimeout(() => copyBtn.textContent = 'Копировать', 2000);
  });
}

// Добавление блока вопроса в DOM
function addQuestionBlock(container) {
  const questionDiv = document.createElement('div');
  questionDiv.className = 'question-form';
  const questionIndex = document.querySelectorAll('.question-form').length + 1;
  const uniqueId = Date.now(); // Уникальный ID для радио-кнопок

  questionDiv.innerHTML = `
    <div class="question-header">
      <h4>Вопрос ${questionIndex}</h4>
      <button type="button" class="btn-text delete-btn" style="color: #ff4444;">✕</button>
    </div>
    <input type="text" class="question-text" placeholder="Текст вопроса" required>
    <div class="answers-container">
      <div class="answer-row">
        <input type="text" class="answer-text" placeholder="Вариант 1" required>
        <input type="radio" name="correct-${uniqueId}" value="0" checked>
      </div>
      <div class="answer-row">
        <input type="text" class="answer-text" placeholder="Вариант 2" required>
        <input type="radio" name="correct-${uniqueId}" value="1">
      </div>
      <div class="answer-row">
        <input type="text" class="answer-text" placeholder="Вариант 3">
        <input type="radio" name="correct-${uniqueId}" value="2">
      </div>
      <div class="answer-row">
        <input type="text" class="answer-text" placeholder="Вариант 4">
        <input type="radio" name="correct-${uniqueId}" value="3">
      </div>
    </div>
  `;

  container.appendChild(questionDiv);

  // Обработчик удаления
  questionDiv.querySelector('.delete-btn').addEventListener('click', () => {
    questionDiv.remove();
    updateQuestionNumbers();
    updateQuestionCount();
  });
}

function updateQuestionNumbers() {
  document.querySelectorAll('.question-form').forEach((q, index) => {
    q.querySelector('h4').textContent = `Вопрос ${index + 1}`;
  });
}

function updateQuestionCount() {
  const count = document.querySelectorAll('.question-form').length;
  document.getElementById('question-count').textContent = `${count} вопросов`;
}

function collectQuizData() {
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const topic = document.getElementById('topic').value.trim();
  
  const questions = [];
  document.querySelectorAll('.question-form').forEach(q => {
    const qText = q.querySelector('.question-text').value.trim();
    const answers = [];
    q.querySelectorAll('.answer-text').forEach(a => answers.push(a.value.trim()));
    
    const correctIndex = parseInt(q.querySelector('.correct-radio:checked')?.value || q.querySelector('input[type="radio"]').value);
    
    questions.push({
      question: qText,
      answers: answers,
      correct: correctIndex
    });
  });

  return { title, description, topic, questions };
}

function validateQuiz(quiz) {
  if (!quiz.title || !quiz.topic) {
    alert('Заполните название и тему!');
    return false;
  }
  if (quiz.questions.length === 0) {
    alert('Добавьте хотя бы один вопрос!');
    return false;
  }
  // Простая валидация на пустые ответы
  for (let q of quiz.questions) {
    if (!q.question || q.answers.some(a => !a)) {
      alert('Заполните вопросы и варианты ответов полностью.');
      return false;
    }
  }
  return true;
}

function saveToLocalStorage(quiz) {
  quiz.id = Date.now().toString();
  let quizzes = JSON.parse(localStorage.getItem(QUIZZES_KEY) || '[]');
  quizzes.push(quiz);
  localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
}


// === Страница прохождения (Quiz) ===

function initQuiz() {
  const urlParams = new URLSearchParams(window.location.search);
  const sharedData = urlParams.get('data');
  const select = document.getElementById('quiz-select');
  const selectionArea = document.getElementById('selection-area');
  const quizContent = document.getElementById('quiz-content');
  const resultArea = document.getElementById('result-area');

  // 1. Если есть data в URL -> Грузим сразу
  if (sharedData) {
    const quiz = decodeQuizData(sharedData);
    if (quiz) {
      selectionArea.style.display = 'none'; // Скрываем выбор
      renderQuiz(quiz);
    } else {
      alert('Ссылка повреждена или устарела.');
      window.location.href = 'index.html';
    }
  } else {
    // 2. Иначе -> Показываем список из LocalStorage
    loadSavedQuizzes(select);
  }

  // Логика выбора из списка
  select.addEventListener('change', (e) => {
    if (!e.target.value) {
      quizContent.classList.add('hidden');
      resultArea.classList.add('hidden');
      return;
    }
    
    const quizzes = JSON.parse(localStorage.getItem(QUIZZES_KEY) || '[]');
    const quiz = quizzes.find(q => q.id === e.target.value);
    if (quiz) {
      renderQuiz(quiz);
      resultArea.classList.add('hidden');
      quizContent.classList.remove('hidden');
    }
  });

  // Отправка формы
  document.getElementById('quiz-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const quiz = window.currentQuiz; // Сохраняем в глобальную переменную при рендере
    let correctCount = 0;
    
    quiz.questions.forEach((q, index) => {
      const selected = document.querySelector(`input[name="q${index}"]:checked`);
      if (selected && parseInt(selected.value) === q.correct) {
        correctCount++;
      }
    });

    showResult(correctCount, quiz.questions.length);
  });

  // Перезапуск
  document.getElementById('restart-quiz').addEventListener('click', () => {
    if (sharedData) {
      // Если был по ссылке - перезагружаем страницу, чтобы сбросить
      window.location.reload();
    } else {
      // Если был выбор - сбрасываем форму
      document.getElementById('quiz-form').reset();
      resultArea.classList.add('hidden');
      quizContent.classList.remove('hidden');
    }
  });
}

function loadSavedQuizzes(selectElement) {
  const quizzes = JSON.parse(localStorage.getItem(QUIZZES_KEY) || '[]');
  if (quizzes.length === 0) {
    const option = document.createElement('option');
    option.textContent = 'Нет сохранённых викторин';
    selectElement.appendChild(option);
    return;
  }
  
  quizzes.forEach(q => {
    const option = document.createElement('option');
    option.value = q.id;
    option.textContent = `${q.title} (${q.topic})`;
    selectElement.appendChild(option);
  });
}

function renderQuiz(quiz) {
  window.currentQuiz = quiz; // Сохраняем для проверки
  document.getElementById('quiz-title').textContent = quiz.title;
  document.getElementById('quiz-description').textContent = quiz.description;
  document.getElementById('quiz-topic').textContent = quiz.topic;

  const form = document.getElementById('quiz-form');
  form.innerHTML = '';

  const fragment = document.createDocumentFragment();
  
  quiz.questions.forEach((q, index) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'question-card';
    
    let answersHtml = '';
    q.answers.forEach((ans, i) => {
      answersHtml += `
        <label class="option-label">
          <input type="radio" name="q${index}" value="${i}">
          <span>${ans}</span>
        </label>
      `;
    });

    qDiv.innerHTML = `
      <h3>${index + 1}. ${q.question}</h3>
      <div class="options-list">${answersHtml}</div>
    `;
    fragment.appendChild(qDiv);
  });
  
  form.appendChild(fragment);
  document.getElementById('submit-quiz').classList.remove('hidden');
}

function showResult(correct, total) {
  const percent = Math.round((correct / total) * 100);
  document.getElementById('quiz-content').classList.add('hidden');
  document.getElementById('result-area').classList.remove('hidden');
  document.getElementById('score-percent').textContent = `${percent}%`;
  document.getElementById('score-text').textContent = `Вы ответили правильно на ${correct} из ${total} вопросов.`;
}


// === Инициализация ===

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('questions-container')) {
    initCreator();
  } else if (document.getElementById('quiz-viewer')) {
    initQuiz();
  }
});
