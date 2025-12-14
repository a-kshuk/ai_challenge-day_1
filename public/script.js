document.addEventListener("DOMContentLoaded", function () {
  /**
   * Получение ссылок на элементы
   */
  const chatBox = document.querySelector("#chatbox");
  const userInput = document.querySelector("#userInput");
  const temperatureInput = document.querySelector("#temperatureInput");
  const progressBar = document.querySelector(".progress-bar");
  const progressTitle = document.querySelector("#progress-title");

  // Функция обновления статуса progress bar
  function updateProgress(outgoing = 0, incoming = 0) {
    const max = outgoing + incoming;

    progressBar.ariaValueMax = max;
    progressBar.ariaValueNow = outgoing;
    progressBar.style.width = `${(100 / max) * outgoing}%`;

    progressTitle.textContent = `Исходящие токены: ${outgoing} / Входящие токены: ${incoming}`;
  }

  /**
   * Функция отправки сообщения на сервер и отображения его в UI
   */
  async function sendMessage() {
    const messageText = userInput.value.trim();
    if (!messageText) return;

    const temperature = +temperatureInput.value || 0;
    addUserMessage(messageText);
    userInput.value = "";

    try {
      const response = await fetch("http://localhost:3000/api/gigachat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageText, temperature }),
      });

      const data = await response.json();
      if (data.result) {
        const { message, prompt_tokens, completion_tokens } = data.result;
        addBotResponse(message);
        updateProgress(prompt_tokens, completion_tokens);
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
  function addBotResponse(markdownText) {
    const text = marked.parse(markdownText);
    const botMsgDiv = document.createElement("div");
    botMsgDiv.innerHTML = text;
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
  document.querySelector("#chat-form").addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage();
  });

  (async function () {
    try {
      const response = await fetch("http://localhost:3000/api/history", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.result) {
        data.result.forEach(({ message, role }) => {
          role === "user" ? addUserMessage(message) : addBotResponse(message);
        });
      } else {
        showError("Что-то пошло не так.");
      }
    } catch (err) {
      console.log(err.message);
      showError("Возникла ошибка сети.");
    }
  })();
});
