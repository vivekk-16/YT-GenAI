const {GoogleGenAI} = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const { normalizeAIResponse } = require("../utils/aiResponseNormalizer");

const ai = new GoogleGenAI({
    apiKey : process.env.GOOGLE_GENAI_API_KEY
})

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The behavioral question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan"),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day")
    })).describe("A day-wise preparation plan for the candidate"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

/**
 * Generate interview report using Gemini API
 * Uses normalizer utility to handle malformed AI responses
 */
async function generateInterviewReport({title, resume, selfDescription, jobDescription}){

    const prompt = `You are an expert technical interviewer and career coach.

Analyze the candidate's resume, self description, and job description to generate an interview preparation report.

CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. Return ONLY raw JSON. NO MARKDOWN. NO CODE BLOCKS. NO EXPLANATIONS.
2. Your response must be VALID JSON that can be parsed directly.
3. Every field MUST match the exact schema structure shown below.
4. Do NOT wrap JSON in backticks or markdown formatting.
5. Do NOT include any explanatory text before or after JSON.
6. All arrays MUST contain complete OBJECTS, not key-value pairs.
7. Every array item must be a complete object with all required fields.

EXACT SCHEMA - FOLLOW THIS STRUCTURE PRECISELY:
{
  "title": "Exact job title from job description",
  "matchScore": number between 0 and 100,
  "technicalQuestions": [
    {
      "question": "specific technical question",
      "intention": "why interviewer asks this",
      "answer": "detailed answer with key points"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "specific behavioral question",
      "intention": "why interviewer asks this",
      "answer": "detailed answer with examples"
    }
  ],
  "skillGaps": [
    {
      "skill": "missing skill name",
      "severity": "low" or "medium" or "high"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "main focus area for this day",
      "tasks": ["task 1", "task 2", "task 3"]
    }
  ]
}

REQUIREMENTS:
- technicalQuestions: array of 3-5 questions with question, intention, answer
- behavioralQuestions: array of 2-3 questions with question, intention, answer
- skillGaps: array of 2-4 gaps with skill name and severity level
- preparationPlan: array of 3-7 days with day number, focus, and tasks list
- matchScore: calculate how well candidate matches job (0-100)
- All strings must be meaningful and non-empty
- All arrays must have at least one complete object

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

RESPOND WITH ONLY THE JSON OBJECT, NOTHING ELSE.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(interviewReportSchema)
            }
        });

        console.log("AI RAW RESPONSE:", response.text);

        // Parse the raw response
        let parsedResponse = JSON.parse(response.text);
        console.log("PARSED RESPONSE (before normalization):", JSON.stringify(parsedResponse, null, 2));

        // Normalize to ensure correct structure
        let normalizedResponse = normalizeAIResponse(parsedResponse);
        console.log("NORMALIZED RESPONSE:", JSON.stringify(normalizedResponse, null, 2));

        return normalizedResponse;

    } catch (error) {
        console.error("Error in generateInterviewReport:", error);
        throw new Error(`Failed to generate interview report: ${error.message}`);
    }
}

/**
 * Generate improved resume PDF content
 */
async function generateResumePdf({ resume, jobDescription, selfDescription }){
    const prompt = `Based on the candidate's resume, self description, and job description, create an improved resume that better matches the job requirements.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Return a markdown formatted resume that highlights relevant skills and experience.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        })

        const improvedResume = response.text;
        return improvedResume;
    } catch (error) {
        console.error("Error in generateResumePdf:", error);
        throw new Error(`Failed to generate resume: ${error.message}`);
    }
}

module.exports = { generateInterviewReport, generateResumePdf };
