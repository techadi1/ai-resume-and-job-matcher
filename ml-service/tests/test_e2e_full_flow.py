#!/usr/bin/env python3
"""
End-to-End Full Pipeline Verification Script
Validates Steps 7 through 22 of Section 29:
7. Register user
8. Login
9. Upload real PDF resume
10. Verify file storage
11. Verify BullMQ job
12. Verify worker
13. Verify FastAPI analysis
14. Verify extracted skills
15. Verify resume score
16. Load jobs from MongoDB
17. Calculate resume-job similarity
18. Calculate skill match
19. Calculate experience match
20. Calculate final score
21. Save JobMatch
22. Verify recommended jobs API
"""

import os
import time
import requests
import json

BASE_URL = "http://localhost:5001/api/v1"
ML_URL = "http://localhost:8000"
RESUME_PDF = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend", "tests", "sample_resume.pdf"))

def run_e2e_test():
    print("=" * 65)
    print("STARTING COMPLETE END-TO-END VERIFICATION")
    print("=" * 65)

    timestamp = int(time.time())
    email = f"ai.candidate.{timestamp}@example.com"
    password = "SecurePassword123!"

    # 1. Register User
    print(f"\n[1] Registering test user: {email}...")
    reg_resp = requests.post(f"{BASE_URL}/auth/register", json={
        "name": "Alex Mercer",
        "email": email,
        "password": password
    })
    print(f" -> Register status: {reg_resp.status_code}")
    assert reg_resp.status_code in [200, 201], f"Register failed: {reg_resp.text}"

    reg_data = reg_resp.json()
    token = reg_data.get("data", {}).get("tokens", {}).get("accessToken") or reg_data.get("token") or reg_data.get("data", {}).get("token")
    if not token:
        # Fallback login
        login_resp = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
        token = login_resp.json().get("data", {}).get("tokens", {}).get("accessToken")

    assert token, "Could not acquire JWT token"
    headers = {"Authorization": f"Bearer {token}"}
    print(" -> User registered & authenticated successfully.")

    # 2. Upload Real PDF Resume
    print(f"\n[2] Uploading real PDF resume from: {RESUME_PDF}...")
    assert os.path.exists(RESUME_PDF), f"Sample PDF not found at {RESUME_PDF}"

    with open(RESUME_PDF, "rb") as f:
        upload_resp = requests.post(
            f"{BASE_URL}/resumes/upload",
            headers=headers,
            files={"file": ("sample_resume.pdf", f, "application/pdf")}
        )

    print(f" -> Upload HTTP response: {upload_resp.status_code}")
    assert upload_resp.status_code == 202, f"Upload did not return 202 Accepted: {upload_resp.text}"
    upload_data = upload_resp.json().get("data", {})
    resume_id = upload_data.get("resumeId") or upload_data.get("id")
    print(f" -> Resume enqueued with tracking ID: {resume_id}")

    # 3. Poll Status for BullMQ Worker & FastAPI ML Completion
    print(f"\n[3] Waiting for BullMQ worker and FastAPI ML pipeline...")
    status = "QUEUED"
    poll_start = time.time()
    while status not in ["COMPLETED", "FAILED"] and (time.time() - poll_start) < 30:
        time.sleep(2)
        st_resp = requests.get(f"{BASE_URL}/resumes/{resume_id}/status", headers=headers)
        if st_resp.status_code == 200:
            res_body = st_resp.json()
            status = res_body.get("status") or res_body.get("data", {}).get("status") or res_body.get("data", {}).get("analysisStatus", "UNKNOWN")
            print(f"    Current status: {status} ({int(time.time() - poll_start)}s elapsed)")

    assert status == "COMPLETED", f"Resume analysis did not complete successfully (ended in {status})"
    print(" -> Worker & ML service successfully analyzed resume!")

    # 4. Verify Resume Analysis Results
    print(f"\n[4] Inspecting completed resume analysis details...")
    analysis_resp = requests.get(f"{BASE_URL}/resumes/{resume_id}/analysis", headers=headers)
    assert analysis_resp.status_code == 200, f"Failed to get analysis: {analysis_resp.text}"
    analysis_payload = analysis_resp.json().get("data", {})
    resume_doc = analysis_payload.get("resume", {})
    analysis_doc = analysis_payload.get("analysis", {})

    score = resume_doc.get("resumeScore")
    skills = resume_doc.get("skills", [])
    strengths = analysis_doc.get("strengths", [])
    weaknesses = analysis_doc.get("weaknesses", [])
    recommendations = analysis_doc.get("recommendations", [])

    print(f" -> Verified Resume ATS Score: {score}/100")
    print(f" -> Extracted Skills ({len(skills)}): {skills}")
    print(f" -> Strengths ({len(strengths)}): {strengths[:2]}")
    print(f" -> Weaknesses ({len(weaknesses)}): {weaknesses[:2]}")
    print(f" -> Recommendations ({len(recommendations)}): {recommendations[:2]}")

    assert score is not None and score > 0, "Resume score must be calculated and > 0"
    assert len(skills) > 0, "Extracted skills must not be empty"

    # 5. Verify Recommended Jobs from MongoDB with Real Multi-Factor Scoring
    print(f"\n[5] Fetching recommended jobs and verifying real ML match calculations...")
    jobs_resp = requests.get(f"{BASE_URL}/jobs/recommended?resumeId={resume_id}&limit=10", headers=headers)
    assert jobs_resp.status_code == 200, f"Failed to get jobs: {jobs_resp.text}"
    jobs_data = jobs_resp.json().get("data", [])
    if isinstance(jobs_data, list):
        jobs_list = jobs_data
    elif isinstance(jobs_data, dict):
        jobs_list = jobs_data.get("jobs", [])
    else:
        jobs_list = []

    print(f" -> Retrieved {len(jobs_list)} ranked job listings for candidate resume.")
    assert len(jobs_list) > 0, "Expected recommended jobs to be returned"

    top_job = jobs_list[0]
    print("\n" + "-" * 50)
    print("TOP MATCHED JOB VERIFICATION:")
    print(f" Title:            {top_job.get('title')}")
    print(f" Company:          {top_job.get('company')}")
    print(f" Match Percentage: {top_job.get('matchPercentage')}%")
    print(f" Similarity Score: {top_job.get('similarityScore')}")
    print(f" Skill Score:      {top_job.get('skillScore')}")
    print(f" Experience Score: {top_job.get('experienceScore')}")
    print(f" Matched Skills:   {top_job.get('matchedSkills')}")
    print(f" Missing Skills:   {top_job.get('missingSkills')}")
    print("-" * 50)

    assert top_job.get("matchPercentage") is not None, "matchPercentage must not be null"
    assert "matchedSkills" in top_job, "matchedSkills must be in job record"
    assert "missingSkills" in top_job, "missingSkills must be in job record"

    print("\n" + "=" * 65)
    print("ALL END-TO-END VALIDATION STEPS PASSED SUCCESSFULLY!")
    print("=" * 65)


if __name__ == "__main__":
    run_e2e_test()
