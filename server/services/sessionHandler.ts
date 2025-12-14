import GigaChat from "gigachat";
import { ChatMessage, ChatResponse } from "../types";
import { isValidChatResponse } from "../utils/isValidChatResponse";
import { sendSummaryMessage } from "./sendSummaryMessage";
import { logger } from "../plugins/logger";
import { ChatService } from "./chatService";
import { SummaryPromptService } from "./summaryPromptService";

// Класс-обертка для управления сессией общения с GigaChat
export class SessionHandler {
  private readonly client: GigaChat; // ссылка на экземпляр клиента GigaChat
  // private history: ChatMessage[] = []; // массив сообщений сессии
  private systemPrompt?: string = "Ответ должен быть четким и коротким"; // необязательное системное приветствие

  // Конструктор класса
  constructor(client: GigaChat, systemPrompt?: string) {
    this.client = client;

    // Если передан системный приветственный текст, устанавливаем его в начало истории
    if (systemPrompt) {
      this.systemPrompt = systemPrompt;
    }
  }

  private async getHistory(): Promise<ChatMessage[]> {
    const lastPrompt = await SummaryPromptService.getLastSummaryPrompt();

    const listChat = await ChatService.getChatsFrom(
      lastPrompt?.dataValues.chat_id || 0
    );

    const history: ChatMessage[] = listChat.map(({ dataValues }) => ({
      role: "user",
      content: dataValues.message,
    }));

    history.unshift(
      { role: "system", content: this.systemPrompt },
      { role: "user", content: lastPrompt?.dataValues.message }
    );

    return history.filter(({ content }) => !!content);
  }

  // Внутренняя функция обновления истории сообщений
  private async updateHistory() {
    const history = await this.getHistory();
    // фильтрация истории сообщений, удаляя служебные системные сообщения
    const filteredHistory = history.filter(({ role }) => role !== "system");

    // если сообщений меньше 10, ничего не делаем
    if (filteredHistory.length < 10) return;

    // формируем резюме последних сообщений
    const summary = await sendSummaryMessage(this.client, filteredHistory);

    // Логируем ответ от GigaChat
    logger.info(`RESPONSE: GigaChat опитимизровал запрос:`, summary);

    const lastElement = await ChatService.getLastChat();
    await SummaryPromptService.addSummaryPrompt(
      summary.message,
      lastElement?.dataValues.id || 0
    );

    // записываем новую историю с последним резюме
    return this.systemPrompt
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
    const history = (await this.updateHistory()) || [];

    // Логируем поступивший запрос
    logger.info(`REQUEST: Пользователь отправил сообщение`, {
      messages: history,
      temperature,
    });

    // Добавляем текущее сообщение пользователя в историю
    history.push({ role: "user", content: message });

    // Запрашиваем ответ у модели
    const response = await this.client.chat({
      messages: history,
      temperature, // температура определяет креативность ответа
    });

    // Логируем ответ от GigaChat
    logger.info(`RESPONSE: GigaChat ответил:`, response);

    // Проверяем корректность полученного ответа
    if (isValidChatResponse(response)) {
      await ChatService.createChat("user", message);
      await ChatService.createChat(
        "assistant",
        response.choices[0].message.content || ""
      );
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
