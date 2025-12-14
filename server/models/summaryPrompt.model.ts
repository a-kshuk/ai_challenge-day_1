import { Model, DataTypes } from "sequelize";
import { sequelize } from "../plugins/database";

class SummaryPrompt extends Model {}

SummaryPrompt.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    message: {
      type: DataTypes.TEXT, // Строка любой длины
      allowNull: false,
    },
    chat_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "chats", // Внешняя ссылка на таблицу chats
        key: "id",
      },
      onDelete: "CASCADE", // При удалении чата удаляются и все summary prompts
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "summary_prompts",
  }
);

export default SummaryPrompt;
