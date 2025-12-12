import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { SessionHandler } from "./services/sessionHandler";
import gigaChatClient from "./utils/gigaChatClient"; // Подключаем созданный клиент
import { logger } from "./utils/logger"; // Подключаем логгер

// Инициализация Express-приложения
const app = express();

// Использование middleware
app.use(cors());
app.use(bodyParser.json());

// Инициализация менеджера сеанса
const session = new SessionHandler(gigaChatClient);

// Маршрут для взаимодействия с GigaChat
app.post("/api/gigachat", async (req, res) => {
  try {
    const { message, temperature } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Сообщение отсутствует" });
    }

    // Отправляем запрос в GigaChat
    const response = await session.sendMessage(message, temperature);

    // Возвращаем ответ клиенту
    res.json({ result: response });
  } catch (err: any) {
    logger.error(`ERROR: ${err.message}`); // Логируем ошибки
    res.status(500).json({ error: err.message });
  }
});

// Точка входа для проверки доступности сервера
app.get("/", (_req, res) => {
  res.send("Server is running!");
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
