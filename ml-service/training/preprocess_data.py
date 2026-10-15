#!/usr/bin/env python3
"""
Data Preprocessing Pipeline for AI Resume Analyzer & Job Matcher
Loads Kaggle Resume and Job Description datasets, inspects and normalizes columns,
cleans text, extracts technical skills, and produces standardized clean datasets.
"""

import os
import re
import json
import logging
from typing import Dict, List, Any, Optional
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("preprocess_data")

# Resolve directories relative to ml-service
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
RAW_DATA_DIR = os.path.join(BASE_DIR, "data", "raw")
PROCESSED_DATA_DIR = os.path.join(BASE_DIR, "data", "processed")
MODELS_DIR = os.path.join(BASE_DIR, "models")
VOCAB_PATH = os.path.join(MODELS_DIR, "skill_vocabulary.json")

os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. Load Skill Vocabulary & Normalization Mappings
# -------------------------------------------------------------
def load_skill_vocab() -> Dict[str, Any]:
    if not os.path.exists(VOCAB_PATH):
        raise FileNotFoundError(f"Skill vocabulary not found at: {VOCAB_PATH}")
    with open(VOCAB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

SKILL_DATA = load_skill_vocab()
ALIASES: Dict[str, str] = {k.lower(): v for k, v in SKILL_DATA.get("aliases", {}).items()}
ALL_CANONICAL_SKILLS: List[str] = sorted(
    list(set(ALIASES.values())),
    key=lambda s: len(s),
    reverse=True  # Match longest compound skills first
)

# -------------------------------------------------------------
# 2. Text Cleaning & Token Normalization
# -------------------------------------------------------------
def clean_text(raw_text: Any) -> str:
    """Cleans raw text while strictly preserving technical tokens (e.g. C++, C#, .NET, Node.js)."""
    if pd.isna(raw_text) or not raw_text:
        return ""
    text = str(raw_text)
    # Remove HTML tags if present
    text = re.sub(r'<[^>]+>', ' ', text)
    # Normalize carriage returns and unicode whitespace
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    text = re.sub(r'[\u2010\u2011\u2012\u2013\u2014\u2015]', '-', text)
    text = re.sub(r'[\u2018\u2019]', "'", text)
    text = re.sub(r'[\u201C\u201D]', '"', text)
    # Remove URLs and email addresses
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
    text = re.sub(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', ' ', text)
    # Normalize multiple whitespace characters
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def extract_skills_from_text(text: str) -> List[str]:
    """Extracts and normalizes technical skills matching canonical vocabulary."""
    if not text:
        return []
    text_lower = text.lower()
    matched_canonical = set()

    # Match aliases and canonical names
    for alias_pattern, canonical_name in ALIASES.items():
        escaped_pattern = re.escape(alias_pattern)
        if alias_pattern in ["c", "r"]:
            pattern = rf"(?i)(?:\b|\s){escaped_pattern}(?:\b|\s|,|;|\.|\))"
        elif alias_pattern in ["c++", "c#", ".net"]:
            pattern = rf"(?i)(?:\b|\s){escaped_pattern}(?:\b|\s|,|;|\))"
        else:
            pattern = rf"(?i)\b{escaped_pattern}\b"
        
        if re.search(pattern, text_lower):
            matched_canonical.add(canonical_name)

    return sorted(list(matched_canonical))

def extract_experience_from_text(text: str) -> str:
    """Extracts experience requirements using regex heuristics."""
    if not text:
        return "Not Specified"
    patterns = [
        r'(?i)(\d+\s*[-–]\s*\d+\s*\+?\s*years?(?:\s+of)?(?:\s+experience)?)',
        r'(?i)(\d+\+?\s*years?(?:\s+of)?(?:\s+experience)?)',
        r'(?i)\b(entry[- ]level|internship|junior|associate|mid[- ]level|senior|lead|principal|director)\b'
    ]
    for p in patterns:
        match = re.search(p, text)
        if match:
            return match.group(0).strip()
    return "Not Specified"

# -------------------------------------------------------------
# 3. Resume Dataset Preprocessing
# -------------------------------------------------------------
def preprocess_resumes(raw_csv_path: str, output_csv_path: str) -> pd.DataFrame:
    logger.info(f"Loading raw resume dataset from: {raw_csv_path}")
    df = pd.read_csv(raw_csv_path)
    logger.info(f"Raw resume dataset columns: {df.columns.tolist()} (Total: {len(df)} records)")

    # Normalize column names
    col_map = {}
    for col in df.columns:
        norm = col.strip().lower()
        if "resume" in norm or "text" in norm:
            col_map[col] = "resume_text"
        elif "category" in norm or "class" in norm or "label" in norm:
            col_map[col] = "category"
    df.rename(columns=col_map, inplace=True)

    if "resume_text" not in df.columns:
        # Fallback to largest text column
        text_cols = [c for c in df.columns if df[c].dtype == object]
        df["resume_text"] = df[text_cols[0]]

    if "category" not in df.columns:
        df["category"] = "General Tech"

    # Drop missing values and duplicates
    initial_count = len(df)
    df.dropna(subset=["resume_text"], inplace=True)
    df["resume_text"] = df["resume_text"].astype(str).apply(clean_text)
    df = df[df["resume_text"].str.len() >= 50]
    df.drop_duplicates(subset=["resume_text"], inplace=True)
    df.reset_index(drop=True, inplace=True)
    logger.info(f"Cleaned resumes: {initial_count} -> {len(df)} unique records")

    # Generate standard fields
    df["resume_id"] = [f"res_{i+1:04d}" for i in range(len(df))]
    logger.info("Extracting and normalizing technical skills for resumes...")
    df["skills"] = df["resume_text"].apply(extract_skills_from_text)
    df["skills_str"] = df["skills"].apply(lambda s: ", ".join(s))

    output_df = df[["resume_id", "category", "skills_str", "resume_text"]].rename(columns={"skills_str": "skills"})
    output_df.to_csv(output_csv_path, index=False)
    logger.info(f"Saved cleaned resumes to: {output_csv_path} (Shape: {output_df.shape})")
    return output_df

# -------------------------------------------------------------
# 4. Job Dataset Preprocessing
# -------------------------------------------------------------
def preprocess_jobs(raw_csv_path: str, output_csv_path: str) -> pd.DataFrame:
    logger.info(f"Loading raw job posting dataset from: {raw_csv_path}")
    df = pd.read_csv(raw_csv_path)
    logger.info(f"Raw jobs dataset columns: {df.columns.tolist()} (Total: {len(df)} records)")

    # Detect title and description columns
    title_col = None
    desc_col = None
    company_col = None

    for col in df.columns:
        norm = col.strip().lower()
        if "title" in norm or "role" in norm or "position" in norm:
            title_col = col
        elif "body" in norm or "desc" in norm or "description" in norm or "summary" in norm:
            if not desc_col:
                desc_col = col
        elif "company" in norm or "org" in norm:
            company_col = col

    if not title_col:
        title_col = df.columns[0]
    if not desc_col:
        desc_col = df.columns[1]

    df["job_title"] = df[title_col].fillna("Software Professional").astype(str).apply(clean_text)
    df["job_description"] = df[desc_col].fillna("").astype(str).apply(clean_text)
    df["company"] = df[company_col].fillna("Tech Enterprise").astype(str) if company_col else "Tech Enterprise"

    # Drop missing and empty descriptions
    initial_count = len(df)
    df = df[df["job_description"].str.len() >= 40]
    df.drop_duplicates(subset=["job_title", "job_description"], inplace=True)
    df.reset_index(drop=True, inplace=True)
    logger.info(f"Cleaned jobs: {initial_count} -> {len(df)} unique records")

    df["job_id"] = [f"job_{i+1:04d}" for i in range(len(df))]
    
    # Extract skills and experience from title + description
    combined_texts = df["job_title"] + "\n" + df["job_description"]
    df["skills"] = combined_texts.apply(extract_skills_from_text)
    df["skills_str"] = df["skills"].apply(lambda s: ", ".join(s))
    df["experience"] = df["job_description"].apply(extract_experience_from_text)
    
    # Derive category heuristic
    def derive_category(title: str) -> str:
        t = title.lower()
        if "data" in t or "ml" in t or "ai" in t or "scientist" in t:
            return "Data Science & AI"
        if "devops" in t or "cloud" in t or "sre" in t or "infrastructure" in t:
            return "DevOps & Cloud"
        if "frontend" in t or "ui" in t or "web" in t:
            return "Frontend Development"
        if "backend" in t or "api" in t or "server" in t:
            return "Backend Development"
        if "full stack" in t or "fullstack" in t:
            return "Full Stack Development"
        if "qa" in t or "test" in t:
            return "Quality Assurance"
        return "Software Engineering"

    df["category"] = df["job_title"].apply(derive_category)

    output_df = df[["job_id", "job_title", "company", "category", "experience", "skills_str", "job_description"]].rename(columns={"skills_str": "skills"})
    output_df.to_csv(output_csv_path, index=False)
    logger.info(f"Saved cleaned jobs to: {output_csv_path} (Shape: {output_df.shape})")
    return output_df

# -------------------------------------------------------------
# 5. Feature Summary Export
# -------------------------------------------------------------
def export_feature_summary(resumes_df: pd.DataFrame, jobs_df: pd.DataFrame, output_path: str):
    summary_data = [
        {"metric": "total_resumes", "value": len(resumes_df)},
        {"metric": "resume_categories_count", "value": resumes_df["category"].nunique()},
        {"metric": "total_jobs", "value": len(jobs_df)},
        {"metric": "job_categories_count", "value": jobs_df["category"].nunique()},
        {"metric": "canonical_skills_vocab_size", "value": len(ALL_CANONICAL_SKILLS)},
        {"metric": "avg_skills_per_resume", "value": round(resumes_df["skills"].apply(lambda s: len(s.split(", ")) if s else 0).mean(), 2)},
        {"metric": "avg_skills_per_job", "value": round(jobs_df["skills"].apply(lambda s: len(s.split(", ")) if s else 0).mean(), 2)},
    ]
    feat_df = pd.DataFrame(summary_data)
    feat_df.to_csv(output_path, index=False)
    logger.info(f"Saved features summary to: {output_path}")

def main():
    raw_resumes = os.path.join(RAW_DATA_DIR, "resumes.csv")
    raw_jobs = os.path.join(RAW_DATA_DIR, "jobs.csv")
    proc_resumes = os.path.join(PROCESSED_DATA_DIR, "resumes_clean.csv")
    proc_jobs = os.path.join(PROCESSED_DATA_DIR, "jobs_clean.csv")
    features_csv = os.path.join(PROCESSED_DATA_DIR, "features.csv")

    resumes_df = preprocess_resumes(raw_resumes, proc_resumes)
    jobs_df = preprocess_jobs(raw_jobs, proc_jobs)
    export_feature_summary(resumes_df, jobs_df, features_csv)
    logger.info("Dataset preprocessing completed successfully.")

if __name__ == "__main__":
    main()
