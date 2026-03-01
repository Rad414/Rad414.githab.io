// Функция инициализации страницы создания викторины
function initCreator() {
  const addBtn = document.getElementById('add-question');
  const saveBtn = document.getElementById('save-quiz');
  const container = document.getElementById('questions-container');

  if (!addBtn || !saveBtn || !container) {
    console.error('Не найдены необходимые элементы DOM');
    return;
  }

  // Обработчик добавления вопроса
  addBtn.addEventListener('click', () => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-form';
    const uniqueId = Date.now();

    questionDiv.innerHTML = `
      <h3>Вопрос</h3>
      <input type="text" class="question-text" placeholder="Введите вопрос..." required>
      <div>
        <input type="text" class="answer-text" placeholder="Вариант ответа 1" required>
        <input type="radio" name="correct-${uniqueId}" class="correct-radio" value="0">
        <label>Правильный</label>
      </div>
      <div>
        <input type="text" class="answer-text" placeholder="Вариант ответа 2" required>
        <input type="radio" name="correct-${uniqueId}" class="correct-radio" value="1">
        <label>Правильный</label>
      </div>
      <button type="button" class="delete-btn">Удалить вопрос</button>
    `;

    container.appendChild(questionDiv);

    // Обработчик удаления вопроса
    const deleteBtn = questionDiv.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
      questionDiv.remove();
    });
  });

  // Обработчик сохранения викторины
  saveBtn.addEventListener('click', () => {
    const title = document.getElementById('title').value.trim();
    const topic = document.getElementById('topic').value.trim();

    if (!title || !topic) {
      alert('Пожалуйста, заполните название и тему викторины!');
      return;
    }

    const questions = [];
    document.querySelectorAll('.question-form').forEach(q => {
      const qText = q.querySelector('.question-text').value.trim();
      const answers = Array.from(q.querySelectorAll('.answer-text'))
        .map(input => input.value.trim());
      const correctIndex = parseInt(q.querySelector('.correct-radio:checked')?.value || -1);

      if (qText && answers.every(a => a) && correctIndex !== -1) {
        questions.push({
          question: qText,
          answers: answers,
          correct: correctIndex
        });
      }
    });

    if (questions.length === 0) {
      alert('Добавьте хотя бы один вопрос с заполненными полями!');
      return;
    }

    // Создаём объект викторины
    const quiz = {
      id: Date.now().toString(),
      title: title,
      topic: topic,
      questions: questions
    };

    // Сохраняем в localStorage
    localStorage.setItem('currentQuiz', JSON.stringify(quiz));

    // Формируем ссылку для прохождения с данными викторины
    try {
      const encryptedData = btoa(encodeURIComponent(JSON.stringify(quiz)));
      const quizUrl = `${window.location.origin}${window.location.pathname.replace('creator.html', 'quiz.html')}?quiz=${encryptedData}`;


      // Показываем ссылку пользователю
      const linkContainer = document.getElementById('share-link-container');
      if (linkContainer) {
        linkContainer.innerHTML = `
          <p>Викторина сохранена! Поделитесь этой ссылкой:</p>
          <input type="text" value="${quizUrl}" readonly style="width: 100%; padding: 8px; margin: 5px 0;">
          <button onclick="copyToClipboard('${quizUrl}')" class="btn">Копировать ссылку</button>
        `;
      } else {
        console.warn('Элемент #share-link-container не найден');
        alert(`Викторина сохранена! Ссылка: ${quizUrl}`);
      }
    } catch (error) {
      console.error('Ошибка при создании ссылки:', error);
      alert('Не удалось создать ссылку. Викторина сохранена в браузере.');
    }
  });
}

// Функция копирования в буфер обмена
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Ссылка скопирована в буфер обмена!');
  }).catch(err => {
    console.error('Ошибка копирования:', err);
    // Резервный вариант для старых браузеров
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('Ссылка скопирована (через резервный метод)');
  });
}

// Инициализируем при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  if (document.title.includes('Создать')) {
    initCreator();
  }
});
