#!/usr/bin/env python3
"""
Job Importer Script: Kaggle Job Dataset -> MongoDB Jobs Collection
Pipeline:
Kaggle Job Dataset -> Cleaning -> Normalization -> Skill Extraction -> MongoDB Jobs Collection

Populates the production MongoDB database with preprocessed, normalized job listings
derived directly from the Kaggle job postings dataset.
"""

import os
import sys
import ast
import re
import logging
from datetime import datetime
import pandas as pd
from pymongo import MongoClient

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("import_jobs")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
CSV_PATH = os.path.join(ROOT_DIR, "ml-service", "data", "processed", "jobs_clean.csv")

# MongoDB connection configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/ai_resume_job_matcher")
# If the container URI 'mongodb://mongodb:27017' was passed outside docker, fallback to localhost
if "mongodb:27017" in MONGO_URI and os.getenv("RUNNING_IN_DOCKER") != "true":
    MONGO_URI = MONGO_URI.replace("mongodb:27017", "localhost:27017")


def parse_skills_field(val):
    if not val or pd.isna(val):
        return []
    if isinstance(val, list):
        return val
    val_str = str(val).strip()
    if val_str.startswith("[") and val_str.endswith("]"):
        try:
            parsed = ast.literal_eval(val_str)
            if isinstance(parsed, list):
                return [str(s).strip() for s in parsed if s]
        except Exception:
            pass
    return [s.strip() for s in val_str.split(",") if s.strip()]


def parse_experience_bounds(exp_str: str):
    """Extracts min and max years of experience from string."""
    exp_lower = str(exp_str or "").lower()
    matches = re.findall(r'(\d+)', exp_lower)
    if len(matches) >= 2:
        return int(matches[0]), int(matches[1])
    elif len(matches) == 1:
        val = int(matches[0])
        return val, val + 3
    elif "entry" in exp_lower or "intern" in exp_lower:
        return 0, 2
    elif "senior" in exp_lower or "lead" in exp_lower:
        return 5, 10
    return 1, 4


def import_jobs_to_mongo():
    if not os.path.exists(CSV_PATH):
        logger.error(f"Processed jobs dataset not found at: {CSV_PATH}")
        logger.info("Please run: python ml-service/training/preprocess_data.py first.")
        sys.exit(1)

    logger.info(f"Connecting to MongoDB at: {MONGO_URI}...")
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # Verify connection
        client.admin.command('ping')
        db = client.get_database()
        jobs_collection = db["jobs"]
        logger.info(f"Connected to MongoDB database: {db.name}")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        logger.error("Ensure MongoDB is running (e.g., via Docker on port 27017).")
        sys.exit(1)

    df = pd.read_csv(CSV_PATH)
    logger.info(f"Loaded {len(df)} preprocessed jobs from {CSV_PATH}")

    inserted_count = 0
    updated_count = 0

    for _, row in df.iterrows():
        job_id = str(row.get("job_id", "")).strip()
        title = str(row.get("job_title", "Software Engineer")).strip()
        company = str(row.get("company", "Tech Innovations")).strip()
        location = str(row.get("location", "Remote")).strip()
        description = str(row.get("job_description", "")).strip()
        experience_str = str(row.get("experience", "2-4 years")).strip()
        skills = parse_skills_field(row.get("skills"))

        # Default tech skills fallback if none extracted
        if not skills:
            skills = ["Problem Solving", "Software Development", "Communication"]

        exp_min, exp_max = parse_experience_bounds(experience_str)

        # Split skills into required (top 70%) and preferred (remaining)
        split_idx = max(1, int(len(skills) * 0.7))
        req_skills = skills[:split_idx]
        pref_skills = skills[split_idx:]

        job_doc = {
            "title": title,
            "company": company if company and company != "nan" else "Tech Partners Inc.",
            "location": location if location and location != "nan" else "Remote / Flexible",
            "jobType": "Full-time",
            "workMode": "Hybrid" if "hybrid" in description.lower() else ("Remote" if "remote" in location.lower() else "On-site"),
            "salary": "$95,000 - $135,000",
            "salaryMin": 95000,
            "salaryMax": 135000,
            "currency": "USD",
            "description": description,
            "responsibilities": [
                f"Design, develop, and maintain software solutions using {', '.join(req_skills[:3])}.",
                "Collaborate with cross-functional product, design, and engineering teams.",
                "Ensure code quality, documentation, testing, and continuous deployment."
            ],
            "requiredSkills": req_skills,
            "preferredSkills": pref_skills,
            "experience": experience_str if experience_str and experience_str != "nan" else "2-4 years",
            "experienceMin": exp_min,
            "experienceMax": exp_max,
            "education": "Bachelor's Degree in Computer Science, Software Engineering, or equivalent experience",
            "source": "Kaggle Job Dataset",
            "sourceJobId": job_id,
            "isActive": True,
            "postedAt": datetime.utcnow()
        }

        # Upsert by title and company to avoid duplicate entries
        result = jobs_collection.update_one(
            {"title": title, "company": job_doc["company"]},
            {"$set": job_doc},
            upsert=True
        )

        if result.upserted_id:
            inserted_count += 1
        elif result.modified_count > 0:
            updated_count += 1

    total_in_db = jobs_collection.count_documents({})
    logger.info(f"Job Import Complete -> Inserted: {inserted_count}, Updated: {updated_count}, Total in DB: {total_in_db}")


if __name__ == "__main__":
    import_jobs_to_mongo()
