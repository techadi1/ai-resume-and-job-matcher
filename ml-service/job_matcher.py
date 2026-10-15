"""
AI Job Matcher Module
Production ML-driven matching engine using:
1. Pre-fitted TF-IDF Vector Space Model (saved artifact from Kaggle corpus)
2. Cosine Similarity between Resume & Job text representations
3. Canonical Skill Vocabulary extraction and overlap evaluation
4. Candidate vs Job Experience requirements parsing and scoring
5. Composite Multi-Factor Match Score: 40% Text Similarity + 40% Skill Match + 20% Experience
"""

import os
import re
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from skill_extractor import extract_skills, get_skill_recommendation_details

logger = logging.getLogger("job_matcher")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(SCRIPT_DIR, "models")
TFIDF_MODEL_PATH = os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl")
SKILL_VOCAB_PATH = os.path.join(MODELS_DIR, "skill_vocabulary.json")

# Default algorithm weights
DEFAULT_WEIGHTS = {
    "text_similarity": 0.40,
    "skill_match": 0.40,
    "experience_relevance": 0.20
}

# In-memory cached artifacts
_TFIDF_VECTORIZER: Optional[TfidfVectorizer] = None
_SKILL_VOCABULARY: Optional[Dict[str, Any]] = None


def load_skill_vocabulary() -> Dict[str, Any]:
    global _SKILL_VOCABULARY
    if _SKILL_VOCABULARY is None:
        if os.path.exists(SKILL_VOCAB_PATH):
            try:
                with open(SKILL_VOCAB_PATH, "r", encoding="utf-8") as f:
                    _SKILL_VOCABULARY = json.load(f)
                logger.info(f"Loaded canonical skill vocabulary from: {SKILL_VOCAB_PATH}")
            except Exception as e:
                logger.warning(f"Error reading skill vocabulary file: {e}")
                _SKILL_VOCABULARY = {"aliases": {}, "categories": {}}
        else:
            _SKILL_VOCABULARY = {"aliases": {}, "categories": {}}
    return _SKILL_VOCABULARY


def load_tfidf_vectorizer() -> TfidfVectorizer:
    """
    Loads the pre-trained TF-IDF vectorizer artifact from disk.
    If not yet trained, initializes a fallback vectorizer and logs a warning.
    """
    global _TFIDF_VECTORIZER
    if _TFIDF_VECTORIZER is None:
        if os.path.exists(TFIDF_MODEL_PATH):
            try:
                _TFIDF_VECTORIZER = joblib.load(TFIDF_MODEL_PATH)
                logger.info(f"Loaded pre-trained TF-IDF vectorizer artifact from: {TFIDF_MODEL_PATH}")
            except Exception as e:
                logger.error(f"Failed to load TF-IDF model from {TFIDF_MODEL_PATH}: {e}")
                _TFIDF_VECTORIZER = _create_fallback_vectorizer()
        else:
            logger.warning(f"TF-IDF model not found at {TFIDF_MODEL_PATH}. Initializing fallback vectorizer.")
            _TFIDF_VECTORIZER = _create_fallback_vectorizer()
    return _TFIDF_VECTORIZER


def reload_models() -> Dict[str, Any]:
    """Reloads TF-IDF vectorizer and skill vocabulary artifacts from disk."""
    global _TFIDF_VECTORIZER, _SKILL_VOCABULARY
    _TFIDF_VECTORIZER = None
    _SKILL_VOCABULARY = None
    vec = load_tfidf_vectorizer()
    vocab = load_skill_vocabulary()
    return {
        "reloaded": True,
        "vocabularySize": len(vec.vocabulary_) if hasattr(vec, "vocabulary_") else 0,
        "skillCount": vocab.get("totalSkills", 0)
    }


def _create_fallback_vectorizer() -> TfidfVectorizer:
    vec = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        sublinear_tf=True
    )
    # Fit on basic seed terminology
    seed = [
        "python javascript react node sql docker kubernetes aws java c++ software engineer developer",
        "data science machine learning deep learning natural language processing ai postgresql mongodb"
    ]
    vec.fit(seed)
    return vec


def normalize_skill_name(skill: str) -> str:
    """Normalizes skill aliases to canonical form based on vocabulary."""
    if not skill:
        return ""
    clean = str(skill).strip()
    vocab = load_skill_vocabulary()
    aliases = vocab.get("aliases", {})
    lower = clean.lower()
    return aliases.get(lower, clean)


def calculate_text_similarity(resume_text: Any, job_text: Any) -> float:
    """
    Transforms resume text and job description using the PRE-TRAINED TF-IDF Vectorizer
    and computes Cosine Similarity.
    Returns score normalized between 0.0 and 1.0.
    """
    if not resume_text or not job_text:
        return 0.0

    resume_str = str(resume_text).strip()
    job_str = str(job_text).strip()

    if not resume_str or not job_str:
        return 0.0

    try:
        vectorizer = load_tfidf_vectorizer()
        r_vec = vectorizer.transform([resume_str])
        j_vec = vectorizer.transform([job_str])

        sim_matrix = cosine_similarity(r_vec, j_vec)
        score = float(sim_matrix[0][0])
        if np.isnan(score):
            score = 0.0
        return round(max(0.0, min(1.0, score)), 4)
    except Exception as e:
        logger.warning(f"Error computing TF-IDF cosine similarity: {e}. Falling back to token overlap.")
        r_words = set(re.findall(r'\b[a-zA-Z0-9_+#.-]{2,}\b', resume_str.lower()))
        j_words = set(re.findall(r'\b[a-zA-Z0-9_+#.-]{2,}\b', job_str.lower()))
        if not j_words:
            return 0.0
        return round(len(r_words.intersection(j_words)) / len(j_words), 4)


def calculate_skill_match(
    resume_skills: Optional[List[str]],
    required_skills: Optional[List[str]],
    preferred_skills: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Calculates skill match percentage, matched skills, and missing skills.
    Normalizes aliases to prevent duplicate representations (e.g. ReactJS -> React).
    """
    raw_res = resume_skills or []
    raw_req = required_skills or []
    raw_pref = preferred_skills or []

    # Normalize to canonical names
    res_normalized = {normalize_skill_name(s) for s in raw_res if s}
    res_normalized.discard("")
    res_lookup = {s.lower(): s for s in res_normalized}

    req_normalized = {normalize_skill_name(s) for s in raw_req if s}
    req_normalized.discard("")

    pref_normalized = {normalize_skill_name(s) for s in raw_pref if s}
    pref_normalized.discard("")

    matched_req = [s for s in req_normalized if s.lower() in res_lookup]
    missing_req = [s for s in req_normalized if s.lower() not in res_lookup]

    matched_pref = [s for s in pref_normalized if s.lower() in res_lookup]
    missing_pref = [s for s in pref_normalized if s.lower() not in res_lookup]

    if req_normalized:
        req_ratio = len(matched_req) / len(req_normalized)
    else:
        req_ratio = 1.0

    if pref_normalized:
        pref_ratio = len(matched_pref) / len(pref_normalized)
        skill_score = (0.75 * req_ratio) + (0.25 * pref_ratio)
    else:
        skill_score = req_ratio

    matched_all = list(dict.fromkeys(matched_req + matched_pref))
    missing_all = list(dict.fromkeys(missing_req + missing_pref))

    return {
        "skillScore": round(max(0.0, min(1.0, skill_score)), 4),
        "matchedSkills": matched_all,
        "missingSkills": missing_all,
        "missingRequiredSkills": missing_req,
        "matchedCount": len(matched_all),
        "requiredCount": len(req_normalized)
    }


def extract_candidate_years_of_experience(resume_text: str) -> Optional[int]:
    """Extracts candidate years of experience from resume text."""
    if not resume_text:
        return None
    matches = re.findall(r'(\d+)\+?\s*(?:years?|yrs?)(?:\s+of\s+experience)?', resume_text, re.IGNORECASE)
    if matches:
        return max([int(m) for m in matches])
    return None


def extract_job_required_experience_years(job_experience_str: str, job_text: str = "") -> Optional[int]:
    """Extracts job required experience in years."""
    combined = f"{job_experience_str} {job_text}".lower()
    matches = re.findall(r'(\d+)\+?\s*(?:years?|yrs?)', combined)
    if matches:
        return min([int(m) for m in matches])
    if "intern" in combined or "entry" in combined:
        return 0
    if "senior" in combined or "lead" in combined:
        return 5
    if "mid" in combined:
        return 3
    return None


def calculate_experience_match(resume_text: Any, job_experience_req: Any, job_full_text: str = "") -> float:
    """
    Extracts experience requirements from job descriptions and candidate experience from resume.
    Returns experience score between 0.0 and 1.0.
    Uses documented fallback if experience cannot be reliably extracted.
    """
    resume_str = str(resume_text or "")
    cand_exp = extract_candidate_years_of_experience(resume_str)
    req_exp = extract_job_required_experience_years(str(job_experience_req or ""), job_full_text)

    # Documented fallbacks
    if req_exp is None and cand_exp is None:
        return 0.75  # Both unspecified -> standard median baseline
    if req_exp is None and cand_exp is not None:
        return 0.85  # Candidate has experience, job has no strict requirement
    if req_exp == 0:
        return 1.0   # Entry level role

    # Job has a required experience number
    if cand_exp is None:
        # Candidate experience not explicitly stated as 'X years'
        # Check seniority keywords in resume
        res_lower = resume_str.lower()
        if req_exp <= 2:
            return 0.70
        elif req_exp <= 5:
            return 0.55 if any(k in res_lower for k in ["engineer", "developer", "analyst"]) else 0.40
        else:
            return 0.35

    # Both candidate and job years known
    if cand_exp >= req_exp:
        return 1.0
    return round(max(0.1, cand_exp / req_exp), 4)


def match_job(resume_data: Dict[str, Any], job_data: Dict[str, Any], weights: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
    """
    Calculates comprehensive job match metrics between a resume and a single job record.
    Final Match Score = 40% Text Similarity + 40% Skill Match + 20% Experience Match
    """
    if not isinstance(resume_data, dict):
        resume_data = {}
    if not isinstance(job_data, dict):
        job_data = {}

    w = weights or DEFAULT_WEIGHTS
    w_text = w.get("text_similarity", 0.40)
    w_skill = w.get("skill_match", 0.40)
    w_exp = w.get("experience_relevance", 0.20)

    resume_text = str(resume_data.get("extractedText") or resume_data.get("resumeText") or "")
    raw_resume_skills = resume_data.get("skills") or []
    if isinstance(raw_resume_skills, list):
        resume_skills = [str(s) for s in raw_resume_skills if s]
    elif isinstance(raw_resume_skills, str):
        resume_skills = [s.strip() for s in raw_resume_skills.split(",") if s.strip()]
    else:
        resume_skills = []

    # If no skills passed explicitly, extract from resume_text
    if not resume_skills and resume_text:
        resume_skills = extract_skills(resume_text)

    job_title = str(job_data.get("title") or job_data.get("job_title") or "")
    job_desc = str(job_data.get("description") or job_data.get("job_description") or "")

    raw_req = job_data.get("requiredSkills") or job_data.get("skills") or []
    if isinstance(raw_req, list):
        required_skills = [str(s) for s in raw_req if s]
    elif isinstance(raw_req, str):
        required_skills = [s.strip() for s in raw_req.split(",") if s.strip()]
    else:
        required_skills = []

    # If no required skills passed, extract from job description
    if not required_skills and (job_desc or job_title):
        required_skills = extract_skills(f"{job_title}\n{job_desc}")

    raw_pref = job_data.get("preferredSkills") or []
    if isinstance(raw_pref, list):
        preferred_skills = [str(s) for s in raw_pref if s]
    elif isinstance(raw_pref, str):
        preferred_skills = [s.strip() for s in raw_pref.split(",") if s.strip()]
    else:
        preferred_skills = []

    experience_req = str(job_data.get("experience") or "")
    combined_job_text = f"{job_title}\n{job_desc}\n{' '.join(required_skills)}"

    # 1. TF-IDF Cosine Similarity (0.0 to 1.0)
    raw_text_sim = calculate_text_similarity(resume_text, combined_job_text)
    similarity_score_100 = round(raw_text_sim * 100, 1)

    # 2. Skill Match (0.0 to 1.0)
    skill_eval = calculate_skill_match(resume_skills, required_skills, preferred_skills)
    skill_score_100 = round(skill_eval["skillScore"] * 100, 1)

    # 3. Experience Match (0.0 to 1.0)
    raw_exp_score = calculate_experience_match(resume_text, experience_req, combined_job_text)
    exp_score_100 = round(raw_exp_score * 100, 1)

    # 4. Final Composite Match Score
    final_score = (w_text * similarity_score_100) + (w_skill * skill_score_100) + (w_exp * exp_score_100)
    final_score = round(max(0.0, min(100.0, final_score)), 1)
    match_percentage = int(round(final_score))

    raw_id = job_data.get("_id") or job_data.get("id") or job_data.get("jobId") or ""
    if isinstance(raw_id, dict):
        job_id = str(raw_id.get("$oid", raw_id))
    else:
        job_id = str(raw_id)

    return {
        "jobId": job_id,
        "title": job_title or "Position Title",
        "company": str(job_data.get("company") or ""),
        "location": str(job_data.get("location") or ""),
        "type": str(job_data.get("type") or job_data.get("jobType") or "Full-time"),
        "salary": str(job_data.get("salary") or ""),
        "experience": experience_req,
        "matchPercentage": match_percentage,
        "similarityScore": int(round(similarity_score_100)),
        "textSimilarity": int(round(similarity_score_100)),
        "skillScore": int(round(skill_score_100)),
        "experienceScore": int(round(exp_score_100)),
        "matchedSkills": skill_eval["matchedSkills"],
        "missingSkills": skill_eval["missingSkills"],
        "missingRequiredSkills": skill_eval["missingRequiredSkills"],
        "algorithmVersion": "tfidf-v1"
    }


def match_all_jobs(resume_data: Dict[str, Any], jobs: List[Dict[str, Any]], weights: Optional[Dict[str, float]] = None) -> List[Dict[str, Any]]:
    """
    Ranks and matches all jobs against the parsed resume.
    Sorted by match percentage descending.
    """
    if not jobs or not isinstance(jobs, list):
        return []
    results = [match_job(resume_data, job, weights) for job in jobs if isinstance(job, dict)]
    return sorted(results, key=lambda x: x.get("matchPercentage", 0), reverse=True)


def analyze_skill_gap(resume_skills: List[str], matched_jobs: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Conducts Skill Gap Analysis across the user's top recommended jobs.
    Ranks missing skills by frequency and importance, and provides curated learning paths.
    """
    if not matched_jobs or not isinstance(matched_jobs, list):
        return {
            "totalMissingSkills": 0,
            "topMissingSkills": [],
            "recommendedSkills": []
        }

    missing_freq: Dict[str, int] = {}
    missing_job_titles: Dict[str, List[str]] = {}

    top_jobs = matched_jobs[:10]

    for job in top_jobs:
        if not isinstance(job, dict):
            continue
        raw_missing = job.get("missingSkills") or []
        job_title = str(job.get("title") or "Recommended Role")

        for skill in raw_missing:
            if not skill:
                continue
            skill_name = str(skill)
            missing_freq[skill_name] = missing_freq.get(skill_name, 0) + 1
            if skill_name not in missing_job_titles:
                missing_job_titles[skill_name] = []
            if job_title not in missing_job_titles[skill_name]:
                missing_job_titles[skill_name].append(job_title)

    sorted_missing = sorted(missing_freq.items(), key=lambda x: x[1], reverse=True)

    recommendations = []
    for skill, freq in sorted_missing[:8]:
        meta = get_skill_recommendation_details(skill)
        recommendations.append({
            "skill": skill,
            "frequency": freq,
            "priority": "HIGH" if freq >= 3 else ("MEDIUM" if freq >= 2 else "LOW"),
            "category": meta.get("category", "Technical"),
            "whyMatters": meta.get("whyMatters", f"Required by {freq} of your top matching jobs."),
            "jobsRequiring": missing_job_titles.get(skill, [])[:3],
            "learningPath": meta.get("learningPath", [])
        })

    return {
        "totalMissingSkills": len(sorted_missing),
        "topMissingSkills": [s[0] for s in sorted_missing[:10]],
        "recommendedSkills": recommendations
    }
