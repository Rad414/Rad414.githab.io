function encryptQuizData(data) {
  try {
    const jsonString = JSON.stringify(data);
    const base64String = btoa(jsonString);
    const urlSafeString = encodeURIComponent(base64String);
    return urlSafeString;
  } catch (error) {
    console.error('Ошибка шифрования данных викторины:', error);
    throw new Error('Не удалось зашифровать данные викторины');
  }
}

function decryptQuizData(encodedData) {
  try {
    if (!encodedData) return null;
    const decodedBase64 = decodeURIComponent(encodedData);
    const jsonString = atob(decodedBase64);
    const quizData = JSON.parse(jsonString);
    return quizData;
  } catch (error) {
    console.error('Ошибка расшифровки данных викторины:', error);
    return null;
  }
}
