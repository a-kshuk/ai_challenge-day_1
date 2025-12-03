import GigaChat from "gigachat";

// Типы для сообщений и ответов
type MessageRole = "user" | "system";
interface ChatMessage {
  role: MessageRole;
  content: string;
}

interface ChatResponseChoice {
  message: ChatMessage;
}

interface ChatResponse {
  choices: ChatResponseChoice[];
}

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

// Класс-обёртка для управления сессией
export class SessionHandler {
  private readonly client: any; // Предполагается, что client уже импортирован и настроен
  private history: ChatMessage[] = [{ role: "system", content: SYSTEM_PROMPT }]; // История сообщений

  constructor(client: GigaChat) {
    this.client = client;
  }

  /**
   * Метод для отправки сообщения и добавления его в историю
   */
  public async sendMessage(message: string): Promise<string> {
    this.history.push({ role: "user", content: message });

    const response = await this.client.chat({
      messages: this.history,
    });

    // Проверка типа ответа и обработка результата
    if (
      Array.isArray(response.choices) &&
      typeof response.choices[0]?.message === "object" &&
      "role" in response.choices[0].message &&
      "content" in response.choices[0].message
    ) {
      this.history.push(response.choices[0].message); // Добавляем ответ от системы в историю
      return response.choices[0].message.content;
    } else {
      throw new Error("Неверный формат ответа от API.");
    }
  }
}
