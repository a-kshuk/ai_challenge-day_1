// services/chatService.ts

import Chat from "../models/chat.model";

// Союзный тип для роли
type RoleType = "user" | "system" | "assistant";

export class ChatService {
  /**
   * Добавляет новую запись в таблицу Chat
   */
  static async createChat(role: RoleType, message: string): Promise<Chat> {
    return await Chat.create({ role, message });
  }

  /**
   * Получает все записи из таблицы Chat
   */
  static async getAllChats(): Promise<Chat[]> {
    return await Chat.findAll();
  }

  /**
   * Возвращает все записи модели Chat, начиная с указанного индекса
   *
   * @param offset Индекс, с которого начинать выборку
   */
  static async getChatsFrom(offset: number): Promise<Chat[]> {
    return await Chat.findAll({
      offset: offset, // Начнем выборку с указанного индекса
      order: [["id", "ASC"]], // Порядок сортировки по возрастанию id
    });
  }

  /**
   * Получает последнюю запись из таблицы Chat
   */
  static async getLastChat(): Promise<Chat | null> {
    return await Chat.findOne({
      order: [["id", "DESC"]],
      limit: 1,
    });
  }
}
