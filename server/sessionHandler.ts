import GigaChat from "gigachat";
import { MessageRole } from "gigachat/interfaces";

interface ChatMessage {
  role: MessageRole;
  content?: string;
}

const SYSTEM_PROMPT = `Ты шеф повар ресторана. Твой ресторан получил 5 звезд Мишлен`;

// Класс-обёртка для управления сессией
export class SessionHandler {
  private readonly client: GigaChat; // Предполагается, что client уже импортирован и настроен
  public history: ChatMessage[] = [{ role: "system", content: SYSTEM_PROMPT }]; // История сообщений

  constructor(client: GigaChat) {
    this.client = client;
  }

  /**
   * Метод для отправки сообщения и добавления его в историю
   */
  public async sendMessage(message: string, temperature: 0): Promise<string> {
    this.history.push({ role: "user", content: message });

    const response = await this.client.chat({
      messages: this.history,
      temperature,
    });

    // Проверка типа ответа и обработка результата
    if (
      Array.isArray(response.choices) &&
      typeof response.choices[0]?.message === "object" &&
      "role" in response.choices[0].message &&
      "content" in response.choices[0].message
    ) {
      this.history.push(response.choices[0].message); // Добавляем ответ от системы в историю
      return response.choices[0].message.content || "Ничем помочь не могу";
    } else {
      throw new Error("Неверный формат ответа от API.");
    }
  }
}
