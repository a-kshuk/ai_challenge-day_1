// gigaChatClient.ts
import { GigaChat } from "gigachat";
import { Agent } from "node:https";
import dotenv from "dotenv";

// Загрузка переменных среды
dotenv.config();

// Проверка наличия API-токена
const API_TOKEN = process.env.GIGACHAT_API_TOKEN;
if (!API_TOKEN) {
  throw new Error(
    "Переменная окружения GIGACHAT_API_TOKEN должна быть задана!"
  );
}

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

// Экспорт готового клиента
export default gigaChatClient;
