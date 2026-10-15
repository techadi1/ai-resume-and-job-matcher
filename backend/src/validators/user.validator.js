/**
 * User Profile Input Validation Schemas (Zod)
 */

const { z } = require('zod');

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(25).optional(),
  location: z.string().max(100).optional(),
  education: z.string().max(150).optional(),
  skills: z.array(z.string()).optional(),
  careerInterests: z.array(z.string()).optional(),
});

module.exports = {
  updateProfileSchema,
};
