import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface DiagnosisResult {
  diseaseName: string;
  scientificName: string;
  confidence: number;
  description: string;
  actions: {
    type: 'danger' | 'warning' | 'success';
    text: string;
  }[];
}

export async function analyzeCropImage(base64Image: string): Promise<DiagnosisResult> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze the provided image of a crop/plant.
    Identify the plant species and detect any disease.
    If healthy, state "Healthy" as the disease name.
    Provide the scientific name if applicable.
    Estimate confidence as a percentage (0-100).
    Provide a concise description of the condition.
    Provide 3-4 recommended actions with types: 'danger' (for removal/destruction), 'warning' (for chemical/immediate treatment), 'success' (for prevention/maintenance).
  `;

  const imagePart = {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64Image.split(',')[1] || base64Image,
    },
  };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: [{ parts: [imagePart, { text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diseaseName: { type: Type.STRING },
          scientificName: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          description: { type: Type.STRING },
          actions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['danger', 'warning', 'success'] },
                text: { type: Type.STRING }
              },
              required: ['type', 'text']
            }
          }
        },
        required: ['diseaseName', 'scientificName', 'confidence', 'description', 'actions']
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    throw new Error("Failed to parse diagnosis result");
  }
}

export async function chatWithAgriExpert(message: string): Promise<string> {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are AgriScan AI Assistant, an expert agricultural consultant. Provide concise, professional advice on crop health and farming.",
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text || "I'm sorry, I couldn't process that.";
}
