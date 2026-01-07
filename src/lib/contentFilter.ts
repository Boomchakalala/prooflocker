/**
 * Content moderation filter
 * Checks prediction text against denylist of inappropriate content
 */

// Denylist of slurs, hate speech, spam terms (case-insensitive)
const DENYLIST = [
  // Racial slurs
  'nigger', 'nigga', 'chink', 'spic', 'kike', 'wetback', 'gook', 'raghead',
  // Homophobic slurs
  'faggot', 'fag', 'dyke', 'tranny',
  // Sexist slurs
  'cunt', 'whore', 'slut',
  // Hate speech patterns
  'gas the', 'hang the', 'kill all',
  // Spam patterns
  'click here', 'buy now', 'limited time', 'act now',
  'http://', 'https://', 'www.', '.com', '.net', '.org', 'bit.ly', 'tinyurl',
];

// Maximum prediction length (characters)
export const MAX_PREDICTION_LENGTH = 500;

/**
 * Validates prediction text against content policy
 * @param text - The prediction text to validate
 * @returns Object with isValid flag and optional error message
 */
export function validatePredictionContent(text: string): {
  isValid: boolean;
  error?: string;
} {
  // Check if text is empty
  if (!text || text.trim().length === 0) {
    return {
      isValid: false,
      error: 'Prediction text cannot be empty.',
    };
  }

  // Check length
  if (text.length > MAX_PREDICTION_LENGTH) {
    return {
      isValid: false,
      error: `Prediction must be ${MAX_PREDICTION_LENGTH} characters or less.`,
    };
  }

  // Check against denylist (case-insensitive)
  const lowerText = text.toLowerCase();
  for (const term of DENYLIST) {
    if (lowerText.includes(term)) {
      return {
        isValid: false,
        error: 'Content not allowed.',
      };
    }
  }

  return { isValid: true };
}
