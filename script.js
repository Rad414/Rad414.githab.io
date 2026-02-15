// Ключ для хранения викторин в localStorage
const QUIZZES_KEY = 'quizzes';

// Функция для инициализации страницы создания викторины
function initCreator() {
  const addBtn = document.getElementById('add-question');
  const saveBtn = document.getElementById('save-quiz');
  const container = document.getElementById('questions-container');

  if (!addBtn || !saveBtn) return;

  // Обработчик добавления вопроса
  addBtn.addEventListener('click', () => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.innerHTML = `
      <input type="text" class="question-text" placeholder="Введите вопрос..." required>
      <div style="margin-top: 15px;">
        <input type="text" class="answer-text" placeholder="Вариант 1" required>
        <input type="radio" name="correct-${Date.now()}" class="correct-radio" value="0" aria-label="Правильный ответ 1">
        <label>Правильный</label>
      </div>
      <div style="margin-top: 10px;">
        <input type="text" class="answer-text" placeholder="Вариант 2" required>
        <input type="radio" name="correct-${Date.now()}" class="correct-radio" value="1" aria-label="Правильный ответ 2">
        <label>Правильный</label>
      </div>
      <div style="margin-top: 10px;">
        <input type="text" class="answer-text" placeholder="Вариант 3" required>
        <input type="radio" name="correct-${Date.now()}" class="correct-radio" value="2" aria-label="Правильный ответ 3">
        <label>Правильный</label>
      </div>
      <div style="margin-top: 10px;">
        <input type="text" class="answer-text" placeholder="Вариант 4" required>
        <input type="radio" name="correct-${Date.now()}" class="correct-radio" value="3" aria-label="Правильный ответ 4">
        <label>Правильный</label>
      </div>
      <button type="button" class="btn btn-secondary" style="margin-top: 15px; padding: 6px 12px; font-size: 0.9rem;">❌ Удалить вопрос</button>
    `;
    container.appendChild(questionDiv);

    // Обработчик удаления вопроса
    const deleteBtn = questionDiv.querySelector('button');
    deleteBtn.addEventListener('click', () => {
      questionDiv.remove();
    });
  });

  // Обработчик сохранения викторины
  saveBtn.addEventListener('click', () => {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const topic = document.getElementById('topic').value.trim();

    if (!title || !topic) {
      alert('Пожалуйста, укажите название и тему викторины!');
      return;
    }

    const questions = [];
    document.querySelectorAll('.question').forEach(q => {
      const qText = q.querySelector('.question-text').value.trim();
      if (!qText) return;

      const answers = [];
      q.querySelectorAll('.answer-text').forEach((a) => {
        answers.push(a.value.trim());
      });

      // Проверка на заполненность всех ответов
      if (answers.some(a => !a)) {
        alert('Заполните все варианты ответов для вопроса: ' + qText);
        return;
      }

      const correctIndex = parseInt(q.querySelector('.correct-radio:checked')?.value || -1);
      if (correctIndex === -1) {
        alert('Выберите правильный ответ для вопроса: ' + qText);
        return;
      }

      questions.push({
        question: qText,
        answers: answers,
        correct: correctIndex
      });
    });

    if (questions.length === 0) {
      alert('Добавьте хотя бы один вопрос!');
      return;
    }

    const quiz = {
      id: Date.now().toString(),
      title,
      description,
      topic,
      questions
    };

    try {
      let quizzes = JSON.parse(localStorage.getItem(QUIZZES_KEY) || '[]');
      quizzes.push(quiz);
      localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
      alert('✅ Викторина сохранена! Теперь вы можете пройти её на главной странице.');
      window.location.href = 'index.html';
    } catch (e) {
      alert('Ошибка сохранения: ' + e.message);
    }
  });
}

// Функция для инициализации страницы прохождения викторины
function initQuiz() {
  const select = document.getElementById('quiz-select');
  const content = document.getElementById('quiz-content');
  const result = document.getElementById('result');
  const submitBtn = document.getElementById('submit-quiz');
  const restartBtn = document.getElementById('restart-quiz');

  if (!select || !content || !result || !submitBtn || !restartBtn) return;

  // Загрузка списка викторин
  let quizzes = [];
  try {
    quizzes = JSON.parse(localStorage.getItem(QUIZZES_KEY) || '[]');
  } catch (e) {
    alert('Ошибка загрузки данных: ' + e.message);
    return;
  }

  quizzes.forEach(q => {
    const option = document.createElement('option');
    option.value = q.id;
    option.textContent = q.title;
    select.appendChild(option);
  });

  // Обработчик выбора викторины
  select.addEventListener('change', () => {
    if (!select.value) {
      content.style.display = 'none';
      result.style.display = 'none';
      return;
    }

    const quiz = quizzes.find(q => q.id === select.value);
    if (!quiz) return;

    document.getElementById('quiz-title').textContent = quiz.title;
    document.getElementById('quiz-description').textContent = quiz.description;
    document.getElementById('quiz-topic').textContent = quiz.topic;

    const questionsContainer = document.getElementById('questions');
    questionsContainer.innerHTML = '';

    // Использование DocumentFragment для производительности
    const fragment = document.createDocumentFragment();
    quiz.questions.forEach((q, index) => {
      const qDiv = document.createElement('div');
      qDiv.className = 'question';
      qDiv.innerHTML = `
        <h3>${index + 1}. ${q.question}</h3>
        ${q.answers.map((ans, i) => `
          <label class="answer">
            <input type="radio" name="q${index}" value="${i}" required aria-label="Вариант ${i + 1}">
            ${ans}
          </label>
        `).join('')}
      `;
      fragment.appendChild(qDiv);
    });
    questionsContainer.appendChild(fragment);

    content.style.display = 'block';
    result.style.display = 'none';
  });

  // Обработчик отправки ответов
  submitBtn.addEventListener('click', () => {
    const quizId = select.value;
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;

    // Проверка на все отвеченные вопросы
    const allAnswered = quiz.questions.every((_, index) => document.querySelector(`input[name="q${index}"]:checked`));
    if (!allAnswered) {
      alert('Ответьте на все вопросы!');
      return;
    }

    let correctCount = 0;
    quiz.questions.forEach((q, index) => {
      const selected = document.querySelector(`input[name="q${index}"]:checked`);
      if (selected && parseInt(selected.value) === q.correct) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    document.getElementById('score').textContent = `Вы ответили правильно на ${correctCount} из ${quiz.questions.length} вопросов (${score}%)`;

    content.style.display = 'none';
    result.style.display = 'block';
  });

  // Обработчик перезапуска
  restartBtn.addEventListener('click', () => {
    select.value = '';
    content.style.display = 'none';
    result.style.display = 'none';
  });
}

// Инициализация в зависимости от страницы
if (window.location.pathname.includes('creator.html')) {
  initCreator();
} else if (window.location.pathname.includes('quiz.html')) {
  initQuiz();
        }
