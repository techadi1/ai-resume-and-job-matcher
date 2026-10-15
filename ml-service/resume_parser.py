import os
import re
from typing import Dict, List, Any, Optional
try:
    import pymupdf as fitz
except ImportError:
    import fitz
import docx  # python-docx

from text_processor import clean_text, extract_sections, extract_keywords
from skill_extractor import extract_skills

# Regex patterns for contact information
EMAIL_REGEX = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')
PHONE_REGEX = re.compile(r'(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?')
LINKEDIN_REGEX = re.compile(r'linkedin\.com/in/[a-zA-Z0-9_-]+', re.IGNORECASE)
GITHUB_REGEX = re.compile(r'github\.com/[a-zA-Z0-9_-]+', re.IGNORECASE)

def extract_text_from_pdf(file_path: str) -> str:
    """Extract raw text from PDF using PyMuPDF (fitz)."""
    text_content = []
    try:
        doc = fitz.open(file_path)
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            if text:
                text_content.append(text)
        doc.close()
    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")

    return "\n".join(text_content)

def extract_text_from_docx(file_path: str) -> str:
    """Extract raw text from DOCX using python-docx."""
    text_content = []
    try:
        doc = docx.Document(file_path)
        for para in doc.paragraphs:
            if para.text.strip():
                text_content.append(para.text)
        for table in doc.tables:
            for row in table.rows:
                row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_cells:
                    text_content.append(" | ".join(row_cells))
    except Exception as e:
        raise ValueError(f"Failed to extract text from DOCX: {str(e)}")

    return "\n".join(text_content)

def extract_text(file_path: str) -> str:
    """Detect file extension and extract text accordingly."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Resume file not found at: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        raw = extract_text_from_pdf(file_path)
    elif ext == ".docx":
        raw = extract_text_from_docx(file_path)
    elif ext == ".doc":
        try:
            raw = extract_text_from_docx(file_path)
        except Exception:
            raise ValueError("Legacy .doc binary format is not supported. Please upload a .pdf, .docx, or .txt resume.")
    elif ext in [".txt", ".md"]:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            raw = f.read()
    else:
        raise ValueError(f"Unsupported file format: {ext}. Only PDF, DOCX, and TXT are supported.")

    return clean_text(raw)

def extract_candidate_name(text: str, lines: List[str]) -> Optional[str]:
    """
    Attempt to extract the candidate's name. Usually found in the top 3-5 lines
    before emails and phone numbers.
    """
    for line in lines[:5]:
        stripped = line.strip()
        # Avoid lines that contain emails, phone numbers, urls, or common headers
        if (
            stripped
            and not EMAIL_REGEX.search(stripped)
            and not PHONE_REGEX.search(stripped)
            and not LINKEDIN_REGEX.search(stripped)
            and not GITHUB_REGEX.search(stripped)
            and len(stripped.split()) <= 4
            and not re.search(r'(?i)\b(resume|curriculum|cv|summary|profile|page)\b', stripped)
        ):
            # Clean title prefixes or characters
            candidate = re.sub(r'[^a-zA-Z\s.-]', '', stripped).strip()
            if len(candidate) > 2:
                return candidate
    return None

def parse_resume(file_path: str) -> Dict[str, Any]:
    """
    Parses a resume file (PDF/DOCX) and extracts all structured information:
    - Name, Email, Phone, Social links
    - Skills (technical & domain)
    - Identified sections (Education, Experience, Projects, Certifications)
    - Keywords & completeness metrics
    """
    cleaned_text = extract_text(file_path)
    if not cleaned_text or len(cleaned_text.strip()) < 40:
        raise ValueError("The uploaded resume file contains insufficient readable text. Please upload a valid resume.")

    lines = [line.strip() for line in cleaned_text.split("\n") if line.strip()]

    # 1. Contact Info
    email_match = EMAIL_REGEX.search(cleaned_text)
    email = email_match.group(0) if email_match else None

    phone_match = PHONE_REGEX.search(cleaned_text)
    phone = phone_match.group(0).strip() if phone_match else None

    linkedin_match = LINKEDIN_REGEX.search(cleaned_text)
    linkedin = f"https://{linkedin_match.group(0)}" if linkedin_match else None

    github_match = GITHUB_REGEX.search(cleaned_text)
    github = f"https://{github_match.group(0)}" if github_match else None

    candidate_name = extract_candidate_name(cleaned_text, lines)

    # 2. Sections
    sections = extract_sections(cleaned_text)

    # 3. Skills
    skills = extract_skills(cleaned_text)

    # 4. Keywords
    keywords = extract_keywords(cleaned_text, top_n=25)

    return {
        "candidateName": candidate_name,
        "email": email,
        "phone": phone,
        "linkedin": linkedin,
        "github": github,
        "extractedText": cleaned_text,
        "skills": skills,
        "education": sections.get("education", ""),
        "experience": sections.get("experience", ""),
        "projects": sections.get("projects", ""),
        "certifications": sections.get("certifications", ""),
        "summary": sections.get("summary", ""),
        "keywords": keywords,
        "wordCount": len(cleaned_text.split()),
        "characterCount": len(cleaned_text)
    }
