import os
import json
import logging
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from resume_parser import parse_resume, extract_text
from text_processor import extract_keywords, tokenize_and_lemmatize
from skill_extractor import extract_skills, SKILLS_DICTIONARY
from resume_analyzer import analyze_resume
from job_matcher import (
    match_job,
    match_all_jobs,
    analyze_skill_gap,
    reload_models,
    load_tfidf_vectorizer,
    load_skill_vocabulary
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ml-service")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(SCRIPT_DIR, "models")
METADATA_PATH = os.path.join(MODELS_DIR, "metadata.json")

app = FastAPI(
    title="AI Resume Analyzer & Job Matcher ML Service",
    description="Stateless NLP and Machine Learning service for resume parsing, scoring, and job matching.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request & Response Schemas
class AnalyzeResumeRequest(BaseModel):
    filePath: Optional[str] = None
    rawText: Optional[str] = None
    resumeText: Optional[str] = None


class JobMatchRequest(BaseModel):
    resumeData: Optional[Dict[str, Any]] = None
    resumeText: Optional[str] = None
    job: Dict[str, Any]
    weights: Optional[Dict[str, float]] = None


class BatchJobMatchRequest(BaseModel):
    resumeData: Optional[Dict[str, Any]] = None
    resumeText: Optional[str] = None
    jobs: Optional[List[Dict[str, Any]]] = None
    jobIds: Optional[List[str]] = None
    weights: Optional[Dict[str, float]] = None


class SkillGapRequest(BaseModel):
    resumeSkills: List[str]
    matchedJobs: List[Dict[str, Any]]


@app.on_event("startup")
def startup_event():
    """Pre-loads TF-IDF vectorizer and skill vocabulary at service startup."""
    logger.info("Initializing ML models and vocabularies on startup...")
    load_tfidf_vectorizer()
    load_skill_vocabulary()
    logger.info("ML Service startup initialization complete.")


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "ml-service",
        "version": "1.0.0"
    }


@app.get("/model-info", tags=["Model"])
def get_model_info():
    """
    Returns metadata about active ML models, vectorizer vocabulary,
    training datasets, and algorithm versioning.
    """
    metadata = {}
    if os.path.exists(METADATA_PATH):
        try:
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                metadata = json.load(f)
        except Exception as e:
            logger.warning(f"Failed to read metadata.json: {e}")

    vec = load_tfidf_vectorizer()
    vocab_size = len(vec.vocabulary_) if hasattr(vec, "vocabulary_") else 0

    return {
        "algorithm": metadata.get("algorithm", "TF-IDF + Cosine Similarity"),
        "version": metadata.get("algorithmVersion", "tfidf-v1"),
        "trainingDataset": metadata.get("trainingDatasets", [
            "Kaggle Resume Dataset",
            "Kaggle Job Description Dataset"
        ]),
        "vocabularySize": vocab_size,
        "metadata": metadata
    }


@app.post("/reload-model", tags=["Model"])
def reload_model_endpoint():
    """Reloads saved ML model artifacts from disk without restarting the service."""
    try:
        result = reload_models()
        return {
            "success": True,
            "message": "ML models and vocabularies reloaded successfully from disk.",
            "details": result
        }
    except Exception as e:
        logger.error(f"Error reloading models: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reload models: {str(e)}"
        )


@app.get("/skills/catalog", tags=["Catalog"])
def get_skills_catalog():
    """Returns the master dictionary of technical skills and categories."""
    return {"catalog": SKILLS_DICTIONARY}


@app.post("/analyze-resume", tags=["Analysis"])
def analyze_resume_endpoint(payload: AnalyzeResumeRequest):
    """
    Parses a resume file or raw text, extracts contact info, sections, skills,
    keywords, computes ATS score, strengths, weaknesses, and recommendations.
    """
    logger.info("Received resume analysis request")
    try:
        raw_text_input = payload.rawText or payload.resumeText
        if payload.filePath:
            if not os.path.exists(payload.filePath):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Resume file not found at path: {payload.filePath}"
                )
            parsed = parse_resume(payload.filePath)
        elif raw_text_input:
            raw_text = raw_text_input.strip()
            if not raw_text:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Provided text input is empty."
                )
            parsed = {
                "candidateName": None,
                "email": None,
                "phone": None,
                "linkedin": None,
                "github": None,
                "extractedText": raw_text,
                "skills": extract_skills(raw_text),
                "education": "",
                "experience": "",
                "projects": "",
                "certifications": "",
                "summary": "",
                "keywords": extract_keywords(raw_text, top_n=25),
                "wordCount": len(raw_text.split()),
                "characterCount": len(raw_text)
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either a valid 'filePath', 'rawText', or 'resumeText' must be provided."
            )

        analysis = analyze_resume(parsed)
        resume_score = analysis.get("overallScore", 75)

        return {
            "success": True,
            "resumeScore": resume_score,
            "skills": parsed.get("skills", []),
            "education": parsed.get("education", ""),
            "experience": parsed.get("experience", ""),
            "projects": parsed.get("projects", ""),
            "certifications": parsed.get("certifications", ""),
            "strengths": analysis.get("strengths", []),
            "weaknesses": analysis.get("weaknesses", []),
            "recommendations": analysis.get("recommendations", []),
            "scoreBreakdown": analysis.get("scoreBreakdown", {}),
            "parsed": parsed,
            "analysis": analysis
        }
    except HTTPException:
        raise
    except ValueError as ve:
        logger.warning(f"Validation error during resume analysis: {ve}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve))
    except Exception as e:
        logger.error(f"Error analyzing resume: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Resume analysis failed: {str(e)}"
        )


@app.post("/match-job", tags=["Matching"])
def match_single_job_endpoint(payload: JobMatchRequest):
    """Calculates match percentage, text similarity, skill score, and skill gaps for a single job."""
    try:
        resume_data = payload.resumeData or {}
        if not resume_data and payload.resumeText:
            resume_data = {
                "extractedText": payload.resumeText,
                "skills": extract_skills(payload.resumeText)
            }
        match_result = match_job(resume_data, payload.job or {}, payload.weights)
        return {"success": True, "match": match_result}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error matching single job: {str(e)}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/match-jobs", tags=["Matching"])
def match_batch_jobs_endpoint(payload: BatchJobMatchRequest):
    """
    Ranks all provided jobs against the resume using TF-IDF, Cosine Similarity,
    and Skill matching. Also returns full skill gap analysis.
    Supports both `{resumeData, jobs}` and `{resumeText, jobIds}` payloads.
    """
    try:
        resume_data = payload.resumeData or {}
        if not resume_data and payload.resumeText:
            resume_data = {
                "extractedText": payload.resumeText,
                "skills": extract_skills(payload.resumeText)
            }

        jobs = payload.jobs or []

        # If jobIds are specified without jobs objects, fetch from database or clean dataset
        if not jobs and payload.jobIds:
            from pymongo import MongoClient
            from bson import ObjectId
            mongo_uri = os.getenv("MONGO_URI", "mongodb://mongodb:27017/ai_resume_job_matcher")
            if "mongodb:27017" in mongo_uri and os.getenv("RUNNING_IN_DOCKER") != "true":
                mongo_uri = mongo_uri.replace("mongodb:27017", "localhost:27017")
            try:
                client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
                db = client.get_database()
                obj_ids = []
                for jid in payload.jobIds:
                    try:
                        obj_ids.append(ObjectId(jid))
                    except Exception:
                        pass
                cursor = db["jobs"].find({"_id": {"$in": obj_ids}})
                for doc in cursor:
                    doc["_id"] = str(doc["_id"])
                    jobs.append(doc)
            except Exception as e:
                logger.warning(f"Could not load jobs by ID from MongoDB: {e}")

        job_count = len(jobs)
        logger.info(f"Received batch job matching request for {job_count} jobs")

        matched_jobs = match_all_jobs(resume_data, jobs, payload.weights)
        resume_skills = resume_data.get("skills") or []
        gap_analysis = analyze_skill_gap(resume_skills, matched_jobs)

        return {
            "success": True,
            "totalJobsEvaluated": job_count,
            "matches": matched_jobs,
            "matchedJobs": matched_jobs,
            "skillGap": gap_analysis
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in batch job matching: {str(e)}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/skill-gap", tags=["Matching"])
def skill_gap_endpoint(payload: SkillGapRequest):
    """Computes skill gap and personalized learning paths for missing skills."""
    try:
        gap_analysis = analyze_skill_gap(payload.resumeSkills or [], payload.matchedJobs or [])
        return {"success": True, "skillGap": gap_analysis}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing skill gap: {str(e)}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
