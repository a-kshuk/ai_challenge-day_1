import GigaChat from "gigachat";
import { MessageRole } from "gigachat/interfaces";

interface ChatMessage {
  role: MessageRole;
  content?: string;
}

interface ChatResponse {
  message: string;
  prompt_tokens: number;
  completion_tokens: number;
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
  public async sendMessage(
    message: string,
    temperature: 0
  ): Promise<ChatResponse> {
    this.history.push({ role: "user", content: message });

    const response = await this.client.chat({
      messages: [
        // { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      temperature,
      max_tokens: 100,
    });

    // Проверка типа ответа и обработка результата
    if (
      Array.isArray(response.choices) &&
      typeof response.choices[0]?.message === "object" &&
      "role" in response.choices[0].message &&
      "content" in response.choices[0].message
    ) {
      console.log({ response });
      this.history.push(response.choices[0].message); // Добавляем ответ от системы в историю
      response.usage;
      return {
        message: response.choices[0].message.content || "Ничем помочь не могу",
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
      };
    } else {
      throw new Error("Неверный формат ответа от API.");
    }
  }
}
