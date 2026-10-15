#!/usr/bin/env python3
"""
Comprehensive ML Pipeline & Scoring Validation Suite
Validates all 10 required test cases:
1. Strong resume/job match
2. Weak match
3. Partial skill match
4. Missing skills
5. Empty resume handling
6. Invalid resume handling
7. PDF resume parsing & scoring
8. DOCX resume parsing & scoring
9. Large resume handling (stress testing token limits)
10. Resume with unusual formatting & special characters
"""

import os
import sys
import tempfile
import fitz  # PyMuPDF
from docx import Document

# Add ml-service root to path
ML_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ML_DIR)

from job_matcher import match_job, load_tfidf_vectorizer, load_skill_vocabulary
from resume_parser import parse_resume
from resume_analyzer import analyze_resume
from skill_extractor import extract_skills


def create_sample_pdf(filepath: str, text: str):
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), text)
    doc.save(filepath)
    doc.close()


def create_sample_docx(filepath: str, text: str):
    doc = Document()
    for paragraph in text.split("\n\n"):
        doc.add_paragraph(paragraph)
    doc.save(filepath)


def run_all_tests():
    print("=" * 60)
    print("RUNNING AI RESUME & JOB MATCHER TEST SUITE")
    print("=" * 60)

    # Preload models
    load_tfidf_vectorizer()
    load_skill_vocabulary()

    passed = 0
    total = 10

    # -------------------------------------------------------------
    # Test Case 1: Strong Resume/Job Match
    # -------------------------------------------------------------
    print("\n[Test 1] Strong resume/job match...")
    r1 = {
        "extractedText": "Senior Python Backend Engineer. 5 years experience with Python, Django, FastAPI, PostgreSQL, Docker, and REST APIs. Built high-throughput microservices.",
        "skills": ["Python", "FastAPI", "Django", "PostgreSQL", "Docker", "REST API"]
    }
    j1 = {
        "title": "Senior Python Backend Engineer",
        "description": "Looking for a Senior Python engineer with 4+ years of experience in Python, FastAPI, PostgreSQL, Docker, and REST APIs.",
        "requiredSkills": ["Python", "FastAPI", "PostgreSQL", "Docker", "REST API"],
        "experience": "4+ years"
    }
    m1 = match_job(r1, j1)
    print(f" -> Match: {m1['matchPercentage']}% (Sim: {m1['similarityScore']}%, Skill: {m1['skillScore']}%, Exp: {m1['experienceScore']}%)")
    assert m1['matchPercentage'] >= 70, f"Expected strong match >= 70%, got {m1['matchPercentage']}%"
    assert len(m1['matchedSkills']) >= 4, "Expected most skills matched"
    passed += 1
    print(" -> PASSED")

    # -------------------------------------------------------------
    # Test Case 2: Weak Match (Divergent domain)
    # -------------------------------------------------------------
    print("\n[Test 2] Weak match (divergent domain)...")
    r2 = {
        "extractedText": "HR Manager with 8 years in recruitment, employee relations, payroll, and conflict resolution.",
        "skills": ["Communication", "Leadership"]
    }
    j2 = {
        "title": "Cloud DevOps Engineer",
        "description": "Requires Kubernetes, AWS, Terraform, Docker, and CI/CD pipelines.",
        "requiredSkills": ["Kubernetes", "AWS", "Terraform", "Docker", "CI/CD"],
        "experience": "5+ years"
    }
    m2 = match_job(r2, j2)
    print(f" -> Match: {m2['matchPercentage']}% (Sim: {m2['similarityScore']}%, Skill: {m2['skillScore']}%, Exp: {m2['experienceScore']}%)")
    assert m2['matchPercentage'] <= 35, f"Expected weak match <= 35%, got {m2['matchPercentage']}%"
    assert m2['skillScore'] == 0, "Expected 0% skill match"
    passed += 1
    print(" -> PASSED")

    # -------------------------------------------------------------
    # Test Case 3: Partial Skill Match
    # -------------------------------------------------------------
    print("\n[Test 3] Partial skill match...")
    r3 = {
        "extractedText": "Frontend Developer with React, JavaScript, HTML, and CSS. Basic Node.js knowledge.",
        "skills": ["React", "JavaScript", "HTML", "CSS", "Node.js"]
    }
    j3 = {
        "title": "Full Stack Developer",
        "description": "Full stack role requiring React, Node.js, AWS, Docker, and MongoDB.",
        "requiredSkills": ["React", "Node.js", "AWS", "Docker", "MongoDB"],
        "experience": "2 years"
    }
    m3 = match_job(r3, j3)
    print(f" -> Match: {m3['matchPercentage']}% (Sim: {m3['similarityScore']}%, Skill: {m3['skillScore']}%, Exp: {m3['experienceScore']}%)")
    assert 30 <= m3['matchPercentage'] <= 70, f"Expected partial match between 30% and 70%, got {m3['matchPercentage']}%"
    assert "React" in m3['matchedSkills']
    assert "Node.js" in m3['matchedSkills']
    assert "AWS" in m3['missingSkills']
    passed += 1
    print(" -> PASSED")

    # -------------------------------------------------------------
    # Test Case 4: Missing Skills Identification
    # -------------------------------------------------------------
    print("\n[Test 4] Missing skills identification...")
    r4 = {
        "extractedText": "Data Analyst with SQL and Tableau.",
        "skills": ["SQL"]
    }
    j4 = {
        "title": "Data Scientist",
        "description": "Requires Python, Machine Learning, SQL, PyTorch, and Docker.",
        "requiredSkills": ["Python", "Machine Learning", "SQL", "PyTorch", "Docker"],
        "experience": "2 years"
    }
    m4 = match_job(r4, j4)
    print(f" -> Matched: {m4['matchedSkills']}, Missing: {m4['missingSkills']}")
    assert "SQL" in m4['matchedSkills']
    assert "Python" in m4['missingSkills']
    assert "Docker" in m4['missingSkills']
    passed += 1
    print(" -> PASSED")

    # -------------------------------------------------------------
    # Test Case 5: Empty Resume
    # -------------------------------------------------------------
    print("\n[Test 5] Empty resume handling...")
    r5 = {"extractedText": "", "skills": []}
    j5 = {"title": "Software Engineer", "requiredSkills": ["Java"]}
    m5 = match_job(r5, j5)
    print(f" -> Empty resume match: {m5['matchPercentage']}%")
    assert m5['similarityScore'] == 0
    assert m5['skillScore'] == 0
    passed += 1
    print(" -> PASSED")

    # -------------------------------------------------------------
    # Test Case 6: Invalid Resume (Non-dict/Garbage input)
    # -------------------------------------------------------------
    print("\n[Test 6] Invalid resume input...")
    m6 = match_job(None, None)
    assert isinstance(m6, dict)
    assert "matchPercentage" in m6
    passed += 1
    print(" -> PASSED")

    # -------------------------------------------------------------
    # Test Case 7: PDF Resume Parsing
    # -------------------------------------------------------------
    print("\n[Test 7] PDF Resume parsing...")
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp_pdf:
        tmp_pdf_path = tmp_pdf.name
    try:
        sample_pdf_text = (
            "Jane Doe\n"
            "Email: jane.doe@example.com | Phone: +1-555-0199\n"
            "LinkedIn: linkedin.com/in/janedoe | GitHub: github.com/janedoe\n\n"
            "TECHNICAL SKILLS\n"
            "Python, Django, FastAPI, PostgreSQL, Docker, Redis, Git, AWS\n\n"
            "EXPERIENCE\n"
            "Senior Backend Engineer - Tech Solutions (3 years)\n"
            "Architected microservices handling high traffic using FastAPI and PostgreSQL.\n\n"
            "PROJECTS\n"
            "Cloud Deployment Automation: Reduced deployment latency by 45% using Docker.\n\n"
            "EDUCATION\n"
            "B.S. in Computer Science - University of Science\n\n"
            "CERTIFICATIONS\n"
            "AWS Certified Solutions Architect"
        )
        create_sample_pdf(tmp_pdf_path, sample_pdf_text)
        parsed_pdf = parse_resume(tmp_pdf_path)
        analyzed_pdf = analyze_resume(parsed_pdf)
        print(f" -> Extracted Skills ({len(parsed_pdf['skills'])}): {parsed_pdf['skills']}")
        print(f" -> ATS Score: {analyzed_pdf['overallScore']}/100")
        assert len(parsed_pdf['skills']) >= 5, "Expected >= 5 skills from PDF"
        assert analyzed_pdf['overallScore'] >= 65, "Expected competitive ATS score >= 65"
        passed += 1
        print(" -> PASSED")
    finally:
        if os.path.exists(tmp_pdf_path):
            os.remove(tmp_pdf_path)

    # -------------------------------------------------------------
    # Test Case 8: DOCX Resume Parsing
    # -------------------------------------------------------------
    print("\n[Test 8] DOCX Resume parsing...")
    with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp_docx:
        tmp_docx_path = tmp_docx.name
    try:
        sample_docx_text = (
            "John Smith\n"
            "john.smith@example.com | +1 555-0144\n\n"
            "SKILLS\n"
            "React, TypeScript, Next.js, Redux, HTML, CSS, JavaScript, Tailwind CSS\n\n"
            "EXPERIENCE\n"
            "Lead Frontend Developer - WebWorks (4 years)\n"
            "Spearheaded responsive frontend redesign delivering 35% user engagement boost.\n\n"
            "PROJECTS\n"
            "E-commerce Web App: Built scalable dashboard with React and TypeScript.\n\n"
            "EDUCATION\n"
            "Bachelor of Science in Information Technology\n"
        )
        create_sample_docx(tmp_docx_path, sample_docx_text)
        parsed_docx = parse_resume(tmp_docx_path)
        analyzed_docx = analyze_resume(parsed_docx)
        print(f" -> Extracted Skills ({len(parsed_docx['skills'])}): {parsed_docx['skills']}")
        print(f" -> ATS Score: {analyzed_docx['overallScore']}/100")
        assert "React" in parsed_docx['skills']
        assert "TypeScript" in parsed_docx['skills']
        assert analyzed_docx['overallScore'] >= 60
        passed += 1
        print(" -> PASSED")
    finally:
        if os.path.exists(tmp_docx_path):
            os.remove(tmp_docx_path)

    # -------------------------------------------------------------
    # Test Case 9: Large Resume (Stress test)
    # -------------------------------------------------------------
    print("\n[Test 9] Large resume handling...")
    long_experience = "Developed enterprise microservices with Python, Docker, and Kubernetes. " * 300
    r9 = {
        "extractedText": f"Staff Architect.\nSkills: Python, Go, Kubernetes, Docker, AWS, PostgreSQL, Redis.\n{long_experience}",
        "skills": ["Python", "Kubernetes", "Docker", "AWS", "PostgreSQL", "Redis"]
    }
    j9 = {
        "title": "Principal Architect",
        "description": "Requires Kubernetes, AWS, and distributed systems. 8+ years experience.",
        "requiredSkills": ["Kubernetes", "AWS", "Docker"],
        "experience": "8+ years"
    }
    m9 = match_job(r9, j9)
    print(f" -> Large Resume Match: {m9['matchPercentage']}%")
    assert m9['matchPercentage'] > 0
    passed += 1
    print(" -> PASSED")

    # -------------------------------------------------------------
    # Test Case 10: Unusual Formatting & Special Characters
    # -------------------------------------------------------------
    print("\n[Test 10] Unusual formatting & technical characters (C++, C#, .NET, Node.js)...")
    unusual_text = """
    *** CURRICULUM VITAE ***
    NAME::: Alex Mercer ~~~
    LANGUAGES /// FRAMEWORKS: [C++] -- [C#] -- [.NET] -- [Node.js] -- [React.js] -- [Mongo DB]
    EXP: 3+ yrs working w/ distributed systems & cloud!
    """
    extracted_unusual_skills = extract_skills(unusual_text)
    print(f" -> Preserved Technical Tokens: {extracted_unusual_skills}")
    assert "C++" in extracted_unusual_skills, "C++ should be preserved"
    assert "C#" in extracted_unusual_skills, "C# should be preserved"
    assert "Node.js" in extracted_unusual_skills, "Node.js should be preserved"
    assert "React" in extracted_unusual_skills, "React.js should be normalized to React"
    assert "MongoDB" in extracted_unusual_skills, "Mongo DB should be normalized to MongoDB"
    passed += 1
    print(" -> PASSED")

    print("\n" + "=" * 60)
    print(f"ALL {passed}/{total} TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    run_all_tests()
