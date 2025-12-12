// Вспомогательная функция для проверки валидности ответа
export function isValidChatResponse(response: any): boolean {
  return (
    Array.isArray(response.choices) &&
    typeof response.choices[0]?.message === "object" &&
    "role" in response.choices[0].message &&
    "content" in response.choices[0].message
  );
}
