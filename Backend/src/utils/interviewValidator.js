/**
 * Interview Report Validator Utility
 *
 * Ensures the response matches MongoDB schema before save
 * Prevents schema validation errors from reaching the database
 */

const SCHEMA_RULES = {
  title: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 500
  },
  matchScore: {
    type: 'number',
    required: true,
    min: 0,
    max: 100
  },
  resume: {
    type: 'string',
    required: false,
    maxLength: 50000
  },
  selfDescription: {
    type: 'string',
    required: false,
    maxLength: 5000
  },
  jobDescription: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 10000
  },
  technicalQuestions: {
    type: 'array',
    required: true,
    items: {
      question: { type: 'string', required: true },
      intention: { type: 'string', required: true },
      answer: { type: 'string', required: true }
    },
    minItems: 1
  },
  behavioralQuestions: {
    type: 'array',
    required: true,
    items: {
      question: { type: 'string', required: true },
      intention: { type: 'string', required: true },
      answer: { type: 'string', required: true }
    },
    minItems: 1
  },
  skillGaps: {
    type: 'array',
    required: true,
    items: {
      skill: { type: 'string', required: true },
      severity: { type: 'string', enum: ['low', 'medium', 'high'] }
    },
    minItems: 1
  },
  preparationPlan: {
    type: 'array',
    required: true,
    items: {
      day: { type: 'number', required: true },
      focus: { type: 'string', required: true },
      tasks: { type: 'array', items: 'string', required: true }
    },
    minItems: 1
  }
};

/**
 * Main validation function
 * Returns { isValid: boolean, errors: string[] }
 */
function validateInterviewReport(report) {
  const errors = [];

  if (!report || typeof report !== 'object') {
    errors.push('Report must be a valid object');
    return { isValid: false, errors };
  }

  // Validate each field
  validateField(report, 'title', SCHEMA_RULES.title, errors);
  validateField(report, 'matchScore', SCHEMA_RULES.matchScore, errors);
  validateField(report, 'resume', SCHEMA_RULES.resume, errors);
  validateField(report, 'selfDescription', SCHEMA_RULES.selfDescription, errors);
  validateField(report, 'jobDescription', SCHEMA_RULES.jobDescription, errors);
  validateArrayField(report, 'technicalQuestions', SCHEMA_RULES.technicalQuestions, errors);
  validateArrayField(report, 'behavioralQuestions', SCHEMA_RULES.behavioralQuestions, errors);
  validateArrayField(report, 'skillGaps', SCHEMA_RULES.skillGaps, errors);
  validateArrayField(report, 'preparationPlan', SCHEMA_RULES.preparationPlan, errors);

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate a single field against rules
 */
function validateField(report, fieldName, rules, errors) {
  const value = report[fieldName];

  // Check required
  if (rules.required && (value === undefined || value === null || value === '')) {
    errors.push(`${fieldName} is required`);
    return;
  }

  // Skip validation if not required and missing
  if (!rules.required && (value === undefined || value === null)) {
    return;
  }

  // Check type
  if (rules.type && typeof value !== rules.type) {
    errors.push(`${fieldName} must be of type ${rules.type}, got ${typeof value}`);
    return;
  }

  // Check length constraints for strings
  if (rules.type === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`${fieldName} must be at least ${rules.minLength} characters`);
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${fieldName} exceeds maximum length of ${rules.maxLength}`);
    }
  }

  // Check number constraints
  if (rules.type === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      errors.push(`${fieldName} must be at least ${rules.min}`);
    }
    if (rules.max !== undefined && value > rules.max) {
      errors.push(`${fieldName} must not exceed ${rules.max}`);
    }
  }

  // Check enum values
  if (rules.enum && !rules.enum.includes(value)) {
    errors.push(`${fieldName} must be one of: ${rules.enum.join(', ')}`);
  }
}

/**
 * Validate array fields and their items
 */
function validateArrayField(report, fieldName, rules, errors) {
  const value = report[fieldName];

  // Check required
  if (rules.required && (!Array.isArray(value) || value.length === 0)) {
    errors.push(`${fieldName} is required and must not be empty`);
    return;
  }

  // Skip if not required and missing
  if (!rules.required && !Array.isArray(value)) {
    return;
  }

  // Check if it's an array
  if (!Array.isArray(value)) {
    errors.push(`${fieldName} must be an array`);
    return;
  }

  // Check minimum items
  if (rules.minItems && value.length < rules.minItems) {
    errors.push(`${fieldName} must contain at least ${rules.minItems} item(s)`);
  }

  // Validate array items
  value.forEach((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      errors.push(`${fieldName}[${index}] must be an object`);
      return;
    }

    // Validate item properties
    Object.entries(rules.items).forEach(([propName, propRules]) => {
      if (typeof propRules === 'string') {
        // Handle type-only rules
        if (typeof item[propName] !== propRules) {
          errors.push(
            `${fieldName}[${index}].${propName} must be of type ${propRules}`
          );
        }
      } else {
        // Handle complex rules
        if (propRules.required && !item[propName]) {
          errors.push(`${fieldName}[${index}].${propName} is required`);
        }

        if (propRules.enum && item[propName] && !propRules.enum.includes(item[propName])) {
          errors.push(
            `${fieldName}[${index}].${propName} must be one of: ${propRules.enum.join(', ')}`
          );
        }

        if (propRules.type === 'array' && !Array.isArray(item[propName])) {
          errors.push(`${fieldName}[${index}].${propName} must be an array`);
        }

        if (propRules.type === 'string' && typeof item[propName] !== 'string') {
          if (item[propName] !== undefined) {
            errors.push(
              `${fieldName}[${index}].${propName} must be a string, got ${typeof item[propName]}`
            );
          }
        }

        if (propRules.type === 'number' && typeof item[propName] !== 'number') {
          if (item[propName] !== undefined) {
            errors.push(
              `${fieldName}[${index}].${propName} must be a number, got ${typeof item[propName]}`
            );
          }
        }
      }
    });
  });
}

module.exports = {
  validateInterviewReport,
  validateField,
  validateArrayField
};
