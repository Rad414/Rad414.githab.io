// Ключ для хранения викторин (теперь не используется, но оставляем для совместимости)
const QUIZZES_KEY = 'quizzes';

// Функция инициализации страницы создания викторины
function initCreator() {
  const addBtn = document.getElementById('add-question');
  const saveBtn = document.getElementById('save-quiz');
  const container = document.getElementById('questions-container');

  if (!addBtn || !saveBtn) return;

  // Обработчик добавления вопроса
  addBtn.addEventListener('click', () => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-form';
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
    let hasError = false;
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

    // Создаём объект викторины
    const quiz = {
      id: Date.now().toString(),
      title,
      description,
      topic,
      questions
    };

    try {
      // Шифруем данные и формируем URL
      const encryptedData = encryptQuizData(quiz);
      const currentUrl = window.location.origin + window.location.pathname.replace('creator.html', 'quiz.html');
      const quizUrl = `${currentUrl}?quiz=${encryptedData}`;

      // Показываем ссылку пользователю
      displayShareLink(quizUrl);
    } catch (e) {
      alert('Ошибка сохранения: ' + e.message);
    }
  });
}

// Функция отображения ссылки для пользователя
function displayShareLink(url) {
  const linkContainer = document.getElementById('share-link-container');
  linkContainer.innerHTML = `
    <p>Ваша викторина сохранена! Поделитесь этой ссылкой:</p>
    <input type="text" value="${url}" readonly>
    <button onclick="copyToClipboard('${url}')">Копировать ссылку</button>
  `;
}

// Функция копирования в буфер обмена
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Ссылка скопирована в буфер обмена!');
  }).catch(err => {
    console.error('Ошибка копирования:', err);
  });
}

// Функция инициализации страницы прохождения викторины
function initQuiz() {
  const content = document.getElementById('quiz-content');
  const result = document.getElementById('result');
  const submitBtn = document.getElementById('submit-quiz');
  const restartBtn = document.getElementById('restart-quiz');
  const form = document.getElementById('quiz-form');

  if (!content || !result || !submitBtn || !restartBtn || !form) return;

  // Проверяем, есть ли данные викторины в URL
  const urlParams = new URLSearchParams(window.location.search);
  const encryptedQuiz = urlParams.get('quiz');

  if (encryptedQuiz) {
    const quizData = decryptQuizData(encryptedQuiz);
    if (quizData) {
      renderQuizForAttempt(quizData);
    } else {
      alert('Не удалось загрузить викторину. Проверьте ссылку.');
    }
  } else {
    alert('Викторина не найдена. Убедитесь, что ссылка верна.');
  }
}

// Отрисовка викторины для прохождения
function renderQuizForAttempt(quizData) {
  const quizContent = document.getElementById('quiz-content');
  quizContent.innerHTML = `
    <h2>${quizData.title}</h2>
    <p><strong>Тема:</strong> ${quizData.topic}</p>
    ${quizData.description ? `<p><strong>Описание:</strong> ${quizData.description}</p>` : ''}
    <form id="quiz-form">
      ${quizData.questions.map((q, index) => `
        <div class="quiz-question">
          <h3>Вопрос ${index + 1}:</h3>
          <p>${q.question}</p>
          ${q.answers.map((answer, ansIndex) => `
            <div>
              <input type="radio" name="q${index}" value="${ansIndex}" id="q${index}-a${ansIndex}" required>
              <label for="q${index}-a${ansIndex}">${answer}</label>
            </div>
          `).join('')}
        </div>
      `).join('')}
      <button type="button" id="submit-quiz">
