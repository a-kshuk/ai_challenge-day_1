import SummaryPrompt from "../models/summaryPrompt.model";

export class SummaryPromptService {
  /**
   * Добавляет новую запись в таблицу Summary Prompts
   *
   * @param message Сообщение prompt
   * @param chatId ID родительского чата
   */
  static async addSummaryPrompt(
    message: string,
    chatId: number
  ): Promise<SummaryPrompt> {
    return await SummaryPrompt.create({ message, chatId });
  }

  /**
   * Получает все записи из таблицы Summary Prompts
   */
  static async getAllSummaryPrompts(): Promise<SummaryPrompt[]> {
    return await SummaryPrompt.findAll();
  }

  /**
   * Получает последнюю запись из таблицы Summary Prompt
   */
  static async getLastSummaryPrompt(): Promise<SummaryPrompt | null> {
    return await SummaryPrompt.findOne({
      order: [["id", "DESC"]],
      limit: 1,
    });
  }
}
