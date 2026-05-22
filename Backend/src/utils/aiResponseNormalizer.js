/**
 * AI Response Normalizer Utility
 *
 * PROBLEM: Gemini API sometimes returns malformed JSON where array keys/values are flattened.
 * EXAMPLE: ["question", "What is Redis?", "intention", "To test...", "answer", "..."]
 *
 * SOLUTION: This normalizer transforms malformed responses into valid schema objects.
 */

/**
 * Normalize Interview Report - Main entry point
 * Handles all malformed array patterns and ensures MongoDB schema compliance
 * 
 * @param {Object} rawResponse - Raw AI response with potential malformed arrays
 * @returns {Object} Normalized response ready for MongoDB
 */
function normalizeInterviewReport(rawResponse) {
  if (!rawResponse || typeof rawResponse !== 'object') {
    console.error('[Normalizer] Invalid response type:', typeof rawResponse);
    return getDefaultReport();
  }

  try {
    // Deep clone to avoid mutations
    const response = JSON.parse(JSON.stringify(rawResponse));

    console.log('[Normalizer] Input response:', JSON.stringify(response, null, 2));

    // Ensure root-level fields exist
    response.title = sanitizeString(response.title) || "Interview Preparation";
    response.matchScore = sanitizeNumber(response.matchScore, 0, 100) || 50;

    // Normalize each array field with malformed pattern detection
    response.technicalQuestions = normalizeTechnicalQuestions(response.technicalQuestions);
    response.behavioralQuestions = normalizeBehavioralQuestions(response.behavioralQuestions);
    response.skillGaps = normalizeSkillGaps(response.skillGaps);
    response.preparationPlan = normalizePreparationPlan(response.preparationPlan);

    console.log('[Normalizer] Normalized response:', JSON.stringify(response, null, 2));

    return response;
  } catch (error) {
    console.error('[Normalizer] Error during normalization:', error);
    return getDefaultReport();
  }
}

/**
 * Normalize AI response to ensure proper object structure
 * Handles multiple malformed patterns and converts them to correct format
 * @deprecated Use normalizeInterviewReport instead
 */
function normalizeAIResponse(rawResponse) {
  return normalizeInterviewReport(rawResponse);
}

/**
 * Normalize technical questions array
 * Handles: 
 *   - Correctly formatted object arrays
 *   - Malformed flat arrays ["question", "...", "intention", "...", "answer", "..."]
 *   - Mixed types and missing fields
 */
function normalizeTechnicalQuestions(data) {
  if (!Array.isArray(data)) {
    console.warn('[TechnicalQuestions] Not an array:', typeof data);
    return getDefaultTechnicalQuestions();
  }

  console.log('[TechnicalQuestions] Processing array with', data.length, 'items');

  // Check if array is malformed (contains strings/primitives instead of objects)
  const hasPrimitives = data.some(item => typeof item !== 'object' || item === null);
  
  if (hasPrimitives) {
    console.warn('[TechnicalQuestions] Detected malformed flat array, attempting conversion');
    const converted = convertFlatArrayToObjects(data, ['question', 'intention', 'answer']);
    if (converted.length > 0) {
      return converted;
    }
  }

  // Filter for valid objects
  const validQuestions = data.filter(item =>
    isValidObject(item) &&
    sanitizeString(item.question) &&
    sanitizeString(item.intention) &&
    sanitizeString(item.answer)
  ).map(item => ({
    question: sanitizeString(item.question),
    intention: sanitizeString(item.intention),
    answer: sanitizeString(item.answer)
  }));

  return validQuestions.length > 0 ? validQuestions : getDefaultTechnicalQuestions();
}

/**
 * Normalize behavioral questions array
 */
function normalizeBehavioralQuestions(data) {
  if (!Array.isArray(data)) {
    console.warn('[BehavioralQuestions] Not an array:', typeof data);
    return getDefaultBehavioralQuestions();
  }

  console.log('[BehavioralQuestions] Processing array with', data.length, 'items');

  // Check if array is malformed
  const hasPrimitives = data.some(item => typeof item !== 'object' || item === null);
  
  if (hasPrimitives) {
    console.warn('[BehavioralQuestions] Detected malformed flat array, attempting conversion');
    const converted = convertFlatArrayToObjects(data, ['question', 'intention', 'answer']);
    if (converted.length > 0) {
      return converted;
    }
  }

  const validQuestions = data.filter(item =>
    isValidObject(item) &&
    sanitizeString(item.question) &&
    sanitizeString(item.intention) &&
    sanitizeString(item.answer)
  ).map(item => ({
    question: sanitizeString(item.question),
    intention: sanitizeString(item.intention),
    answer: sanitizeString(item.answer)
  }));

  return validQuestions.length > 0 ? validQuestions : getDefaultBehavioralQuestions();
}

/**
 * Normalize skill gaps array
 */
function normalizeSkillGaps(data) {
  if (!Array.isArray(data)) {
    console.warn('[SkillGaps] Not an array:', typeof data);
    return getDefaultSkillGaps();
  }

  console.log('[SkillGaps] Processing array with', data.length, 'items');

  // Check if array is malformed
  const hasPrimitives = data.some(item => typeof item !== 'object' || item === null);
  
  if (hasPrimitives) {
    console.warn('[SkillGaps] Detected malformed flat array, attempting conversion');
    const converted = convertFlatArrayToObjects(data, ['skill', 'severity']);
    if (converted.length > 0) {
      return converted.map(item => ({
        skill: sanitizeString(item.skill),
        severity: sanitizeSeverity(item.severity)
      }));
    }
  }

  const validGaps = data.filter(item =>
    isValidObject(item) &&
    sanitizeString(item.skill) &&
    sanitizeSeverity(item.severity)
  ).map(item => ({
    skill: sanitizeString(item.skill),
    severity: sanitizeSeverity(item.severity)
  }));

  return validGaps.length > 0 ? validGaps : getDefaultSkillGaps();
}

/**
 * Normalize preparation plan array
 */
function normalizePreparationPlan(data) {
  if (!Array.isArray(data)) {
    console.warn('[PreparationPlan] Not an array:', typeof data);
    return getDefaultPreparationPlan();
  }

  console.log('[PreparationPlan] Processing array with', data.length, 'items');

  // Check if array is malformed
  const hasPrimitives = data.some(item => typeof item !== 'object' || item === null);
  
  if (hasPrimitives) {
    console.warn('[PreparationPlan] Detected malformed flat array, attempting conversion');
    const converted = convertFlatArrayToObjects(data, ['day', 'focus', 'tasks']);
    if (converted.length > 0) {
      return converted.map((item, index) => ({
        day: typeof item.day === 'number' ? item.day : (index + 1),
        focus: sanitizeString(item.focus) || "Review and practice",
        tasks: Array.isArray(item.tasks) ? 
          item.tasks.filter(t => sanitizeString(t)).map(t => sanitizeString(t)) :
          ["Review materials", "Practice exercises"]
      }));
    }
  }

  const validPlans = data.filter(item =>
    isValidObject(item) &&
    typeof item.day === 'number' &&
    sanitizeString(item.focus) &&
    Array.isArray(item.tasks)
  ).map((item, index) => ({
    day: item.day || (index + 1),
    focus: sanitizeString(item.focus),
    tasks: Array.isArray(item.tasks) ?
      item.tasks.filter(t => sanitizeString(t)).map(t => sanitizeString(t)) :
      ["Review materials"]
  }));

  return validPlans.length > 0 ? validPlans : getDefaultPreparationPlan();
}

// ═══════════════════════════════════════════════════════════════════════════
// SANITIZATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert malformed flat array into object array
 * Handles: ["key1", "value1", "key2", "value2", ...]
 * Returns: [{ key1: "value1", key2: "value2" }, ...]
 */
function convertFlatArrayToObjects(flatArray, keyFields) {
  console.log('[Convert] Attempting to convert flat array with fields:', keyFields);
  
  if (!Array.isArray(flatArray) || flatArray.length === 0) {
    return [];
  }

  // If array contains objects, return as-is
  if (flatArray.every(item => typeof item === 'object' && item !== null)) {
    return flatArray;
  }

  const itemsPerObject = keyFields.length;
  const objects = [];

  for (let i = 0; i < flatArray.length; i += itemsPerObject) {
    if (i + itemsPerObject > flatArray.length) {
      console.warn('[Convert] Incomplete object at index', i, '- skipping');
      break;
    }

    const obj = {};
    let isValidObject = true;

    for (let j = 0; j < itemsPerObject; j++) {
      const value = flatArray[i + j];
      const key = keyFields[j];
      
      // Skip if value is not a string or is empty
      if (typeof value !== 'string' || value.trim().length === 0) {
        isValidObject = false;
        break;
      }
      
      obj[key] = value.trim();
    }

    if (isValidObject) {
      objects.push(obj);
      console.log('[Convert] Created object:', JSON.stringify(obj));
    }
  }

  return objects;
}

/**
 * Sanitize string: trim, remove null/undefined, max length
 */
function sanitizeString(value, maxLength = 5000) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.substring(0, maxLength);
}

/**
 * Sanitize number: ensure it's within bounds
 */
function sanitizeNumber(value, min = 0, max = 100) {
  const num = Number(value);
  if (isNaN(num)) return null;
  return Math.max(min, Math.min(max, num));
}

/**
 * Sanitize severity enum
 */
function sanitizeSeverity(value) {
  const validSeverities = ['low', 'medium', 'high'];
  if (typeof value !== 'string') return 'medium';
  const severity = value.toLowerCase().trim();
  return validSeverities.includes(severity) ? severity : 'medium';
}

/**
 * Check if value is valid object (not null, not array, not primitive)
 */
function isValidObject(value) {
  return value !== null &&
         typeof value === 'object' &&
         !Array.isArray(value);
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

function getDefaultTechnicalQuestions() {
  return [{
    question: "How would you approach learning a new technology?",
    intention: "Assess learning ability and problem-solving approach",
    answer: "Break down the technology into components, learn fundamentals first, build small projects, read documentation, and practice with real-world scenarios."
  }];
}

function getDefaultBehavioralQuestions() {
  return [{
    question: "Tell me about a time you faced a technical challenge.",
    intention: "Understand problem-solving and communication skills",
    answer: "Describe a specific challenge, the approach taken, the solution implemented, and the learning outcome."
  }];
}

function getDefaultSkillGaps() {
  return [{
    skill: "Full-stack development",
    severity: "medium"
  }];
}

function getDefaultPreparationPlan() {
  return [
    {
      day: 1,
      focus: "Review fundamentals",
      tasks: ["Review core concepts", "Solve basic problems"]
    },
    {
      day: 2,
      focus: "Practice algorithms",
      tasks: ["LeetCode practice", "Review solutions"]
    },
    {
      day: 3,
      focus: "System design",
      tasks: ["Study design patterns", "Design a system"]
    }
  ];
}

/**
 * Get complete default report when normalization fails
 */
function getDefaultReport() {
  return {
    title: "Interview Preparation",
    matchScore: 50,
    technicalQuestions: getDefaultTechnicalQuestions(),
    behavioralQuestions: getDefaultBehavioralQuestions(),
    skillGaps: getDefaultSkillGaps(),
    preparationPlan: getDefaultPreparationPlan()
  };
}

module.exports = {
  normalizeAIResponse,
  normalizeTechnicalQuestions,
  normalizeBehavioralQuestions,
  normalizeSkillGaps,
  normalizePreparationPlan,
  sanitizeString,
  sanitizeNumber,
  sanitizeSeverity
};
