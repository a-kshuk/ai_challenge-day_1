import { createLogger, format, transports } from "winston";

// Настройка уровня логирования и форматов
export const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()), // формат JSON с отметкой времени
  transports: [
    new transports.File({ filename: "./logs/requests.txt" }), // Логирование в файл
  ],
});
