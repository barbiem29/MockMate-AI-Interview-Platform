const axios = require("axios");

const extractJsonFromText = (text) => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No valid JSON object found in LLM response");
  }

  return text.slice(start, end + 1);
};

const evaluateWithLLM = async ({
  questionType = "technical",
  questionText = "",
  idealAnswer = "",
  expectedKeywords = [],
  userAnswerText = ""
}) => {
  try {
    console.log("===== GROQ LLM START =====");
    console.log("Groq key exists:", !!process.env.GROQ_API_KEY);

    if (!process.env.GROQ_API_KEY) {
      throw new Error("Missing GROQ_API_KEY in .env");
    }

    const prompt = `
You are an expert AI interviewer.

Evaluate the candidate answer for the given interview question.

Question Type: ${questionType}
Question: ${questionText}
Ideal Answer: ${idealAnswer}
Expected Keywords: ${expectedKeywords.join(", ")}
Candidate Answer: ${userAnswerText}

Return ONLY valid JSON in this exact format:

{
  "conceptualScore": 85,
  "communicationScore": 80,
  "structureScore": 75,
  "confidenceScore": 82,
  "finalScore": 81,
  "strengths": ["Good explanation"],
  "weaknesses": ["Could add more detail"],
  "improvementSuggestions": ["Mention time complexity"],
  "hireSignal": "Positive"
}

Rules:
- Return ONLY JSON
- No markdown
- No explanation outside JSON
- Scores must be integers between 0 and 100
- hireSignal must be Positive, Neutral, or Negative
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are a strict technical interviewer that only returns valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 500
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("===== FULL GROQ RESPONSE =====");
    console.log(JSON.stringify(response.data, null, 2));

    const rawText =
      response?.data?.choices?.[0]?.message?.content || "";

    console.log("===== RAW TEXT =====");
    console.log(rawText);

    const jsonText = extractJsonFromText(rawText);

    console.log("===== EXTRACTED JSON =====");
    console.log(jsonText);

    const parsed = JSON.parse(jsonText);

    return {
      conceptualScore: Number(parsed.conceptualScore) || 0,
      communicationScore: Number(parsed.communicationScore) || 0,
      structureScore: Number(parsed.structureScore) || 0,
      confidenceScore: Number(parsed.confidenceScore) || 0,
      finalScore: Number(parsed.finalScore) || 0,
      strengths: Array.isArray(parsed.strengths)
        ? parsed.strengths
        : [],
      weaknesses: Array.isArray(parsed.weaknesses)
        ? parsed.weaknesses
        : [],
      improvementSuggestions: Array.isArray(
        parsed.improvementSuggestions
      )
        ? parsed.improvementSuggestions
        : [],
      hireSignal: ["Positive", "Neutral", "Negative"].includes(
        parsed.hireSignal
      )
        ? parsed.hireSignal
        : "Neutral"
    };
  } catch (error) {
    console.log("===== GROQ ERROR =====");

    if (error.response) {
      console.log("Status:", error.response.status);
      console.log(
        "Error Data:",
        JSON.stringify(error.response.data, null, 2)
      );
    } else {
      console.log("Error Message:", error.message);
    }

    return {
      conceptualScore: 50,
      communicationScore: 50,
      structureScore: 50,
      confidenceScore: 50,
      finalScore: 50,
      strengths: [],
      weaknesses: ["LLM evaluation failed"],
      improvementSuggestions: [
        "Retry the evaluation or check API configuration"
      ],
      hireSignal: "Neutral"
    };
  }
};

module.exports = {
  evaluateWithLLM
};