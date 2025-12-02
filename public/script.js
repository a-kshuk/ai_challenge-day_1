document.addEventListener("DOMContentLoaded", function () {
  const chatBox = document.querySelector("#chatbox");
  const userInput = document.querySelector("#userInput");

  /**
   * Функция отправки сообщения на сервер и отображения его в UI
   */
  async function sendMessage() {
    const messageText = userInput.value.trim();
    if (!messageText) return;

    addUserMessage(messageText);
    userInput.value = "";

    try {
      const response = await fetch("http://localhost:3000/api/gigachat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await response.json();
      if (data.result) {
        addBotResponse(data.result);
      } else {
        showError("Что-то пошло не так.");
      }
    } catch (err) {
      showError("Возникла ошибка сети.");
    }
  }

  /**
   * Показываем сообщение пользователя
   */
  function addUserMessage(text) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "user-message";
    msgDiv.textContent = text;
    chatBox.insertBefore(msgDiv, chatBox.firstChild);
    scrollToBottom();
  }

  /**
   * Показываем ответ бота
   */
  function addBotResponse(text) {
    const botMsgDiv = document.createElement("div");
    botMsgDiv.textContent = text;
    chatBox.insertBefore(botMsgDiv, chatBox.firstChild);
    scrollToBottom();
  }

  /**
   * Прокрутка окна чата в самый низ
   */
  function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  /**
   * Сообщение об ошибке
   */
  function showError(text) {
    alert(text);
  }

  // Присоединяем обработчик к форме
  document.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage();
  });
});
