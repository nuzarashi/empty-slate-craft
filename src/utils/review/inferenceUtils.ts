
// Infer cuisine from text when no explicit mention is found
export const inferCuisine = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  if (/pasta|pizza|italian|lasagna|risotto|gelato/i.test(lowerText)) return 'Italian';
  if (/sushi|ramen|japanese|tempura|sashimi|teriyaki/i.test(lowerText)) return 'Japanese';
  if (/taco|burrito|mexican|enchilada|quesadilla|salsa/i.test(lowerText)) return 'Mexican';
  if (/curry|indian|naan|tikka|masala|samosa/i.test(lowerText)) return 'Indian';
  if (/stir-fry|chinese|dimsum|dumpling|wonton|spring roll/i.test(lowerText)) return 'Chinese';
  if (/burger|fries|american|sandwich|steak|bbq/i.test(lowerText)) return 'American';
  if (/hummus|falafel|mediterranean|kebab|shawarma|pita/i.test(lowerText)) return 'Mediterranean';
  
  // Default fallback
  return 'Local cuisine';
};

// Infer atmosphere from text when no explicit mention is found
export const inferAtmosphere = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  if (/fancy|elegant|upscale|classy|sophisticated|luxury/i.test(lowerText)) return 'Elegant';
  if (/casual|relaxed|laid-back|chill|informal/i.test(lowerText)) return 'Casual';
  if (/cozy|intimate|warm|comfortable|homey/i.test(lowerText)) return 'Cozy';
  if (/noisy|loud|busy|crowded|energetic|vibrant/i.test(lowerText)) return 'Lively';
  if (/quiet|peaceful|calm|tranquil|serene/i.test(lowerText)) return 'Quiet';
  if (/modern|trendy|hip|stylish|chic/i.test(lowerText)) return 'Modern';
  if (/traditional|authentic|classic|old-school/i.test(lowerText)) return 'Traditional';
  if (/family|kid|child/i.test(lowerText)) return 'Family-friendly';
  
  // Default fallback
  return 'Casual';
};

// Infer service from text when no explicit mention is found
export const inferService = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  if (/friendly|welcoming|kind|nice|pleasant/i.test(lowerText)) return 'Friendly';
  if (/attentive|helpful|responsive|efficient/i.test(lowerText)) return 'Attentive';
  if (/slow|waited|long time|forever/i.test(lowerText)) return 'Slow';
  if (/fast|quick|speedy|prompt|rapid/i.test(lowerText)) return 'Quick';
  if (/rude|unfriendly|impolite|disrespectful/i.test(lowerText)) return 'Unfriendly';
  if (/professional|polished|courteous/i.test(lowerText)) return 'Professional';
  
  // Default fallback
  return 'Standard';
};
