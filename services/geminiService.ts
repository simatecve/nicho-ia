
import { GoogleGenAI, Type } from "@google/genai";
import { NicheAnalysis, UserInput } from "../types";

// Always initialize GoogleGenAI inside functions to ensure the most up-to-date API key is used
// as per the guidelines for models requiring user-selected keys.

export const analyzeNiche = async (input: UserInput): Promise<NicheAnalysis> => {
  // Use the API key exclusively from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analiza este nicho de negocio basándote en la siguiente información:
  - Idea/Nicho: "${input.niche}"
  - Estado de ventas: ${input.salesStatus}
  - Ticket promedio: ${input.ticketPrice}
  - Canal de adquisición: ${input.acquisitionChannel}

  Proporciona un análisis brutalista, honesto y agresivo. No uses rellenos corporativos. Sé directo.
  Debes usar Google Search para validar si el mercado está saturado o si hay tendencias actuales que favorezcan o perjudiquen esta idea.
  
  El JSON debe ser estricto siguiendo esta estructura:
  {
    "score": número del 0 al 100,
    "level": "Bajo" | "Medio" | "Alto",
    "headline": "Frase brutalista impactante",
    "diagnosis": "Explicación máxima de 90 palabras",
    "recommendations": ["r1", "r2", "r3"],
    "risks": ["x1", "x2", "x3"]
  }`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          level: { type: Type.STRING },
          headline: { type: Type.STRING },
          diagnosis: { type: Type.STRING },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          risks: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["score", "level", "headline", "diagnosis", "recommendations", "risks"],
      },
    },
  });

  const analysis = JSON.parse(response.text || "{}") as NicheAnalysis;
  
  // MUST extract URLs from groundingChunks if googleSearch is used
  if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
    analysis.sources = response.candidates[0].groundingMetadata.groundingChunks
      .map((chunk: any) => ({
        title: chunk.web?.title || chunk.web?.uri || "Fuente de datos",
        uri: chunk.web?.uri
      }))
      .filter((s: any) => s.uri);
  }
  
  return analysis;
};

export const generateNicheVisual = async (niche: string, size: "1K" | "2K" | "4K" = "1K"): Promise<string | null> => {
  // Use gemini-3-pro-image-preview for high quality image generation
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: `Una representación visual conceptual y moderna del siguiente nicho de negocio: "${niche}". Estilo brutalista, minimalista, colores de alto contraste (blanco, negro, gris, amarillo neón). Sin texto legible, enfoque en la iconografía o metáfora del negocio.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: size
        },
      },
    });

    // Iterate through all parts to find the image part
    for (const part of response.candidates?.[0]?.content.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error; // Rethrow to let App.tsx handle API key errors
  }
};