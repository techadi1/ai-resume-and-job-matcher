require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Job = require('./models/Job');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_resume_job_matcher';
const JOBS_FILE_PATH = path.resolve(__dirname, '../data/jobs.json');

const seedJobs = async () => {
  try {
    console.log('[Seed Script] Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('[Seed Script] Connected to MongoDB.');

    if (!fs.existsSync(JOBS_FILE_PATH)) {
      throw new Error(`Jobs dataset file not found at: ${JOBS_FILE_PATH}`);
    }

    const rawData = fs.readFileSync(JOBS_FILE_PATH, 'utf-8');
    const jobsList = JSON.parse(rawData);
    console.log(`[Seed Script] Loaded ${jobsList.length} jobs from data/jobs.json`);

    // Remove existing jobs and re-seed clean set
    const deleteResult = await Job.deleteMany({});
    console.log(`[Seed Script] Cleared ${deleteResult.deletedCount} existing job records.`);

    const insertedJobs = await Job.insertMany(jobsList);
    console.log(`[Seed Script] Successfully seeded ${insertedJobs.length} jobs into MongoDB.`);

    process.exit(0);
  } catch (err) {
    console.error('[Seed Script Error]:', err.message);
    process.exit(1);
  }
};

seedJobs();
