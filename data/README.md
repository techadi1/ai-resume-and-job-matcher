# AI Resume Analyzer & Job Matcher — Dataset Documentation

This directory contains the raw and preprocessed datasets used by the Machine Learning pipeline to train the TF-IDF vector space model, extract skill vocabularies, train the domain classifier, and benchmark multi-factor resume-job matching.

---

## 1. Dataset 1: Kaggle Resume Dataset

- **Dataset Name:** Updated Resume Data Set (Resume Dataset for NLP & Classification)
- **Kaggle Source URL:** [https://www.kaggle.com/datasets/gauravduttakiit/resume-dataset](https://www.kaggle.com/datasets/gauravduttakiit/resume-dataset)
- **Author:** Gaurav Dutta
- **File Location:** `ml-service/data/raw/resumes.csv`
- **Purpose:**
  - Resume text analysis and vocabulary building
  - Multi-class resume domain classification (25 categories)
  - Technical skill extraction and regex benchmarking
  - Text normalization & TF-IDF vectorizer training
- **Original Columns:**
  - `Category`: Domain label (e.g., `Data Science`, `Python Developer`, `Java Developer`, `DevOps Engineer`, `Web Designing`, `HR`, `Advocate`, etc.)
  - `Resume`: Full curriculum vitae / resume plain text
- **Record Counts:**
  - Raw Records: 962
  - Deduplicated Clean Records: 166 unique resume profiles across 25 distinct technical and professional categories
- **Preprocessing Performed:**
  - URL removal (`http\S+`, `www\S+`)
  - Email and phone number sanitization
  - Special character stripping with technical token preservation (`C++`, `C#`, `.NET`, `Node.js`, `SQL`)
  - Whitespace collapsing and case normalization
  - Canonical technical skill extraction mapped against `skill_vocabulary.json`
- **Standardized Output Format:**
  Saved to `ml-service/data/processed/resumes_clean.csv`:
  ```json
  {
    "resume_id": "RES_0001",
    "resume_text": "...",
    "category": "Data Science",
    "skills": ["Python", "Machine Learning", "NLP", "Pandas", "NumPy"]
  }
  ```
- **License / Restrictions:** Public Open Database License (DbCL 1.0) / CC BY-SA 4.0 for educational and non-commercial research.

---

## 2. Dataset 2: Kaggle Job Postings Dataset

- **Dataset Name:** Indeed Software Engineering & Data Science Job Listings
- **Kaggle Source URL:** [https://www.kaggle.com/datasets/elroygg97/indeed-dataset-data-science-and-software-developer](https://www.kaggle.com/datasets/elroygg97/indeed-dataset-data-science-and-software-developer)
- **File Location:** `ml-service/data/raw/jobs.csv`
- **Purpose:**
  - Job description parsing and NLP normalization
  - Candidate-to-job requirement matching
  - Required and preferred skill extraction
  - Experience requirement extraction and seniority parsing
  - Seeding the production MongoDB `jobs` collection via `scripts/import_jobs.py`
- **Original Columns:**
  - `job_title`: Job role title
  - `body`: Detailed job description and requirements body
  - `summary`: Short role summary
  - `company`: Employer company name
  - `location` / `city`: Geographic location or remote status
- **Record Counts:**
  - Raw Records: 100
  - Deduplicated Clean Records: 93 high-quality technical job descriptions
- **Preprocessing Performed:**
  - Deduplication based on identical title + company + description
  - Missing value imputation for company ("Tech Innovations") and location ("Remote")
  - Automatic skill extraction using the 120+ technical skill catalog
  - Experience range parsing (e.g., `3+ years`, `Entry level`, `Senior`) into numeric bounds
- **Standardized Output Format:**
  Saved to `ml-service/data/processed/jobs_clean.csv`:
  ```json
  {
    "job_id": "JOB_0001",
    "job_title": "Software Engineer",
    "job_description": "...",
    "skills": ["Python", "FastAPI", "Docker", "PostgreSQL"],
    "experience": "2-4 years",
    "category": "Software Engineering"
  }
  ```
- **License / Restrictions:** CC0: Public Domain / Open Research.

---

## 3. Directory Layout

```
ml-service/
├── data/
│   ├── raw/
│   │   ├── resumes.csv           # Raw Kaggle resumes dataset
│   │   └── jobs.csv              # Raw Kaggle job postings dataset
│   │
│   ├── processed/
│   │   ├── resumes_clean.csv     # Standardized resumes
│   │   ├── jobs_clean.csv        # Standardized job listings
│   │   └── features.csv          # Joint TF-IDF & skill feature matrix
│   │
│   └── README.md                 # This documentation
```

---

## 4. How to Download & Setup Datasets

If you are setting up the project from scratch or using refreshed datasets:

1. **Download Kaggle Datasets:**
   - Download `UpdatedResumeDataSet.csv` from [Kaggle Resume Dataset](https://www.kaggle.com/datasets/gauravduttakiit/resume-dataset).
   - Download the Job Postings CSV from [Kaggle Indeed Dataset](https://www.kaggle.com/datasets/elroygg97/indeed-dataset-data-science-and-software-developer).

2. **Place in Project:**
   ```bash
   cp /path/to/UpdatedResumeDataSet.csv ml-service/data/raw/resumes.csv
   cp /path/to/job_postings.csv ml-service/data/raw/jobs.csv
   ```

3. **Run the Preprocessing Pipeline:**
   ```bash
   python ml-service/training/preprocess_data.py
   ```
   This will inspect the actual column names, normalize text, extract technical skills, deduplicate records, and generate:
   - `ml-service/data/processed/resumes_clean.csv`
   - `ml-service/data/processed/jobs_clean.csv`
   - `ml-service/data/processed/features.csv`

4. **Train the Production Models:**
   ```bash
   python ml-service/training/train_model.py
   ```
   This will fit the global `TfidfVectorizer` (sublinear TF, n-gram 1-2, preserving `C++`, `C#`, `.NET`, `Node.js`), train the supervised Logistic Regression category classifier, and save artifacts to `ml-service/models/`.

5. **Evaluate Models:**
   ```bash
   python ml-service/training/evaluate_model.py
   ```
   This outputs classification accuracy, precision, recall, F1, and multi-factor matching benchmarks to `ml-service/reports/model_evaluation.json`.

6. **Seed MongoDB with Kaggle Jobs:**
   ```bash
   python scripts/import_jobs.py
   ```
   Loads the 93 clean jobs into the local/Docker MongoDB instance.
