const { z } = require('zod');

// Schema for the AI response
const aiExtractionSchema = z.object({
  blood_group: z.string().nullable(),
  units_required: z.union([z.string(), z.number()]).nullable(),
  hospital_name: z.string().nullable(),
  hospital_address: z.string().nullable(),
  contact_person: z.string().nullable(),
  priority: z.string().nullable()
});

/**
 * Validates and cleans the AI JSON response using Zod.
 * @param {Object} data Raw parsed JSON from AI
 * @returns {Object} Validated and cleaned data
 */
const validateAIResponse = (data) => {
  try {
    const validatedData = aiExtractionSchema.parse(data);
    
    // Normalize units_required to number
    if (validatedData.units_required) {
      validatedData.units_required = parseInt(validatedData.units_required, 10) || 1;
    } else {
      validatedData.units_required = 1;
    }

    return validatedData;
  } catch (err) {
    console.error("Zod Validation Error:", err.errors);
    throw new Error('AI response validation failed');
  }
};

module.exports = {
  validateAIResponse,
  aiExtractionSchema
};
