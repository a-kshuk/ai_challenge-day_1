import { Sequelize } from "sequelize";

// Создаем экземпляр Sequelize с базой данных в памяти (:memory:)
export const sequelize = new Sequelize("sqlite::memory:");
