import GigaChat from "gigachat";
import { ChatMessage, ChatResponse } from "../types";
import { isValidChatResponse } from "../utils/isValidChatResponse";
import { sendSummaryMessage } from "./sendSummaryMessage";
import { logger } from "../utils/logger";

// Класс-обертка для управления сессией общения с GigaChat
export class SessionHandler {
  private readonly client: GigaChat; // ссылка на экземпляр клиента GigaChat
  private history: ChatMessage[] = []; // массив сообщений сессии
  private systemPrompt?: string = "Ответ должен быть четким и коротким"; // необязательное системное приветствие

  // Конструктор класса
  constructor(client: GigaChat, systemPrompt?: string) {
    this.client = client;

    // Если передан системный приветственный текст, устанавливаем его в начало истории
    if (systemPrompt) {
      this.systemPrompt = systemPrompt;
    }
    this.history = [{ role: "system", content: systemPrompt }]; // начинаем историю с приветствия
  }

  // Внутренняя функция обновления истории сообщений
  private async updateHistory() {
    // фильтрация истории сообщений, удаляя служебные системные сообщения
    const filteredHistory = this.history.filter(
      ({ role }) => role !== "system"
    );

    // если сообщений меньше 5, ничего не делаем
    if (filteredHistory.length < 5) return;

    // формируем резюме последних сообщений
    const summary = await sendSummaryMessage(this.client, filteredHistory);

    // Логируем ответ от GigaChat
    logger.info(`RESPONSE: GigaChat опитимизровал запрос:`, summary);

    // записываем новую историю с последним резюме
    this.history = this.systemPrompt
      ? [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: summary.message },
        ] // сначала система, потом последнее резюме
      : [{ role: "user", content: summary.message }]; // только резюме, если нет system-prompt
  }

  // Главный метод отправки сообщения и обработки ответа
  public async sendMessage(
    message: string,
    temperature: number = 0
  ): Promise<ChatResponse> {
    // Обновляем историю сообщений, если она стала большой
    await this.updateHistory();

    // Логируем поступивший запрос
    logger.info(`REQUEST: Пользователь отправил сообщение`, {
      messages: this.history,
      temperature,
    });

    // Добавляем текущее сообщение пользователя в историю
    this.history.push({ role: "user", content: message });

    // Запрашиваем ответ у модели
    const response = await this.client.chat({
      messages: this.history,
      temperature, // температура определяет креативность ответа
    });

    // Логируем ответ от GigaChat
    logger.info(`RESPONSE: GigaChat ответил:`, response);

    // Проверяем корректность полученного ответа
    if (isValidChatResponse(response)) {
      return {
        message: response.choices[0].message.content || "Нечего сказать.", // ответ модели
        prompt_tokens: response.usage.prompt_tokens, // токены в запросе
        completion_tokens: response.usage.completion_tokens, // токены в ответе
      };
    } else {
      throw new Error("Неправильный формат ответа от API"); // ошибка, если ответ некорректен
    }
  }
}
