/**
 * Job Input Validation Schemas (Zod)
 */

const { z } = require('zod');

const createJobSchema = z.object({
  title: z.string().min(2, 'Job title is required'),
  company: z.string().min(2, 'Company name is required'),
  location: z.string().min(2, 'Location is required'),
  jobType: z.string().default('Full-time'),
  workMode: z.string().default('Hybrid'),
  salary: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  description: z.string().min(10, 'Job description must be at least 10 characters'),
  responsibilities: z.array(z.string()).default([]),
  requiredSkills: z.array(z.string()).min(1, 'At least one required skill must be specified'),
  preferredSkills: z.array(z.string()).default([]),
  experience: z.string().default('1-3 years'),
  education: z.string().optional(),
  applicationUrl: z.string().optional(),
});

const updateJobSchema = createJobSchema.partial();

const queryJobsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  location: z.string().optional(),
  jobType: z.string().optional(),
  skill: z.string().optional(),
});

module.exports = {
  createJobSchema,
  updateJobSchema,
  queryJobsSchema,
};
