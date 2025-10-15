// server/utils/ai_verification.js
import axios from "axios";

// NOTE: Ensure this environment variable is set in your .env file
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent";

/**
 * Uses Gemini LLM to analyze parsed text and confirm input data integrity.
 * @param {string} parsedText The raw text output from OCR.
 * @param {object} inputs The user-provided certificate details.
 * @returns {Promise<{ai_match: boolean, ai_reason: string}>}
 */
export async function aiAnalyzeVerification(parsedText, inputs) {
  if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not set. Skipping AI verification.");
    return {
      ai_match: false,
      ai_reason: "AI check skipped (API key missing).",
    };
  }

  // Check if the parsed text is too short to be analyzed
  if (parsedText.length < 50) {
    return {
      ai_match: false,
      ai_reason: "Document too short for AI analysis.",
    };
  }

  const systemInstruction = `You are a strict data verification expert. Your task is to analyze the 'DOCUMENT_TEXT' and determine if you can CONFIRM the presence and accuracy of all three required 'USER_INPUTS' (Certificate Name, Issuer, Certificate Number). You must ignore formatting differences, capitalization, and minor spelling errors. Your response MUST be a JSON object conforming to the required schema.`;

  const userQuery = `
    DOCUMENT_TEXT: """${parsedText}"""
    
    USER_INPUTS:
    Certificate Name: ${inputs.certificate_name}
    Issuer: ${inputs.issuer}
    Certificate Number: ${inputs.certificate_number}
    
    Analyze the DOCUMENT_TEXT and determine if the data is VERIFIABLE based on the inputs.
    `;

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          ai_match: {
            type: "BOOLEAN",
            description:
              "True if all three USER_INPUTS are CONFIRMED found and match the context of the document. False otherwise.",
          },
          ai_reason: {
            type: "STRING",
            description:
              "A brief, one-sentence explanation for the ai_match decision (e.g., 'All inputs were clearly found and contextually matched the certificate.').",
          },
        },
      },
    },
  };

  try {
    const response = await axios.post(
      `${API_URL}?key=${GEMINI_API_KEY}`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const jsonText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    const result = JSON.parse(jsonText);

    return {
      ai_match: result.ai_match === true,
      ai_reason: result.ai_reason || "AI analysis completed.",
    };
  } catch (error) {
    console.error("Gemini API Error during verification:", error.message);
    return {
      ai_match: false,
      ai_reason: "AI analysis failed due to internal API error.",
    };
  }
}
