import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateAbsurdExcuse = async (
  absurdityPercentage: number,
  previousExcuses: string[]
): Promise<string> => {
  try {
    const ai = getGeminiClient();

    // Context management
    const recentHistory = previousExcuses.slice(-10).join(" | ");

    // Determine strict guidelines based on percentage
    let absurdityGuideline = "";
    
    if (absurdityPercentage <= 30) {
        absurdityGuideline = `
        NIVEAU: 0-30% (RÉALISTE MAIS MALCHANCEUX)
        - Techniquement possible mais improbable.
        - Ex: "J'ai glissé sur une peau de banane laissée par un clown."
        `;
    } else if (absurdityPercentage <= 70) {
        absurdityGuideline = `
        NIVEAU: 31-70% (BIZARRE ET LOUFOQUE)
        - Logique de dessin animé. Objets ou animaux avec des comportements étranges.
        - Ex: "Mon chat a changé le mot de passe de mon réveil."
        `;
    } else {
        absurdityGuideline = `
        NIVEAU: 71-100% (TOTALEMENT ABSURDE / COSMIQUE)
        - Lois de la physique brisées, causalité inversée.
        - Ex: "J'ai dû attendre que ma porte redevienne solide, elle était à l'état gazeux."
        `;
    }

    const systemInstruction = `
      Tu es un générateur d'excuses infaillible.
      RÈGLE D'OR : Tu dois TOUJOURS finir tes phrases.
      RÈGLE D'ARGENT : Donne UNIQUEMENT l'excuse, sans guillemets, sans "Voici :", sans blabla.
      RÈGLE DE BRONZE : Une seule phrase, grammaticalement complète.
      RÈGLE DE FER : TA RÉPONSE NE DOIT PAS DÉPASSER 150 CARACTÈRES. SOIS CONCIS.
    `;

    const userPrompt = `
      Génère une excuse de retard.
      
      Paramètres :
      - Absurdité : ${absurdityPercentage}%
      - Style : ${absurdityGuideline}
      - Évite ces doublons : ${recentHistory}
      
      L'excuse doit être en français, drôle, COMPLETE (finir par un point) et COURTE (max 150 caractères).
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 1.1, // High creativity
        topK: 40,
        maxOutputTokens: 1024, // High limit to ensure no cutoff, but model is instructed to be short
      }
    });

    const text = response.text;
    
    // Cleanup
    let cleanText = text ? text.trim().replace(/^["']|["']$/g, '') : "";

    // Fallback if empty
    if (!cleanText) {
        return "Je n'ai pas d'excuse, mon cerveau est resté sur la table de nuit.";
    }
    
    // Safety check: ensure it ends with punctuation if the model forgot (rare with 1024 tokens)
    if (!/[.!?]$/.test(cleanText)) {
        cleanText += ".";
    }
    
    return cleanText;

  } catch (error) {
    console.error("Error generating excuse:", error);
    return "Une faille spatio-temporelle a avalé mon excuse.";
  }
};