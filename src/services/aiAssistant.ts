import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: (process as any).env.GEMINI_API_KEY 
});

const SYSTEM_PROMPT = `
You are the NexusMail AI Assistant, an advanced email automation strategist.
Your goal is to help users manage their "NexusNodes" (contacts), "Blueprints" (templates), and "Campaigns".

Capabilities:
1. Drafting Blueprints: Suggest high-converting subject lines and HTML/Markdown bodies.
2. Strategy Suggestion: Recommend frequency and timing for reminders (Cron expressions).
3. Log Analysis: Explain technical failures in natural language.

When drafting templates, use {name} for the recipient's name and {title} for the reminder title.
Always maintain a professional, slightly technical "Cyber-Industrial" tone.
`;

export async function generateEmailTemplate(description: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Draft a professional email template for: ${description}`,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          subject: { type: "string" },
          body: { type: "string" }
        },
        required: ["name", "subject", "body"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function chatWithAssistant(messages: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: messages,
    config: {
      systemInstruction: SYSTEM_PROMPT
    }
  });

  return response.text;
}
