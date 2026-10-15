import re
from typing import Dict, List, Any

def _normalize_text_field(val: Any) -> str:
    """Safely normalizes strings, lists, tuples, or dicts into clean text string."""
    if not val:
        return ""
    if isinstance(val, str):
        return val.strip()
    if isinstance(val, (list, tuple, set)):
        return "\n".join(str(item) for item in val if item).strip()
    if isinstance(val, dict):
        return "\n".join(f"{k}: {v}" for k, v in val.items() if v).strip()
    return str(val).strip()

def analyze_resume(parsed_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates resume completeness and calculates an ATS-style dynamic resume score (0-100).
    Breakdown:
      - Skills: 30 pts
      - Projects: 20 pts
      - Experience: 20 pts
      - Education: 10 pts
      - Certifications: 10 pts
      - Keywords & Completeness: 10 pts
    Generates dynamic strengths, weaknesses, and targeted improvement recommendations.
    """
    if not parsed_data or not isinstance(parsed_data, dict):
        parsed_data = {}

    # Safely extract skills (handles None, strings, or lists)
    raw_skills = parsed_data.get("skills")
    if isinstance(raw_skills, list):
        skills = [str(s) for s in raw_skills if s]
    elif isinstance(raw_skills, str):
        skills = [s.strip() for s in raw_skills.split(",") if s.strip()]
    else:
        skills = []

    education: str = _normalize_text_field(parsed_data.get("education"))
    experience: str = _normalize_text_field(parsed_data.get("experience"))
    projects: str = _normalize_text_field(parsed_data.get("projects"))
    certifications: str = _normalize_text_field(parsed_data.get("certifications"))
    extracted_text: str = _normalize_text_field(parsed_data.get("extractedText"))

    raw_keywords = parsed_data.get("keywords")
    keywords: List[Dict[str, Any]] = raw_keywords if isinstance(raw_keywords, list) else []

    raw_word_count = parsed_data.get("wordCount")
    if isinstance(raw_word_count, (int, float)):
        word_count = int(raw_word_count)
    else:
        word_count = len(extracted_text.split()) if extracted_text else 0

    strengths: List[str] = []
    weaknesses: List[str] = []
    recommendations: List[str] = []

    # 1. Skills Scoring (Max 30)
    # 0 skills -> 0; 1-4 skills -> 10; 5-9 skills -> 20; 10-14 skills -> 26; 15+ skills -> 30
    skill_count = len(skills)
    if skill_count >= 15:
        skills_score = 30
        strengths.append(f"Strong and diverse technical skillset identified ({skill_count} key technical competencies).")
    elif skill_count >= 10:
        skills_score = 26
        strengths.append(f"Solid technical skills inventory ({skill_count} verified skills).")
    elif skill_count >= 6:
        skills_score = 20
    elif skill_count >= 3:
        skills_score = 14
        weaknesses.append("Moderate skill representation. Additional technical stack proficiencies would increase ATS match rates.")
        recommendations.append("Expand your skills section with modern frameworks, cloud tools, and databases you have worked with.")
    else:
        skills_score = 6
        weaknesses.append("Very low number of industry-standard technical skills detected.")
        recommendations.append("Add a distinct 'Technical Skills' section detailing programming languages, frameworks, cloud services, and developer tools.")

    # 2. Projects Scoring (Max 20)
    # Check length of project section and action verbs / metrics
    if projects and len(projects.split()) > 40:
        # Check for measurable metrics (percentages, numbers, users, etc.)
        has_metrics = bool(re.search(r'\b(\d+[\d,]*%|\$\d+|\d+\+?\s*(users|clients|requests|ms|qps|endpoints))\b', projects, re.IGNORECASE))
        if has_metrics:
            projects_score = 20
            strengths.append("Project portfolio highlights quantifiable impact and metrics.")
        else:
            projects_score = 16
            recommendations.append("Add quantifiable metrics (e.g., '% performance improvement', 'number of active users') to your project bullet points.")
    elif projects and len(projects.strip()) > 10:
        projects_score = 12
        weaknesses.append("Project descriptions are relatively brief.")
        recommendations.append("Elaborate on 2-3 key technical projects, mentioning technologies used, architecture, and personal contributions.")
    else:
        projects_score = 4
        weaknesses.append("No dedicated projects section detected.")
        recommendations.append("Include a 'Projects' section showcasing hands-on applications, GitHub repositories, or open-source contributions.")

    # 3. Experience Scoring (Max 20)
    if experience and len(experience.split()) > 50:
        action_verb_count = len(re.findall(r'(?i)\b(led|developed|designed|implemented|architected|optimized|created|built|managed|delivered|reduced|increased)\b', experience))
        if action_verb_count >= 4:
            experience_score = 20
            strengths.append("Work experience descriptions utilize strong action verbs and professional accomplishment phrasing.")
        else:
            experience_score = 16
            recommendations.append("Use stronger action verbs (e.g., 'Architected', 'Spearheaded', 'Optimized') to begin each experience bullet point.")
    elif experience and len(experience.strip()) > 15:
        experience_score = 12
        weaknesses.append("Professional experience details are sparse.")
        recommendations.append("Detail your role responsibilities, specific contributions, and technologies leveraged at previous organizations.")
    else:
        experience_score = 5
        weaknesses.append("Minimal or no formal work experience or internship section detected.")
        recommendations.append("Add an 'Experience' or 'Internships' section to outline professional, academic, or freelance work.")

    # 4. Education Scoring (Max 10)
    if education and len(education.strip()) > 15:
        education_score = 10
        has_degree = bool(re.search(r'(?i)\b(bachelor|master|b\.s|m\.s|b\.tech|m\.tech|phd|diploma|associate|degree)\b', education))
        if has_degree:
            strengths.append("Clear educational degree and academic credentials listed.")
        else:
            strengths.append("Education section detected.")
    else:
        education_score = 3
        weaknesses.append("Education details appear missing or incomplete.")
        recommendations.append("Include your degree title, university/institution, graduation year, and relevant academic coursework.")

    # 5. Certifications Scoring (Max 10)
    if certifications and len(certifications.strip()) > 15:
        certifications_score = 10
        strengths.append("Recognized certifications and industry credentials provided.")
    else:
        # Check if text contains mention of common certificates even without dedicated section
        if re.search(r'(?i)\b(certified|certification|aws certified|comptia|cissp|pmp|coursera|udemy|cisco)\b', extracted_text):
            certifications_score = 6
        else:
            certifications_score = 2
            weaknesses.append("No professional certifications or specialized credentials identified.")
            recommendations.append("Consider earning cloud or framework certifications (e.g., AWS Certified Cloud Practitioner, Docker, or Google Cloud) to boost credentials.")

    # 6. Keywords & Completeness Scoring (Max 10)
    contact_points = sum([
        bool(parsed_data.get("email")),
        bool(parsed_data.get("phone")),
        bool(parsed_data.get("linkedin")),
        bool(parsed_data.get("github")),
        bool(parsed_data.get("candidateName"))
    ])
    
    completeness_pts = min(4, contact_points)
    
    # Word count evaluation (300-800 words is standard resume sweet spot)
    if 300 <= word_count <= 950:
        word_count_pts = 4
        strengths.append(f"Appropriate resume length ({word_count} words), ideal for single/two-page ATS parsing.")
    elif 150 <= word_count < 300:
        word_count_pts = 2
        recommendations.append("Your resume appears slightly short. Consider expanding on project details and core skills.")
    else:
        word_count_pts = 2
        if word_count > 950:
            recommendations.append("Resume exceeds 950 words. Consider condensing content to 1-2 concise, high-impact pages.")

    keyword_density_pts = 2 if len(keywords) >= 12 else 1
    keywords_score = completeness_pts + word_count_pts + keyword_density_pts

    # Total Score Calculation (capped at 100)
    total_score = min(100, skills_score + projects_score + experience_score + education_score + certifications_score + keywords_score)

    # Ensure suggestions and weaknesses are non-empty
    if not weaknesses:
        weaknesses.append("Resume is well-rounded. Ongoing maintenance of modern tech stack certifications is recommended.")
    if not recommendations:
        recommendations.append("Keep your GitHub portfolio active with recent repositories to reinforce your practical skills.")

    return {
        "overallScore": total_score,
        "scoreBreakdown": {
            "skills": {"score": skills_score, "max": 30},
            "projects": {"score": projects_score, "max": 20},
            "experience": {"score": experience_score, "max": 20},
            "education": {"score": education_score, "max": 10},
            "certifications": {"score": certifications_score, "max": 10},
            "completeness": {"score": keywords_score, "max": 10}
        },
        "strengths": strengths[:4],
        "weaknesses": weaknesses[:4],
        "recommendations": recommendations[:5]
    }
