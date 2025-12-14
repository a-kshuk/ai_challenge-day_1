import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { SessionHandler } from "./services/sessionHandler";
import gigaChatClient from "./utils/gigaChatClient";
import { logger } from "./plugins/logger";
import { sequelize } from "./plugins/database";
import Chat from "./models/chat.model";

(async function () {
  // Инициализация Express-приложения
  const app = express();

  // Применение middleware
  app.use(cors());
  app.use(bodyParser.json());

  // Инициализация менеджера сеансов
  const session = new SessionHandler(gigaChatClient);

  // Синхронизация схем базы данных (если есть другие модели, добавьте их импорты)
  await sequelize.sync();

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

  // Роут для получения всех записей из таблицы chats
  app.get("/api/history", async (req, res) => {
    try {
      // Получаем все записи из таблицы Chats
      const chats = await Chat.findAll();

      // Возвращаем полученные записи клиенту
      res.json({ result: chats });
    } catch (err: any) {
      logger.error(`Ошибка при получении записей: ${err.message}`);
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
})().catch((err) => {
  console.error("Ошибка запуска:", err);
});
