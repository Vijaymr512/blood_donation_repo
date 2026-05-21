const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `Extract the following details from the medical blood request text.
Return ONLY valid JSON.
Fields:
- blood_group
- units_required
- hospital_name
- hospital_address
- contact_person
- priority

If a field is missing, return null.
Do not include explanations.
Do not include markdown.`;

/**
 * Sends raw text to OpenAI GPT-4o-mini to extract structured blood request details.
 * @param {String} rawText The text extracted from the document
 * @returns {Promise<Object>} The parsed JSON object
 */
const extractBloodRequestDetails = async (rawText) => {
  try {
    // 1. Try OpenAI GPT-4o-mini First
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: rawText }
      ]
    });

    let content = response.choices[0].message.content;
    return cleanAndParseJSON(content);

  } catch (openaiError) {
    console.warn("OpenAI Extraction Failed:", openaiError.message, "--- Falling back to Gemini API.");
    
    // 2. Fallback to Gemini
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing in .env");
      }
      
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      
      const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nDocument Text:\n${rawText}`);
      let content = result.response.text();
      
      return cleanAndParseJSON(content);
    } catch (geminiError) {
      console.error("Gemini Fallback Extraction Error:", geminiError.message);
      throw new Error('Both OpenAI and Gemini extractions failed');
    }
  }
};

// Helper to strip markdown and parse JSON safely
const cleanAndParseJSON = (content) => {
  let cleaned = content.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\n/, '').replace(/\n```$/, '');
  }
  return JSON.parse(cleaned);
};

module.exports = { extractBloodRequestDetails };
