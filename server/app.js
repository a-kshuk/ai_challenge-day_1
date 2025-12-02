require("dotenv").config(); // Загружаем переменные окружения из .env

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { GigaChat } = require("gigachat");
const { Agent } = require("node:https");

// Настройка порта
const PORT = process.env.PORT || 3000;

// Токен берем из переменных окружения
const API_TOKEN = process.env.GIGACHAT_API_TOKEN;

if (!API_TOKEN)
  throw new Error(
    "Переменная окружения GIGACHAT_API_TOKEN должна быть задана!"
  );

// Инициализация Express-приложения
const app = express();

// Применение middleware
app.use(cors());
app.use(bodyParser.json());

const httpsAgent = new Agent({
  rejectUnauthorized: false, // Отключает проверку корневого сертификата
});

// Создаем клиента GigaChat
const gigaChatClient = new GigaChat({
  timeout: 600,
  credentials: API_TOKEN,
  scope: "GIGACHAT_API_PERS",
  model: "GigaChat",
  httpsAgent: httpsAgent,
});

// Обработчик POST-запроса для общения с GigaChat
app.post("/api/gigachat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message)
      return res.status(400).json({ error: "Сообщение отсутствует" });

    // Отправляем запрос в GigaChat
    const response = await gigaChatClient.chat({
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    // Возвращаем ответ клиенту
    res.json({ result: response.choices[0]?.message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
