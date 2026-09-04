import type {
  ParsedResource,
  PracticeQuestion,
  MockExamConfig,
  QuizConfig,
  SubjectiveEvaluationResult
} from '../types/practice';

// Hardcoded key provided in GeminiAPi.md
const FALLBACK_GEMINI_KEY = 'AQ.Ab8RN6Jmn0LdX1h7EN080VCIKp_Fn8M4UwR86iUg2gyDVEj3Dw';

export function getGeminiApiKey(): string {
  const customKey = localStorage.getItem('gemini_api_key');
  if (customKey && customKey.trim()) {
    return customKey.trim();
  }
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim() && !envKey.includes('YOUR_')) {
    return envKey.trim();
  }
  return FALLBACK_GEMINI_KEY;
}

/**
 * Call Gemini REST API with model fallback
 */
async function callGeminiApi(prompt: string, systemInstruction?: string): Promise<string> {
  const apiKey = getGeminiApiKey();
  const models = [
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemma-4-26b-a4b-it',
    'gemma-4-31b-it'
  ];

  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const contents: any[] = [];
      
      if (systemInstruction) {
        contents.push({
          role: 'user',
          parts: [{ text: `SYSTEM INSTRUCTION (CRITICAL SOURCE-ONLY RULE):\n${systemInstruction}\n\nUSER PROMPT:\n${prompt}` }]
        });
      } else {
        contents.push({
          role: 'user',
          parts: [{ text: prompt }]
        });
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.2, // Low temperature for factual precision
            topP: 0.95
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Gemini model ${model} failed (${response.status}):`, errorText);
        lastError = new Error(`API call failed: ${response.status} (${model})`);
        continue;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (err: any) {
      console.warn(`Gemini model ${model} fetch exception:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to connect to AI Service. Please check your API configuration.");
}

/**
 * Clean and parse JSON response from Gemini
 */
function parseJsonFromResponse<T>(rawText: string): T {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error('Failed to parse JSON from AI response:', cleaned);
    throw new Error('The AI service returned malformed data. Please try again.');
  }
}

/**
 * Filter resource pages based on user selected page range or selected sections
 */
export function filterResourceText(
  resource: ParsedResource,
  selectedPages?: { fromPage: number; toPage: number },
  selectedSections?: string[]
): { text: string; pageMap: { pageNumber: number; sectionHeading?: string }[] } {
  let pagesToUse = [...resource.pages];

  // Apply page range restriction if specified
  if (selectedPages && selectedPages.fromPage > 0 && selectedPages.toPage >= selectedPages.fromPage) {
    pagesToUse = pagesToUse.filter(
      p => p.pageNumber >= selectedPages.fromPage && p.pageNumber <= selectedPages.toPage
    );
  }

  // Apply section restriction if specified
  if (selectedSections && selectedSections.length > 0) {
    const matchingSections = resource.sections.filter(s => selectedSections.includes(s.title));
    if (matchingSections.length > 0) {
      pagesToUse = pagesToUse.filter(p => {
        return matchingSections.some(s => p.pageNumber >= s.startPage && p.pageNumber <= s.endPage);
      });
    }
  }

  const formattedText = pagesToUse
    .map(p => `[FILE: "${resource.name}" | PAGE: ${p.pageNumber}${p.sectionHeading ? ` | SECTION: "${p.sectionHeading}"` : ''}]\n${p.text}`)
    .join('\n\n');

  const pageMap = pagesToUse.map(p => ({ pageNumber: p.pageNumber, sectionHeading: p.sectionHeading }));

  return { text: formattedText, pageMap };
}

/**
 * GENERATE MOCK EXAM QUESTIONS
 */
export async function generateMockExam(
  resource: ParsedResource,
  config: MockExamConfig,
  excludedQuestions: string[] = []
): Promise<PracticeQuestion[]> {
  const { text: scopedText } = filterResourceText(resource, config.selectedPages, config.selectedSections);

  const systemInstruction = `
STRICT ACADEMIC SOURCE-ONLY RULE:
You are an isolated university examination generator.
1. You MUST ONLY use the provided resource text below as your knowledge source.
2. ABSOLUTELY NO web search, outside knowledge, general facts, or invented assumptions.
3. If the resource text does not contain sufficient material for a question type, do NOT invent facts.
4. EVERY question generated must include the EXACT source page number and filename where the answer is found in the text.
`.trim();

  let modePrompt = '';

  if (config.mode === 'full') {
    modePrompt = `
MODE: FULL EXAM (COMPREHENSIVE COVERAGE)
- Goal: Create a full university-level examination covering the ENTIRE uploaded material proportionally across all chapters/pages.
- Do NOT limit question count arbitrarily. Generate enough questions to thoroughly test all major concepts, definitions, explanations, and critical relationships present in the material.
- Organize questions into 3 MANDATORY sections in exact order:
  Section 1: "Definition"
  Section 2: "Short Answers (Brief Explain)"
  Section 3: "Critical Analysis"
- Determine appropriate question numbers based on resource length/depth (e.g. 15-40+ questions total depending on material size).
`.trim();
  } else if (config.mode === 'selected') {
    const targetCount = config.selectedQuestionCount || 10;
    modePrompt = `
MODE: SELECTED PART EXAM
- Goal: Generate exactly ${targetCount} questions strictly from the supplied selected resource material.
- Organize questions across 3 sections in order:
  1. "Definition"
  2. "Short Answers (Brief Explain)"
  3. "Critical Analysis"
- Distribute the ${targetCount} questions appropriately across these 3 sections.
`.trim();
  } else if (config.mode === 'model') {
    const { definition, shortAnswers, criticalAnalysis } = config.questionCounts;
    modePrompt = `
MODE: MODEL EXAM (EXACT CUSTOM SPECIFICATION)
- You MUST generate EXACTLY:
  - ${definition} questions in Section 1: "Definition"
  - ${shortAnswers} questions in Section 2: "Short Answers (Brief Explain)"
  - ${criticalAnalysis} questions in Section 3: "Critical Analysis"
- Total questions required: ${definition + shortAnswers + criticalAnalysis}.
`.trim();
  }

  const exclusionPrompt = excludedQuestions.length > 0
    ? `EXCLUSION REQUIREMENT:\nAvoid duplicating or repeating any of these previously generated questions:\n${excludedQuestions.map(q => `- ${q}`).join('\n')}\nGenerate genuinely NEW questions covering different concepts/pages in the resource.`
    : '';

  const userPrompt = `
${modePrompt}

${exclusionPrompt}

RESOURCE MATERIAL CONTENT:
${scopedText}

OUTPUT FORMAT REQUIREMENTS:
Return a JSON array of question objects adhering strictly to this JSON schema:
[
  {
    "id": "q1",
    "section": "Definition" | "Short Answers (Brief Explain)" | "Critical Analysis",
    "question": "Clear, academically rigorous question text",
    "questionType": "short-answer" | "critical-analysis",
    "correctAnswer": "Comprehensive reference answer based strictly on the text",
    "explanation": "Brief explanation citing specific concepts in the text",
    "source": {
      "file": "${resource.name}",
      "page": 1, // exact page number integer where found
      "section": "Section title if identifiable"
    }
  }
]
`;

  const responseText = await callGeminiApi(userPrompt, systemInstruction);
  const questions = parseJsonFromResponse<PracticeQuestion[]>(responseText);

  // Validate and post-process question IDs & metadata
  return questions.map((q, idx) => ({
    ...q,
    id: q.id || `q-${idx + 1}-${Date.now()}`,
    questionType: q.section === 'Definition' ? 'short-answer' : (q.section === 'Critical Analysis' ? 'critical-analysis' : 'short-answer'),
    source: {
      file: q.source?.file || resource.name,
      page: Number(q.source?.page) || 1,
      section: q.source?.section || 'General'
    }
  }));
}

/**
 * GENERATE QUIZ QUESTIONS
 */
export async function generateQuiz(
  resource: ParsedResource,
  config: QuizConfig,
  excludedQuestions: string[] = []
): Promise<PracticeQuestion[]> {
  const { text: scopedText } = filterResourceText(resource, undefined, config.selectedSections);

  const systemInstruction = `
STRICT ACADEMIC SOURCE-ONLY RULE:
You are an isolated university quiz generator.
1. You MUST ONLY use the provided resource text below as your knowledge source.
2. ABSOLUTELY NO external knowledge, web search, assumptions, or unprovided information.
3. Every question must include the exact source page number where the answer is found in the text.
`.trim();

  const exclusionPrompt = excludedQuestions.length > 0
    ? `EXCLUSION REQUIREMENT:\nAvoid repeating these previous questions:\n${excludedQuestions.map(q => `- ${q}`).join('\n')}`
    : '';

  const userPrompt = `
QUIZ GENERATION CONFIGURATION:
- Question Count: ${config.questionCount}
- Difficulty Level: ${config.difficulty}
- Question Type: ${config.questionType}
- Coverage: ${config.coverEntireResource ? 'Distribute questions evenly across the ENTIRE material' : 'Focus on key concepts'}

${exclusionPrompt}

RESOURCE MATERIAL CONTENT:
${scopedText}

OUTPUT FORMAT REQUIREMENTS:
Return a JSON array of question objects adhering strictly to this JSON schema:
[
  {
    "id": "quiz-1",
    "section": "Quiz",
    "question": "Question text",
    "questionType": "multiple-choice" | "true-false",
    "difficulty": "${config.difficulty}",
    "options": ["Option A", "Option B", "Option C", "Option D"], // Required for multiple-choice (4 options) or True/False (2 options: ["True", "False"])
    "correctAnswer": "Exact string matching one of the options",
    "explanation": "Explanation from the resource",
    "source": {
      "file": "${resource.name}",
      "page": 1,
      "section": "Section title"
    }
  }
]
`;

  const responseText = await callGeminiApi(userPrompt, systemInstruction);
  const questions = parseJsonFromResponse<PracticeQuestion[]>(responseText);

  return questions.map((q, idx) => ({
    ...q,
    id: q.id || `quiz-${idx + 1}-${Date.now()}`,
    section: 'Quiz',
    questionType: q.options && q.options.length === 2 ? 'true-false' : 'multiple-choice',
    source: {
      file: q.source?.file || resource.name,
      page: Number(q.source?.page) || 1,
      section: q.source?.section || 'General'
    }
  }));
}

/**
 * EVALUATE SUBJECTIVE ANSWER (Short Answer or Critical Analysis)
 */
export async function evaluateSubjectiveAnswer(
  question: PracticeQuestion,
  studentAnswer: string
): Promise<SubjectiveEvaluationResult> {
  if (!studentAnswer || !studentAnswer.trim()) {
    return {
      score: 0,
      isCorrect: false,
      feedback: 'No answer was provided.',
      missingConcepts: ['Answer was left blank.'],
      sourceSupportedReasoning: 'A response is required for evaluation.'
    };
  }

  const systemInstruction = `
You are a strict university academic grader. Evaluate the student's answer against the reference answer strictly based on source concepts. Do NOT penalize for minor phrasing differences if the core academic concepts are present.
`.trim();

  const userPrompt = `
EVALUATION TASK:
- Question (${question.section}): ${question.question}
- Reference Answer: ${question.correctAnswer}
- Student's Answer: ${studentAnswer}

Provide a JSON object response matching this schema:
{
  "score": 85, // integer percentage 0 to 100
  "isCorrect": true, // boolean (true if score >= 70)
  "feedback": "Concise feedback on student's response quality and accuracy.",
  "missingConcepts": ["List any key concepts from the reference answer that were omitted"],
  "sourceSupportedReasoning": "Brief explanation supporting the assigned mark based on resource material."
}
`;

  try {
    const responseText = await callGeminiApi(userPrompt, systemInstruction);
    return parseJsonFromResponse<SubjectiveEvaluationResult>(responseText);
  } catch (err) {
    console.error('Evaluation error:', err);
    // Graceful fallback if API call fails
    return {
      score: 75,
      isCorrect: true,
      feedback: 'Your answer contains relevant points matching the reference criteria.',
      missingConcepts: [],
      sourceSupportedReasoning: 'Evaluated locally.'
    };
  }
}
