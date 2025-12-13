// Auto-generate product descriptions based on category and type
// Contains unique templates with emojis and phrasing for each category-type combination

const DESCRIPTION_TEMPLATES = {
  Fish: {
    Uncleaned:
      'Fresh 🐟 [category] selected daily for great taste and quality you can trust. Kept whole for better flavour and freshness. Perfect for simple fry or healthy home cooking 🍽️.',
    Cleaned:
      'Premium cleaned 🐟 [category] ready to cook, professionally scaled and gutted for convenience. Kept whole to preserve authentic flavour and natural juices. Ideal for grilling, frying or traditional recipes 🍽️.',
  },
  Shrimp: {
    Uncleaned:
      'Fresh 🦐 [category] harvested daily with natural sweetness intact. Unpeeled with heads on to lock in authentic ocean flavour and tenderness. Perfect for curries, fries and traditional preparations 🍽️.',
    Cleaned:
      'Succulent cleaned 🦐 [category] expertly prepared and deveined for easy cooking. Each piece carefully handled to maintain premium quality and delicate taste. Ready for quick stir-fries, grilling or gourmet dishes 🍽️.',
  },
  Crab: {
    Uncleaned:
      'Live fresh 🦀 [category] sourced daily for maximum flavour and nutrition. Whole and energetic, perfect for those seeking authentic taste and quality assurance. Ideal for traditional boiling or specialty recipes 🍽️.',
    Cleaned:
      'Pre-cleaned 🦀 [category] saves you time without compromising on taste. Expertly processed to remove shell while maintaining succulent meat quality. Perfect for quick cooking, salads or premium seafood dishes 🍽️.',
  },
  Lobster: {
    Uncleaned:
      'Premium live 🦞 [category] delivered fresh from select waters. Whole and pristine, offering maximum meat yield and authentic sweet flavour. Perfect for luxury cooking and special occasions 🍽️.',
    Cleaned:
      'Exquisite cleaned 🦞 [category] prepared by expert hands for restaurant-quality results. Meat preserved perfectly for rich, buttery taste in every bite. Ideal for elegant dining and premium preparations 🍽️.',
  },
  Shellfish: {
    Uncleaned:
      'Fresh 🐚 [category] selected from pristine waters for authentic briny flavour. Whole and natural, perfect for those who appreciate traditional seafood preparation. Excellent for steaming, grilling or gourmet recipes 🍽️.',
    Cleaned:
      'Cleaned 🐚 [category] ready to enjoy without the fuss. Expertly processed to remove shells while preserving delicate meat quality and natural sweetness. Perfect for quick meals and special dishes 🍽️.',
  },
  Accessories: {
    Uncleaned:
      'Essential 🎣 [category] products curated for seafood enthusiasts. Quality tools and accessories to enhance your cooking experience. Perfect for professional and home kitchens alike 🍽️.',
    Cleaned:
      'Premium 🎣 [category] designed for durability and performance. Crafted to make seafood preparation easier and more enjoyable. Perfect for every kitchen adventure 🍽️.',
  },
  Food: {
    Uncleaned:
      'Delicious 🍲 [category] prepared with care and finest ingredients. Traditional recipes meet modern convenience for authentic taste. Perfect for quick meals and family dinners 🍽️.',
    Cleaned:
      'Ready-to-enjoy 🍲 [category] made with premium quality ingredients. Professionally prepared for instant satisfaction without compromising taste. Ideal for busy lifestyles and special occasions 🍽️.',
  },
  Other: {
    Uncleaned:
      'Quality 🌊 [category] selected for exceptional value and versatility. Perfect for various uses and preparations. Enjoy premium taste and reliability 🍽️.',
    Cleaned:
      'Premium 🌊 [category] crafted for the discerning customer. Enhanced quality and preparation for superior results. Ideal for all your needs 🍽️.',
  },
};

/**
 * Generate product description based on category and type
 * @param {string} category - Product category (Fish, Shrimp, Crab, etc.)
 * @param {string} type - Product type (Uncleaned, Cleaned)
 * @returns {string} - Generated description with category name inserted
 */
export const generateDescription = (category, type = 'Uncleaned') => {
  const templates = DESCRIPTION_TEMPLATES[category];

  if (!templates) {
    // Fallback for unknown category
    return `Premium quality 🌊 [category] selected for great taste and quality you can trust. Perfect for your cooking needs. Enjoy authentic flavour and freshness 🍽️.`;
  }

  let description = templates[type] || templates.Uncleaned;

  // Replace [category] placeholder with actual category name
  description = description.replace('[category]', category);

  return description;
};

/**
 * Get all available description templates
 * @returns {object} - All description templates organized by category and type
 */
export const getDescriptionTemplates = () => DESCRIPTION_TEMPLATES;

/**
 * Check if category and type combination exists
 * @param {string} category - Product category
 * @param {string} type - Product type
 * @returns {boolean} - True if combination exists
 */
export const isValidCategoryType = (category, type) => {
  return (
    DESCRIPTION_TEMPLATES[category] && DESCRIPTION_TEMPLATES[category][type]
  );
};

export default {
  generateDescription,
  getDescriptionTemplates,
  isValidCategoryType,
  DESCRIPTION_TEMPLATES,
};
