import re
from typing import Dict, List, Set, Any
import logging

logger = logging.getLogger("text_processor")

# Try loading spaCy model, with graceful fallback
nlp = None
try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_sm")
    except Exception:
        # If en_core_web_sm not downloaded, create blank English pipeline
        nlp = spacy.blank("en")
except Exception as e:
    logger.warning(f"spaCy could not be initialized: {e}")

# Standard English Stopwords list
STANDARD_STOPWORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
    "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
    "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
    "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers",
    "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've",
    "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me",
    "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on",
    "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over",
    "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't",
    "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them",
    "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll",
    "they're", "they've", "this", "those", "through", "to", "too", "under", "until",
    "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while",
    "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't",
    "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
}

# Section heading detection patterns
SECTION_PATTERNS = {
    "education": re.compile(r"(?i)\b(education|academic background|qualifications|academics|degrees)\b"),
    "experience": re.compile(r"(?i)\b(work experience|professional experience|employment history|experience|internships|work history)\b"),
    "skills": re.compile(r"(?i)\b(technical skills|skills|core competencies|technologies|proficiencies|tools & technologies)\b"),
    "projects": re.compile(r"(?i)\b(projects|academic projects|key projects|personal projects|portfolio)\b"),
    "certifications": re.compile(r"(?i)\b(certifications|certificates|licenses|credentials|accreditations)\b"),
    "summary": re.compile(r"(?i)\b(summary|professional summary|objective|career objective|about me|profile)\b")
}

def clean_text(raw_text: Any) -> str:
    """
    Step 1: Clean raw input text.
    Removes carriage returns, normalizes tabs/spaces, strips non-printable characters.
    """
    if not raw_text:
        return ""
    if not isinstance(raw_text, str):
        raw_text = str(raw_text)
    # Normalize unicode spaces and hyphens
    text = raw_text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r'[\u2010\u2011\u2012\u2013\u2014\u2015]', '-', text)
    text = re.sub(r'[\u2018\u2019]', "'", text)
    text = re.sub(r'[\u201C\u201D]', '"', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def tokenize_and_lemmatize(text: Any) -> List[str]:
    """
    Steps 2, 3, 4, 5:
    Lowercasing, Tokenization, Stopword removal, and Lemmatization.
    """
    if not text:
        return []

    cleaned = clean_text(text)
    if not cleaned:
        return []
    
    # Fast path with spaCy if available
    if nlp is not None and hasattr(nlp, "has_pipe") and "lemmatizer" in nlp.pipe_names:
        try:
            doc = nlp(cleaned.lower())
            tokens = [
                token.lemma_.strip()
                for token in doc
                if token.is_alpha and token.text.lower() not in STANDARD_STOPWORDS and len(token.text) > 1
            ]
            if tokens:
                return tokens
        except Exception as e:
            logger.warning(f"spaCy processing error: {e}")

    # Python regex and rule-based tokenization fallback
    words = re.findall(r'\b[a-zA-Z]{2,}\b', cleaned.lower())
    processed_tokens = []
    for w in words:
        if w not in STANDARD_STOPWORDS:
            # Basic suffix stemming / lemmatization rules
            if w.endswith("ies") and len(w) > 4:
                w = w[:-3] + "y"
            elif w.endswith("es") and len(w) > 3 and not w.endswith("ses"):
                w = w[:-2]
            elif w.endswith("s") and len(w) > 3 and not w.endswith("ss") and w not in {"aws", "k8s", "gis", "css", "sql"}:
                w = w[:-1]
            elif w.endswith("ing") and len(w) > 5:
                w = w[:-3]
            elif w.endswith("ed") and len(w) > 4:
                w = w[:-2]
            processed_tokens.append(w)

    return processed_tokens

def extract_keywords(text: str, top_n: int = 20) -> List[Dict[str, Any]]:
    """
    Step 6: Extracts important keyword frequencies and salient terms from text.
    """
    tokens = tokenize_and_lemmatize(text)
    if not tokens:
        return []

    freq_map: Dict[str, int] = {}
    for tok in tokens:
        freq_map[tok] = freq_map.get(tok, 0) + 1

    sorted_keywords = sorted(freq_map.items(), key=lambda x: x[1], reverse=True)
    return [{"keyword": k, "count": count} for k, count in sorted_keywords[:top_n]]

def extract_sections(text: str) -> Dict[str, str]:
    """
    Step 8: Identifies structured resume sections based on typical section headers.
    """
    lines = text.split("\n")
    sections: Dict[str, List[str]] = {
        "summary": [],
        "education": [],
        "experience": [],
        "skills": [],
        "projects": [],
        "certifications": [],
        "other": []
    }

    current_section = "other"

    for line in lines:
        stripped_line = line.strip()
        if not stripped_line:
            continue

        # Check if line looks like a header (short, capitalized or bold-like)
        if len(stripped_line.split()) <= 5:
            matched_sec = None
            for sec_name, pattern in SECTION_PATTERNS.items():
                if pattern.search(stripped_line):
                    matched_sec = sec_name
                    break
            if matched_sec:
                current_section = matched_sec
                continue

        sections[current_section].append(stripped_line)

    return {k: "\n".join(v).strip() for k, v in sections.items()}
