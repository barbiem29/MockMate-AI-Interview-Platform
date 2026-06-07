const fs       = require("fs");
const path     = require("path");
const pdfParse = require("pdf-parse");

const KNOWN_SKILLS = [
  "java", "python", "c++", "c", "javascript", "typescript", "react", "reactjs",
  "node", "nodejs", "express", "expressjs", "mongodb", "mysql", "postgresql",
  "redis", "docker", "kubernetes", "aws", "azure", "gcp", "git", "github",
  "html", "css", "tailwind", "bootstrap", "angular", "vue", "vuejs", "nextjs",
  "django", "flask", "spring", "springboot", "hibernate", "graphql", "rest",
  "dsa", "data structures", "algorithms", "oops", "os", "operating systems",
  "dbms", "database", "cn", "computer networks", "networking",
  "machine learning", "deep learning", "tensorflow", "keras", "pytorch",
  "pandas", "numpy", "scikit", "nlp", "computer vision",
  "sql", "nosql", "firebase", "linux", "bash", "shell",
  "android", "ios", "swift", "kotlin", "flutter", "dart",
  "redux", "graphql", "webpack", "babel", "jest", "testing",
  "agile", "scrum", "jira", "devops", "ci/cd"
];

const extractSkillsFromText = (text = "") => {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = [];

  for (const skill of KNOWN_SKILLS) {
    // Word boundary check to avoid partial matches
    const regex = new RegExp(`\\b${skill.replace(/[+.]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lower)) {
      // Return nicely capitalised version
      found.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  }

  // Deduplicate (e.g. "node" and "nodejs")
  const deduped = [...new Set(found)];
  return deduped.slice(0, 15); // max 15 skills
};

const parseResumePdf = async (filePath) => {
  try {
    // Verify file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const buffer  = fs.readFileSync(filePath);
    const data    = await pdfParse(buffer);
    const rawText = data.text || "";

    if (!rawText.trim()) {
      throw new Error("PDF appears to be empty or scanned. Text could not be extracted.");
    }

    const extractedSkills = extractSkillsFromText(rawText);

    console.log(`[RESUME] Parsed ${rawText.length} chars, found skills: ${extractedSkills.join(", ")}`);

    return {
      rawText,
      extractedSkills,
      pageCount: data.numpages || 1
    };

  } catch (err) {
    console.error("[RESUME] Parse error:", err.message);
    throw new Error("Could not parse resume: " + err.message);
  }
};

module.exports = { parseResumePdf };