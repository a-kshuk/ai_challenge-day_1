import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { GigaChat } from "gigachat";
import { Agent } from "node:https";
import { SessionHandler } from "./sessionHandler";

// Загрузка переменных среды
dotenv.config();

// Настройка порта
const PORT = process.env.PORT || 3000;

// Проверяем наличие API-токена
const API_TOKEN = process.env.GIGACHAT_API_TOKEN;
if (!API_TOKEN) {
  throw new Error(
    "Переменная окружения GIGACHAT_API_TOKEN должна быть задана!"
  );
}

// Инициализация Express-приложения
const app = express();

// Использование middleware
app.use(cors());
app.use(bodyParser.json());

// Агент для HTTPS-запросов
const httpsAgent = new Agent({
  rejectUnauthorized: false, // Отключаем проверку сертификатов
});

// Создание клиента GigaChat
const gigaChatClient = new GigaChat({
  timeout: 600,
  credentials: API_TOKEN,
  scope: "GIGACHAT_API_PERS",
  model: "GigaChat",
  httpsAgent: httpsAgent,
});

let SESSION_ID = "96c8ae06-d121-49e3-8894-795370653207"; // Уникальный идентификатор сессии

const SYSTEM_PROMPT = `Ты Максим Александрович - Менеджер по продажам автомобилей с пробегом. Твой стаж более 10 лет.

Твоя задача через диалог собрать всю необходимую информацию.

1. Тип кузова автомобиля
2. Год выпуска
3. Марка
4. Цвет
5. Бюджет в рублях

Когда ответ получен выведи информацию о доступных автомобилях.

Если пользователь пишет пишет запрос на другую тему - отвечай ему что ты разбираешься только в автомобилях.
`;

const session = new SessionHandler(gigaChatClient);

// Маршрут для взаимодействия с GigaChat
app.post("/api/gigachat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message) {
      return res.status(400).json({ error: "Сообщение отсутствует" });
    }

    // Отправляем запрос в GigaChat
    const response = await session.sendMessage(message);

    // Возвращаем ответ клиенту
    res.json({ result: response });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Простая точка входа для проверки работоспособности сервера
app.get("/", (_req, res) => {
  res.send("Server is running!");
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
