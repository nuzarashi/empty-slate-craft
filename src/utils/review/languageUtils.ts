// Helper function to detect if text is Japanese
export const isJapaneseText = (text: string): boolean => {
  if (!text) return false;
  
  // Check for Japanese characters (Hiragana, Katakana, Kanji)
  const japaneseRegex = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]/;
  
  // Calculate the ratio of Japanese characters to determine if it's primarily Japanese
  const totalLength = text.length;
  if (totalLength === 0) return false;
  
  const japaneseMatches = text.match(new RegExp(japaneseRegex, 'g'));
  const japaneseCount = japaneseMatches ? japaneseMatches.length : 0;
  
  // If more than 20% of the characters are Japanese, consider it Japanese text
  // Increased from 15% to 20% to be more confident about the detection
  return japaneseCount / totalLength > 0.20;
};

// Detect if review was likely machine-translated already
export const detectMachineTranslated = (text: string): boolean => {
  if (!text) return false;
  
  // Common patterns in machine translations
  const patterns = [
    /\(Translated by Google\)/i,
    /\(Machine Translated\)/i,
    /\(Translated\)/i
  ];
  
  return patterns.some(pattern => pattern.test(text));
};
