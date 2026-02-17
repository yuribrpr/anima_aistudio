
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAIInsight = async (userName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `O usuário ${userName} acabou de logar no sistema de painel Nexus. Gere uma mensagem de boas-vindas curta (máximo 20 palavras) e um "insight do dia" motivacional ou técnico para um dashboard profissional. Retorne em formato JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            greeting: { type: Type.STRING },
            insight: { type: Type.STRING }
          },
          required: ["greeting", "insight"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro ao obter insight da IA:", error);
    return {
      greeting: `Olá, ${userName}! Bem-vindo de volta.`,
      insight: "Foco e consistência são as chaves para o sucesso em qualquer sistema."
    };
  }
};
