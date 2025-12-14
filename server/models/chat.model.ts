import { Model, DataTypes } from "sequelize";
import { sequelize } from "../plugins/database";

class Chat extends Model {}

Chat.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role: {
      type: DataTypes.ENUM("system", "user", "assistant"),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT, // Поле для хранения сообщений произвольной длины
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "chats",
  }
);

export default Chat;
