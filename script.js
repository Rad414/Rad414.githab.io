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
    questionDiv.className = 'question-form'; // Исправлено: соответствует CSS
    const uniqueId = Date.now();
    questionDiv.innerHTML = `
      <fieldset>
        <input type="text" class="question-text" placeholder="Введите вопрос..." required>
        <div style="margin-top: 15px;">
          <input type="text" class="answer-text" placeholder="Вариант 1" required>
          <input type="radio" name="correct-${uniqueId}" class="correct-radio" value="0" aria-label="Правильный ответ 1">
          <label>Правильный</label>
        </div>
        <div style="margin-top: 10px;">
          <input type="text" class="answer-text" placeholder="Вариант 2" required>
          <input type="radio" name="correct-${uniqueId}" class="correct-radio" value="1" aria-label="Правильный ответ 2">
          <label>Правильный</label>
        </div>
        <div style="margin-top: 10px;">
          <input type="text" class="answer-text" placeholder="Вариант 3" required>
          <input type="radio" name="correct-${uniqueId}" class="correct-radio" value="2" aria-label="Правильный ответ 3">
          <label>Правильный</label>
        </div>
        <div style="margin-top: 10px;">
          <input type="text" class="answer-text" placeholder="Вариант 4" required>
          <input type="radio" name="correct-${uniqueId}" class="correct-radio" value="3" aria-label="Правильный ответ 4">
          <label>Правильный</label>
        </div>
        <button type="button" class="btn btn-secondary" style="margin-top: 15px; padding: 6px 12px; font-size: 0.9rem;">❌ Удалить вопрос</button>
      </fieldset>
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
    let hasError = false; // Флаг для полной остановки
    document.querySelectorAll('.question-form').forEach(q => {
      const qText = q.querySelector('.question-text').value.trim();
      if (!qText) {
        alert('Заполните текст вопроса!');
        hasError = true;
        return;
      }

      const answers = [];
      q.querySelectorAll('.answer-text').forEach((a) => {
        answers.push(a.value.trim());
      });

      if (answers.some(a => !a)) {
        alert('Заполните все варианты ответов для вопроса: ' + qText);
        hasError = true;
        return;
      }

      const correctIndex = parseInt(q.querySelector('.correct-radio:checked')?.value || -1);
      if (correctIndex === -1) {
        alert('Выберите правильный ответ для вопроса: ' + qText);
        hasError = true;
        return;
      }

      questions.push({
        question: qText,
        answers: answers,
        correct: correctIndex
      });
    });

    if (hasError || questions.length === 0) {
      if (questions.length === 0) alert('Добавьте хотя бы один вопрос!');
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
  const form = document.getElementById('quiz-form');

  if (!select || !content || !result || !submitBtn || !restartBtn || !form) return;

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
  select.addEventListener('change', () =>