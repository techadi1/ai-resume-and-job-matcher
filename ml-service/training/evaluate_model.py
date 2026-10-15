#!/usr/bin/env python3
"""
Model Evaluation Script for AI Resume Analyzer & Job Matcher
- Evaluates the supervised Logistic Regression category classifier (Accuracy, Precision, Recall, F1, Confusion Matrix).
- Evaluates the unsupervised TF-IDF Vectorizer + Cosine Similarity matching engine across diverse test scenarios:
  1. Strong Match (Domain-aligned, high skill overlap)
  2. Partial Match (Frontend/Backend overlap with missing cloud tools)
  3. Weak Match (Cross-domain, divergent skills)
  4. Non-matching pair (Completely distinct industries)
- Outputs detailed evaluation metrics to reports/model_evaluation.json
"""

import os
import json
import logging
import joblib
from datetime import datetime
from typing import Dict, List, Any
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix
)
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import train_test_split

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("evaluate_model")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
PROCESSED_DATA_DIR = os.path.join(BASE_DIR, "data", "processed")
MODELS_DIR = os.path.join(BASE_DIR, "models")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

os.makedirs(REPORTS_DIR, exist_ok=True)


def evaluate_logistic_regression(resumes_df: pd.DataFrame, vectorizer, clf, label_encoder) -> Dict[str, Any]:
    """
    Evaluates supervised Logistic Regression classifier performance.
    """
    logger.info("Evaluating Supervised Logistic Regression Classifier...")
    X_texts = resumes_df["resume_text"].values
    y_labels = resumes_df["category"].values
    y_encoded = label_encoder.transform(y_labels)

    X_tfidf = vectorizer.transform(X_texts)

    class_counts = np.bincount(y_encoded)
    can_stratify = bool(len(class_counts) > 0 and min(class_counts) >= 2)
    stratify_target = y_encoded if can_stratify else None

    X_train, X_test, y_train, y_test = train_test_split(
        X_tfidf, y_encoded, test_size=0.20, random_state=42, stratify=stratify_target
    )

    y_pred = clf.predict(X_test)

    acc = float(accuracy_score(y_test, y_pred))
    p_w, r_w, f1_w, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted", zero_division=0)
    p_m, r_m, f1_m, _ = precision_recall_fscore_support(y_test, y_pred, average="macro", zero_division=0)

    classes_in_test = np.unique(np.concatenate([y_test, y_pred]))
    cm = confusion_matrix(y_test, y_pred, labels=classes_in_test)
    class_names = [label_encoder.classes_[i] for i in classes_in_test]

    logger.info(f"Classification Results -> Accuracy: {acc*100:.2f}%, Weighted F1: {f1_w*100:.2f}%, Macro F1: {f1_m*100:.2f}%")

    return {
        "task": "Resume Domain Category Classification",
        "sampleSize": {
            "totalResumes": len(resumes_df),
            "trainSamples": int(X_train.shape[0]),
            "testSamples": int(X_test.shape[0])
        },
        "metrics": {
            "accuracy": round(acc, 4),
            "weightedPrecision": round(float(p_w), 4),
            "weightedRecall": round(float(r_w), 4),
            "weightedF1": round(float(f1_w), 4),
            "macroPrecision": round(float(p_m), 4),
            "macroRecall": round(float(r_m), 4),
            "macroF1": round(float(f1_m), 4)
        },
        "confusionMatrix": {
            "classes": class_names,
            "matrix": cm.tolist()
        }
    }


def evaluate_tfidf_matching(vectorizer, skill_vocab: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Evaluates TF-IDF Cosine Similarity and Multi-Factor matching on structured benchmark scenarios.
    """
    logger.info("Evaluating TF-IDF Cosine Similarity & Multi-Factor Matching...")

    test_scenarios = [
        {
            "name": "Scenario 1: High Relevance - Senior Python/Full-Stack Developer",
            "type": "Strong Match",
            "resume_text": (
                "Senior Software Engineer with 5 years experience in Python, Django, FastAPI, React, PostgreSQL, "
                "Docker, and Git. Designed scalable microservices and REST APIs."
            ),
            "resume_skills": ["Python", "FastAPI", "Django", "React", "PostgreSQL", "Docker", "Git"],
            "resume_experience_years": 5,
            "job_text": (
                "Senior Backend Engineer. Requirements: 4+ years of professional experience with Python, FastAPI, "
                "PostgreSQL, Docker, and REST APIs. Familiarity with React is a plus."
            ),
            "job_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "REST API", "React"],
            "job_req_experience_years": 4
        },
        {
            "name": "Scenario 2: Moderate Relevance - Frontend Developer to Full-Stack Job",
            "type": "Partial Match",
            "resume_text": (
                "Frontend Web Developer with 3 years experience in React, JavaScript, TypeScript, HTML, CSS, "
                "Redux, and responsive design. Basic knowledge of Node.js."
            ),
            "resume_skills": ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Node.js"],
            "resume_experience_years": 3,
            "job_text": (
                "Full Stack Developer needed. Must have 3+ years experience with React, Node.js, Express, "
                "MongoDB, AWS, and Docker for cloud application development."
            ),
            "job_skills": ["React", "Node.js", "Express", "MongoDB", "AWS", "Docker"],
            "job_req_experience_years": 3
        },
        {
            "name": "Scenario 3: Low Relevance - Junior Data Analyst to Senior DevOps Engineer",
            "type": "Weak Match",
            "resume_text": (
                "Junior Data Analyst with 1 year experience in Excel, SQL, Tableau, Pandas, and basic Python "
                "reporting. Seeking data analysis entry role."
            ),
            "resume_skills": ["SQL", "Pandas", "Python"],
            "resume_experience_years": 1,
            "job_text": (
                "Senior DevOps & Infrastructure Engineer. Requirements: 5+ years with Kubernetes, Terraform, "
                "AWS, Docker, CI/CD pipelines, Linux system administration."
            ),
            "job_skills": ["Kubernetes", "AWS", "Docker", "Linux"],
            "job_req_experience_years": 5
        },
        {
            "name": "Scenario 4: Divergent Domain - HR Specialist to Software Architect",
            "type": "Non-Matching",
            "resume_text": (
                "Human Resources Specialist with 6 years experience in talent acquisition, employee relations, "
                "payroll management, conflict resolution, and onboarding policies."
            ),
            "resume_skills": [],
            "resume_experience_years": 6,
            "job_text": (
                "Software Architect: Lead engineering teams in Java, Spring Boot, Microservices, Kubernetes, "
                "Kafka, distributed systems, and PostgreSQL."
            ),
            "job_skills": ["Java", "Spring Boot", "Kubernetes", "PostgreSQL"],
            "job_req_experience_years": 8
        }
    ]

    results = []

    for sc in test_scenarios:
        # 1. Cosine Similarity via TF-IDF
        r_vec = vectorizer.transform([sc["resume_text"]])
        j_vec = vectorizer.transform([sc["job_text"]])
        raw_sim = float(cosine_similarity(r_vec, j_vec)[0][0])
        sim_score = round(raw_sim * 100, 2)

        # 2. Skill Match Calculation
        r_skills = set(sc["resume_skills"])
        j_skills = set(sc["job_skills"])
        matched = list(r_skills.intersection(j_skills))
        missing = list(j_skills.difference(r_skills))

        skill_score = round((len(matched) / len(j_skills) * 100) if j_skills else 50.0, 2)

        # 3. Experience Match Calculation
        req_exp = sc["job_req_experience_years"]
        act_exp = sc["resume_experience_years"]
        if req_exp == 0:
            exp_score = 100.0
        elif act_exp >= req_exp:
            exp_score = 100.0
        else:
            exp_score = round(max(0.0, (act_exp / req_exp) * 100.0), 2)

        # 4. Final Weighted Match Score (40% Similarity + 40% Skill + 20% Experience)
        final_score = round((0.40 * sim_score) + (0.40 * skill_score) + (0.20 * exp_score), 1)

        result_entry = {
            "scenario": sc["name"],
            "type": sc["type"],
            "textSimilarity": sim_score,
            "skillScore": skill_score,
            "experienceScore": exp_score,
            "finalMatchScore": final_score,
            "matchedSkills": matched,
            "missingSkills": missing
        }
        results.append(result_entry)
        logger.info(
            f"Scenario: {sc['type']} -> Final Match: {final_score}% "
            f"(Sim: {sim_score}%, Skill: {skill_score}%, Exp: {exp_score}%)"
        )

    return results


def main():
    resumes_clean_path = os.path.join(PROCESSED_DATA_DIR, "resumes_clean.csv")
    tfidf_path = os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl")
    clf_path = os.path.join(MODELS_DIR, "logistic_regression.pkl")
    enc_path = os.path.join(MODELS_DIR, "label_encoder.pkl")
    vocab_path = os.path.join(MODELS_DIR, "skill_vocabulary.json")

    if not all(os.path.exists(p) for p in [resumes_clean_path, tfidf_path, clf_path, enc_path, vocab_path]):
        raise FileNotFoundError("Prerequisite models or datasets missing. Run training/train_model.py first.")

    resumes_df = pd.read_csv(resumes_clean_path)
    vectorizer = joblib.load(tfidf_path)
    clf = joblib.load(clf_path)
    label_encoder = joblib.load(enc_path)

    with open(vocab_path, "r", encoding="utf-8") as f:
        skill_vocab = json.load(f)

    # Run evaluations
    supervised_results = evaluate_logistic_regression(resumes_df, vectorizer, clf, label_encoder)
    matching_benchmarks = evaluate_tfidf_matching(vectorizer, skill_vocab)

    report = {
        "timestamp": datetime.now().isoformat() + "Z",
        "evaluationSummary": {
            "algorithmVersion": "tfidf-v1",
            "framework": "scikit-learn",
            "supervisedClassifier": "Logistic Regression (multi-class resume domain)",
            "vectorSpaceModel": "TF-IDF Vectorizer with Sublinear Term Frequency",
            "matchingFormulation": "Final Score = 0.40 * Similarity + 0.40 * Skill + 0.20 * Experience"
        },
        "supervisedClassification": supervised_results,
        "matchingEngineBenchmarks": matching_benchmarks,
        "methodologyNotes": [
            "Supervised Logistic Regression tests domain categorization accuracy across real Kaggle resume texts.",
            "Because Kaggle resume & job datasets are independent unpaired corpora lacking ground-truth hiring outcomes, supervised match labeling was not fabricated.",
            "Unsupervised multi-factor ranking dynamically computes mathematical similarity, skill intersection, and candidate-job experience requirements."
        ]
    }

    report_path = os.path.join(REPORTS_DIR, "model_evaluation.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    logger.info(f"Model evaluation report generated successfully at: {report_path}")


if __name__ == "__main__":
    main()
