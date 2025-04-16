
// Helper function to detect if text is Japanese
export const isJapaneseText = (text: string): boolean => {
  // Check for Japanese characters (Hiragana, Katakana, Kanji)
  const japaneseRegex = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]/;
  return japaneseRegex.test(text);
};
