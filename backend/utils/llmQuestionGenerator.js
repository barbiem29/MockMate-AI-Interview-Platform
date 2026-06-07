const axios = require("axios");

// ── Fallback question bank ─────────────────────────
const FALLBACK_BANK = [
  // MCQ
  { questionText: "What is the time complexity of binary search?", questionType: "mcq", category: "DSA", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correctAnswer: "O(log n)", idealAnswer: "O(log n) because it halves the search space each step.", keywords: ["binary search", "log n"] },
  { questionText: "Which data structure follows LIFO principle?", questionType: "mcq", category: "DSA", options: ["Queue", "Stack", "Array", "LinkedList"], correctAnswer: "Stack", idealAnswer: "Stack uses LIFO - Last In First Out.", keywords: ["stack", "LIFO"] },
  { questionText: "What does SQL stand for?", questionType: "mcq", category: "DBMS", options: ["Structured Query Language", "Simple Query Language", "Standard Query Logic", "Stored Query Language"], correctAnswer: "Structured Query Language", idealAnswer: "Structured Query Language.", keywords: ["SQL", "database"] },
  { questionText: "Which HTTP method is used to update a resource?", questionType: "mcq", category: "General", options: ["GET", "POST", "PUT", "DELETE"], correctAnswer: "PUT", idealAnswer: "PUT is used to update a resource.", keywords: ["HTTP", "PUT", "REST"] },
  { questionText: "What is the output of 2 + '2' in JavaScript?", questionType: "mcq", category: "General", options: ["4", "22", "NaN", "Error"], correctAnswer: "22", idealAnswer: "String concatenation returns '22'.", keywords: ["JavaScript", "type coercion"] },
  { questionText: "Which sorting algorithm has the best average case complexity?", questionType: "mcq", category: "DSA", options: ["Bubble Sort", "Merge Sort", "Quick Sort", "Insertion Sort"], correctAnswer: "Merge Sort", idealAnswer: "Merge Sort has O(n log n) in all cases.", keywords: ["sorting", "merge sort"] },
  { questionText: "What is a foreign key in a database?", questionType: "mcq", category: "DBMS", options: ["Primary identifier", "Reference to another table", "Encrypted key", "Index key"], correctAnswer: "Reference to another table", idealAnswer: "A foreign key links two tables.", keywords: ["foreign key", "DBMS"] },
  { questionText: "What does OOP stand for?", questionType: "mcq", category: "OOPS", options: ["Object Oriented Programming", "Open Object Protocol", "Object Operation Process", "Online Object Platform"], correctAnswer: "Object Oriented Programming", idealAnswer: "Object Oriented Programming.", keywords: ["OOP", "object"] },
  { questionText: "Which layer of OSI model handles routing?", questionType: "mcq", category: "CN", options: ["Physical", "Data Link", "Network", "Transport"], correctAnswer: "Network", idealAnswer: "Network layer handles routing.", keywords: ["OSI", "routing", "network layer"] },
  { questionText: "What is a deadlock in OS?", questionType: "mcq", category: "OS", options: ["Infinite loop", "Two processes waiting for each other indefinitely", "Memory overflow", "CPU starvation"], correctAnswer: "Two processes waiting for each other indefinitely", idealAnswer: "Deadlock occurs when processes wait on each other.", keywords: ["deadlock", "OS"] },
  // Technical
  { questionText: "Explain the difference between stack and heap memory.", questionType: "technical", category: "General", options: [], correctAnswer: "", idealAnswer: "Stack is for static/local allocation, heap for dynamic.", keywords: ["stack", "heap", "memory"] },
  { questionText: "What are the four pillars of Object Oriented Programming?", questionType: "technical", category: "OOPS", options: [], correctAnswer: "", idealAnswer: "Encapsulation, Inheritance, Polymorphism, Abstraction.", keywords: ["OOP", "pillars"] },
  { questionText: "What is normalization in databases?", questionType: "technical", category: "DBMS", options: [], correctAnswer: "", idealAnswer: "Process of organizing data to reduce redundancy.", keywords: ["normalization", "DBMS"] },
  { questionText: "Explain the concept of recursion with an example.", questionType: "technical", category: "DSA", options: [], correctAnswer: "", idealAnswer: "A function calling itself. E.g. factorial.", keywords: ["recursion", "function"] },
  { questionText: "What is the difference between process and thread?", questionType: "technical", category: "OS", options: [], correctAnswer: "", idealAnswer: "Process is independent, thread shares memory with others.", keywords: ["process", "thread", "OS"] },
  // Behavioral
  { questionText: "Tell me about a time you faced a difficult challenge and how you handled it.", questionType: "behavioral", category: "HR", options: [], correctAnswer: "", idealAnswer: "Use STAR method: Situation, Task, Action, Result.", keywords: ["challenge", "problem solving"] },
  { questionText: "Where do you see yourself in 5 years?", questionType: "behavioral", category: "HR", options: [], correctAnswer: "", idealAnswer: "Career growth aligned with the company's vision.", keywords: ["goals", "career"] },
  { questionText: "Describe a situation where you worked under pressure.", questionType: "behavioral", category: "HR", options: [], correctAnswer: "", idealAnswer: "Use STAR method to describe the situation.", keywords: ["pressure", "teamwork"] },
  { questionText: "What are your greatest strengths and weaknesses?", questionType: "behavioral", category: "HR", options: [], correctAnswer: "", idealAnswer: "Be honest, show self-awareness and growth mindset.", keywords: ["strengths", "weaknesses"] },
  { questionText: "Tell me about a project you are most proud of.", questionType: "behavioral", category: "HR", options: [], correctAnswer: "", idealAnswer: "Describe impact, your role, and what you learned.", keywords: ["project", "proud", "achievement"] },
];

function pickFallback(interviewType, difficulty, usedTexts = []) {
  // Filter by type preference
  let pool = FALLBACK_BANK.filter(q => !usedTexts.includes(q.questionText));

  if (pool.length === 0) pool = [...FALLBACK_BANK]; // reset if all used

  let typed = [];
  if (interviewType === "behavioral") {
    typed = pool.filter(q => q.questionType === "behavioral");
  } else if (interviewType === "technical") {
    typed = pool.filter(q => q.questionType === "mcq" || q.questionType === "technical");
  } else {
    typed = pool; // mixed uses everything
  }

  if (typed.length === 0) typed = pool;

  // Shuffle typed pool using Fisher-Yates
  for (let i = typed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [typed[i], typed[j]] = [typed[j], typed[i]];
  }

  const q = typed[0];
  return {
    questionText:     q.questionText,
    questionType:     q.questionType,
    category:         q.category,
    difficulty,
    options:          q.options       || [],
    correctAnswer:    q.correctAnswer || "",
    idealAnswer:      q.idealAnswer   || "",
    keywords:         q.keywords      || [],
    expectedConcepts: [],
    generatedByAI:    false,
    sourceType:       "ai",
    isActive:         true
  };
}

function extractJson(text) {
  const start = text.indexOf("{");
  const end   = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) throw new Error("No JSON found");
  return text.slice(start, end + 1);
}

const generateQuestionWithLLM = async ({
  interviewType     = "mixed",
  difficulty        = "medium",
  companyMode       = "general",
  targetRole        = "",
  skillsTargeted    = [],
  previousQuestions = [],
  resumeText        = "",
  preferMCQ         = true,
  sessionSeed       = ""
}) => {
  if (!process.env.GROQ_API_KEY) {
    console.warn("No GROQ_API_KEY — using fallback");
    return pickFallback(interviewType, difficulty, previousQuestions);
  }

  try {
    // Pick question type with randomness
    let questionType = "mcq";
    const r = Math.random();

    if (interviewType === "behavioral") {
      questionType = "behavioral";
    } else if (interviewType === "resume-based") {
      questionType = r < 0.6 ? "mcq" : "technical";
    } else if (interviewType === "technical") {
      questionType = r < 0.7 ? "mcq" : "technical";
    } else {
      // mixed
      if      (r < 0.5)  questionType = "mcq";
      else if (r < 0.75) questionType = "technical";
      else               questionType = "behavioral";
    }

    const isMCQ = questionType === "mcq";

    // Build context hints
    const hints = [
      targetRole        ? `Target role: ${targetRole}.`           : "",
      skillsTargeted?.length ? `Focus on: ${skillsTargeted.join(", ")}.` : "",
      companyMode !== "general" ? `${companyMode} interview style.` : "",
      resumeText        ? `From candidate resume: ${resumeText.slice(0, 300)}` : "",
    ].filter(Boolean).join(" ");

    // Last 5 questions to avoid repeats
    const prevList = previousQuestions.slice(-5);
    const prevHint = prevList.length > 0
      ? `\nDo NOT repeat these questions:\n${prevList.map((q, i) => `${i+1}. ${q}`).join("\n")}`
      : "";

    // Random seed to force LLM variety
    const seed = sessionSeed || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const prompt = `You are an expert technical interviewer. Generate ONE unique interview question.

Context: ${hints}
Variation seed (ignore this, just ensures uniqueness): ${seed}
${prevHint}

Generate a ${questionType} question at ${difficulty} difficulty level.

${isMCQ
? `Return ONLY this exact JSON format:
{
  "questionText": "clear, specific MCQ question?",
  "questionType": "mcq",
  "category": "DSA",
  "difficulty": "${difficulty}",
  "options": ["option A", "option B", "option C", "option D"],
  "correctAnswer": "option A",
  "idealAnswer": "Brief explanation of why option A is correct.",
  "keywords": ["word1", "word2"],
  "expectedConcepts": ["concept1"]
}`
: `Return ONLY this exact JSON format:
{
  "questionText": "clear, specific open-ended question?",
  "questionType": "${questionType}",
  "category": "General",
  "difficulty": "${difficulty}",
  "options": [],
  "correctAnswer": "",
  "idealAnswer": "What a good answer should include.",
  "keywords": ["word1", "word2"],
  "expectedConcepts": ["concept1"]
}`}

STRICT RULES:
- Return ONLY raw JSON — no \`\`\` fences, no preamble, no explanation
- category must be exactly one of: DSA, DBMS, OS, CN, OOPS, HR, Aptitude, Resume, General
- difficulty must be exactly: easy, medium, or hard
- MCQ must have exactly 4 options
- Make the question DIFFERENT from previous questions`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role:    "system",
            content: "You are a technical interviewer. Output ONLY valid JSON. No markdown. No explanation. No code fences. Just the JSON object."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.95,
        max_tokens:  700
      },
      {
        headers: {
          Authorization:  `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );

    const rawText = response?.data?.choices?.[0]?.message?.content || "";
    console.log(`[LLM] Generated (${questionType}):`, rawText.slice(0, 120));

    const parsed = JSON.parse(extractJson(rawText));

    const validTypes      = ["technical", "behavioral", "mcq", "resume-based", "follow-up"];
    const validDiffs      = ["easy", "medium", "hard"];
    const validCats       = ["DSA", "DBMS", "OS", "CN", "OOPS", "HR", "Aptitude", "Resume", "General"];

    const options = isMCQ && Array.isArray(parsed.options) && parsed.options.length === 4
      ? parsed.options
      : isMCQ
        ? ["Option A", "Option B", "Option C", "Option D"]
        : [];

    return {
      questionText:     String(parsed.questionText || "").trim() || "Explain a key concept in your area of expertise.",
      questionType:     validTypes.includes(parsed.questionType) ? parsed.questionType : questionType,
      category:         validCats.includes(parsed.category)  ? parsed.category  : "General",
      difficulty:       validDiffs.includes(parsed.difficulty) ? parsed.difficulty : difficulty,
      options,
      correctAnswer:    String(parsed.correctAnswer || ""),
      idealAnswer:      String(parsed.idealAnswer   || ""),
      keywords:         Array.isArray(parsed.keywords)         ? parsed.keywords         : [],
      expectedConcepts: Array.isArray(parsed.expectedConcepts) ? parsed.expectedConcepts : [],
      generatedByAI:    true,
      sourceType:       "ai",
      isActive:         true
    };

  } catch (err) {
    console.error("[LLM] Generation failed:", err.message);
    if (err.response) {
      console.error("[LLM] HTTP:", err.response.status, JSON.stringify(err.response.data).slice(0, 200));
    }
    // Always return a fallback — interview must never break
    return pickFallback(interviewType, difficulty, previousQuestions);
  }
};

module.exports = { generateQuestionWithLLM };