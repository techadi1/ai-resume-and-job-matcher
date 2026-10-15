#!/usr/bin/env python3
"""
Model Training Script for AI Resume Analyzer & Job Matcher
1. Trains and serializes the global TF-IDF Vectorizer on the combined corpus of resumes & job descriptions.
2. Evaluates supervised suitability: Inspects whether labeled matching pairs exist.
3. Trains a supervised Logistic Regression classifier on resume categories (80/20 split) to validate classification accuracy.
4. Saves all model artifacts and metadata to models/
"""

import os
import re
import json
import joblib
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import pandas as pd
import numpy as np

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("train_model")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
PROCESSED_DATA_DIR = os.path.join(BASE_DIR, "data", "processed")
MODELS_DIR = os.path.join(BASE_DIR, "models")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

# Custom token pattern to preserve technical tokens like C++, C#, .NET, Node.js, etc.
TECHNICAL_TOKEN_PATTERN = r"(?u)\b[a-zA-Z0-9_+#.-]{2,}\b"

def train_tfidf_vectorizer(resumes_df: pd.DataFrame, jobs_df: pd.DataFrame) -> TfidfVectorizer:
    """
    Fits a production TF-IDF Vectorizer over the combined corpus of resumes and job descriptions.
    """
    logger.info("Building combined text corpus for TF-IDF training...")
    resume_texts = resumes_df["resume_text"].dropna().tolist()
    job_texts = (jobs_df["job_title"] + " " + jobs_df["job_description"]).dropna().tolist()
    combined_corpus = resume_texts + job_texts
    logger.info(f"Total documents in training corpus: {len(combined_corpus)} ({len(resume_texts)} resumes, {len(job_texts)} jobs)")

    vectorizer = TfidfVectorizer(
        token_pattern=TECHNICAL_TOKEN_PATTERN,
        stop_words="english",
        ngram_range=(1, 2),
        max_features=5000,
        sublinear_tf=True,
        norm="l2"
    )

    vectorizer.fit(combined_corpus)
    vocab_size = len(vectorizer.vocabulary_)
    logger.info(f"TF-IDF Vectorizer successfully fitted. Vocabulary size: {vocab_size} tokens")

    model_path = os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl")
    joblib.dump(vectorizer, model_path)
    logger.info(f"Saved TF-IDF Vectorizer artifact to: {model_path}")
    return vectorizer

def train_supervised_category_model(resumes_df: pd.DataFrame, vectorizer: TfidfVectorizer) -> Dict[str, Any]:
    """
    Supervised Learning:
    Trains a Logistic Regression classifier on ground-truth resume categories.
    Evaluates with 80% train / 20% test split.
    """
    logger.info("Evaluating supervised learning capabilities...")
    if "category" not in resumes_df.columns or resumes_df["category"].nunique() < 2:
        logger.warning("No multi-class category labels available for supervised classification.")
        return {}

    X_texts = resumes_df["resume_text"].values
    y_labels = resumes_df["category"].values

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y_labels)

    # Encode features using fitted TF-IDF
    X_tfidf = vectorizer.transform(X_texts)

    # Check if all classes have at least 2 members for stratification
    class_counts = np.bincount(y_encoded)
    can_stratify = bool(len(class_counts) > 0 and min(class_counts) >= 2)
    stratify_target = y_encoded if can_stratify else None

    X_train, X_test, y_train, y_test = train_test_split(
        X_tfidf, y_encoded, test_size=0.20, random_state=42, stratify=stratify_target
    )

    clf = LogisticRegression(max_iter=1000, C=1.0, random_state=42)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = float(accuracy_score(y_test, y_pred))
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted", zero_division=0)

    logger.info(f"Logistic Regression Evaluation -> Accuracy: {acc*100:.2f}%, Weighted F1: {f1*100:.2f}%")

    # Save models and encoder
    clf_path = os.path.join(MODELS_DIR, "logistic_regression.pkl")
    encoder_path = os.path.join(MODELS_DIR, "label_encoder.pkl")
    joblib.dump(clf, clf_path)
    joblib.dump(label_encoder, encoder_path)
    logger.info(f"Saved Logistic Regression model to: {clf_path}")

    return {
        "accuracy": round(acc, 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1Score": round(float(f1), 4),
        "testSamples": len(y_test),
        "classes": label_encoder.classes_.tolist()
    }

def save_metadata(vectorizer: TfidfVectorizer, supervised_metrics: Dict[str, Any], resumes_count: int, jobs_count: int):
    metadata = {
        "algorithm": "TF-IDF + Cosine Similarity + Skill Overlap + Experience Relevance",
        "algorithmVersion": "tfidf-v1",
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "vocabularySize": len(vectorizer.vocabulary_),
        "corpusSize": {
            "resumes": resumes_count,
            "jobs": jobs_count,
            "totalDocuments": resumes_count + jobs_count
        },
        "trainingDatasets": [
            "Kaggle UpdatedResumeDataSet.csv (Category & Resume text)",
            "Kaggle Job Postings (Job title & Job description text)"
        ],
        "supervisedClassification": {
            "model": "Logistic Regression",
            "task": "Resume Domain Category Classification",
            "metrics": supervised_metrics,
            "supervisedMatchLabelsNote": "Kaggle datasets are independent unpaired corpora without ground-truth hiring outcome labels. Real mathematically sound matching is calculated via TF-IDF vector space model, Cosine Similarity, skill intersection, and experience band matching."
        }
    }

    meta_path = os.path.join(MODELS_DIR, "metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    logger.info(f"Saved model metadata to: {meta_path}")

def main():
    resumes_clean_path = os.path.join(PROCESSED_DATA_DIR, "resumes_clean.csv")
    jobs_clean_path = os.path.join(PROCESSED_DATA_DIR, "jobs_clean.csv")

    if not os.path.exists(resumes_clean_path) or not os.path.exists(jobs_clean_path):
        raise FileNotFoundError("Processed datasets missing. Run training/preprocess_data.py first.")

    resumes_df = pd.read_csv(resumes_clean_path)
    jobs_df = pd.read_csv(jobs_clean_path)

    vectorizer = train_tfidf_vectorizer(resumes_df, jobs_df)
    supervised_metrics = train_supervised_category_model(resumes_df, vectorizer)
    save_metadata(vectorizer, supervised_metrics, len(resumes_df), len(jobs_df))

    logger.info("Model training pipeline completed successfully.")

if __name__ == "__main__":
    main()
