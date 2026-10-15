import re
from typing import Dict, List, Set, Tuple, Any

# Comprehensive, centralized catalog of technical and professional skills
SKILLS_DICTIONARY: Dict[str, List[str]] = {
    "Programming Languages": [
        "Python", "Java", "C", "C++", "C#", "JavaScript", "TypeScript",
        "SQL", "HTML", "CSS", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "R", "Bash", "Shell"
    ],
    "Frontend Frameworks & Libraries": [
        "React", "Angular", "Vue", "Next.js", "Redux", "Tailwind CSS",
        "Bootstrap", "Sass", "Webpack", "Vite", "HTML5", "CSS3"
    ],
    "Backend Frameworks & Runtime": [
        "Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot",
        "Ruby on Rails", "ASP.NET", ".NET", "GraphQL", "REST API", "Microservices", "WebSockets"
    ],
    "Databases & Caching": [
        "MongoDB", "MySQL", "PostgreSQL", "Redis", "SQLite", "Cassandra",
        "Elasticsearch", "DynamoDB", "Snowflake", "Oracle"
    ],
    "Cloud & DevOps": [
        "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "GitHub", "GitLab",
        "CI/CD", "Linux", "Terraform", "Ansible", "Jenkins", "Nginx",
        "Prometheus", "Grafana", "Cloudflare"
    ],
    "AI & Machine Learning": [
        "Machine Learning", "Deep Learning", "Artificial Intelligence", "NLP",
        "Natural Language Processing", "Computer Vision", "TensorFlow", "PyTorch",
        "Scikit-learn", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Keras",
        "XGBoost", "LangChain", "Hugging Face", "LLM", "Generative AI",
        "TF-IDF", "Cosine Similarity"
    ],
    "Data Engineering & Analytics": [
        "Data Analysis", "Data Science", "Data Engineering", "Power BI", "Tableau",
        "Excel", "Spark", "Hadoop", "ETL", "Kafka", "Data Visualization", "Statistics"
    ],
    "Soft Skills & Methodologies": [
        "Agile", "Scrum", "Problem Solving", "Communication", "Leadership",
        "Teamwork", "Critical Thinking", "Project Management", "Time Management",
        "Adaptability", "Collaboration", "Analytical Skills"
    ]
}

# Alias to canonical name map for accurate entity extraction
ALIASES: Dict[str, str] = {
    "js": "JavaScript",
    "ts": "TypeScript",
    "py": "Python",
    "reactjs": "React",
    "react.js": "React",
    "vue.js": "Vue",
    "vuejs": "Vue",
    "angularjs": "Angular",
    "angular.js": "Angular",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "node": "Node.js",
    "express.js": "Express",
    "expressjs": "Express",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mongo": "MongoDB",
    "k8s": "Kubernetes",
    "amazon web services": "AWS",
    "google cloud platform": "GCP",
    "google cloud": "GCP",
    "microsoft azure": "Azure",
    "scikit learn": "Scikit-learn",
    "sklearn": "Scikit-learn",
    "tf": "TensorFlow",
    "pytorch": "PyTorch",
    "restful api": "REST API",
    "restful apis": "REST API",
    "rest apis": "REST API",
    "rest": "REST API",
    "rest api": "REST API",
    "ml": "Machine Learning",
    "dl": "Deep Learning",
    "ai": "Artificial Intelligence",
    "nlp": "Natural Language Processing",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "github actions": "GitHub",
    "bash scripting": "Bash",
    "shell scripting": "Shell",
    "golang": "Go",
    "c#": "C#",
    "c sharp": "C#",
    "csharp": "C#",
    "c-sharp": "C#",
    "c++": "C++",
    "c plus plus": "C++",
    "cplusplus": "C++",
    "c/c++": "C++",
    "dotnet": ".NET",
    ".net": ".NET",
    "mongo db": "MongoDB",
    "tfidf": "TF-IDF",
    "llms": "LLM",
    "generative-ai": "Generative AI",
    "genai": "Generative AI"
}

# Flatten skills for direct lookup
CANONICAL_SKILLS_MAP: Dict[str, str] = {}
for category, skills in SKILLS_DICTIONARY.items():
    for skill in skills:
        CANONICAL_SKILLS_MAP[skill.lower()] = skill

# Learning paths and metadata for recommendation page
SKILL_LEARNING_PATHS: Dict[str, Dict[str, any]] = {
    "Docker": {
        "priority": "HIGH",
        "category": "Cloud & DevOps",
        "whyMatters": "Industry standard for containerization, ensuring software runs reliably across development, testing, and production environments.",
        "jobsRequiring": ["DevOps Engineer", "Backend Developer", "Cloud Engineer", "Full Stack Developer", "Machine Learning Engineer"],
        "learningPath": [
            "Containerization fundamentals vs Virtual Machines",
            "Writing Dockerfiles and building container images",
            "Managing multi-container applications with Docker Compose",
            "Docker networking, bridge drivers, and volume persistence",
            "Multi-stage builds and security hardening",
            "Container registry publishing and CI/CD integration"
        ]
    },
    "Kubernetes": {
        "priority": "HIGH",
        "category": "Cloud & DevOps",
        "whyMatters": "The world's leading container orchestration system powering production cloud native microservices at scale.",
        "jobsRequiring": ["DevOps Engineer", "Cloud Engineer", "Site Reliability Engineer", "Senior Backend Architect"],
        "learningPath": [
            "Kubernetes architecture: Control Plane, Nodes, Kubelet",
            "Pods, ReplicaSets, and Deployments",
            "Services, ClusterIP, NodePort, and Ingress controllers",
            "ConfigMaps, Secrets, and Persistent Volume Claims (PVC)",
            "Helm package management and GitOps workflows",
            "Monitoring, horizontal pod autoscaling (HPA), and logging"
        ]
    },
    "AWS": {
        "priority": "HIGH",
        "category": "Cloud & DevOps",
        "whyMatters": "The most widely adopted cloud platform with over 200 fully featured services globally.",
        "jobsRequiring": ["Cloud Engineer", "DevOps Engineer", "Backend Developer", "Full Stack Developer", "AI Engineer"],
        "learningPath": [
            "AWS Core Services: EC2, S3, IAM, and VPC networking",
            "Serverless compute with AWS Lambda and API Gateway",
            "Relational and NoSQL storage with RDS and DynamoDB",
            "Container services: ECS, EKS, and ECR",
            "Infrastructure as Code using Terraform or AWS CDK",
            "CloudWatch monitoring, cost optimization, and IAM security"
        ]
    },
    "TypeScript": {
        "priority": "HIGH",
        "category": "Programming Languages",
        "whyMatters": "Brings static type safety to JavaScript, drastically reducing runtime bugs in enterprise web and backend apps.",
        "jobsRequiring": ["Full Stack Developer", "Frontend Developer", "Backend Developer"],
        "learningPath": [
            "TypeScript basic types, interfaces, and type aliases",
            "Generics, unions, and intersection types",
            "Utility types: Partial, Pick, Omit, Record",
            "Integrating TypeScript with React and Node.js/Express",
            "Configuring tsconfig.json and strict mode best practices"
        ]
    },
    "React": {
        "priority": "HIGH",
        "category": "Frontend Frameworks & Libraries",
        "whyMatters": "The dominant UI library for building dynamic, modern web user interfaces with rich ecosystem support.",
        "jobsRequiring": ["Frontend Developer", "Full Stack Developer", "UI/UX Engineer"],
        "learningPath": [
            "Component lifecycle, JSX syntax, and props vs state",
            "Hooks in depth: useState, useEffect, useMemo, useCallback, useRef",
            "Context API and global state management (Zustand/Redux)",
            "Routing with React Router v6+",
            "Server-side rendering principles and Next.js foundations",
            "Performance profiling and component optimization"
        ]
    },
    "Node.js": {
        "priority": "HIGH",
        "category": "Backend Frameworks & Runtime",
        "whyMatters": "Enables high-concurrency event-driven server applications and asynchronous API architectures.",
        "jobsRequiring": ["Backend Developer", "Full Stack Developer", "API Developer"],
        "learningPath": [
            "Event Loop, Non-blocking I/O, and Streams",
            "REST API design with Express.js",
            "Authentication with JWT and secure password hashing",
            "Database integration with Mongoose and PostgreSQL ORMs",
            "Background queues with Redis and BullMQ",
            "Unit and integration testing with Vitest/Jest"
        ]
    },
    "Python": {
        "priority": "HIGH",
        "category": "Programming Languages",
        "whyMatters": "The undisputed primary language for AI, Machine Learning, Data Science, and rapid backend API development.",
        "jobsRequiring": ["Data Scientist", "Machine Learning Engineer", "AI Engineer", "Software Engineer", "Backend Developer"],
        "learningPath": [
            "Object-oriented programming, generators, and decorators",
            "Data manipulation with NumPy and Pandas",
            "Modern asynchronous web APIs with FastAPI",
            "Machine Learning workflows with Scikit-learn",
            "Deep Learning architectures with PyTorch",
            "Packaging, virtual environments, and Docker deployment"
        ]
    },
    "Redis": {
        "priority": "MEDIUM",
        "category": "Databases & Caching",
        "whyMatters": "In-memory data store delivering sub-millisecond responses for caching, session stores, and distributed job queues.",
        "jobsRequiring": ["Backend Developer", "Full Stack Developer", "Site Reliability Engineer"],
        "learningPath": [
            "In-memory data structures: Strings, Hashes, Lists, Sets, Sorted Sets",
            "Cache invalidation patterns (Cache-Aside, Write-Through)",
            "Distributed queues and pub/sub messaging with BullMQ",
            "TTL policies, LRU eviction, and memory optimization",
            "High availability with Redis Sentinel and Redis Cluster"
        ]
    },
    "PyTorch": {
        "priority": "HIGH",
        "category": "AI & Machine Learning",
        "whyMatters": "The preferred deep learning framework for cutting-edge AI research, computer vision, and NLP model development.",
        "jobsRequiring": ["Machine Learning Engineer", "AI Engineer", "Computer Vision Engineer", "NLP Research Engineer"],
        "learningPath": [
            "Tensors, Autograd, and computational graphs",
            "Custom Neural Network architectures with nn.Module",
            "DataLoaders, dataset transforms, and batching",
            "Loss functions, optimizers, and training loops",
            "Transfer learning and fine-tuning Hugging Face transformers",
            "Model export with TorchScript, ONNX, and FastAPI serving"
        ]
    },
    "SQL": {
        "priority": "HIGH",
        "category": "Databases & Caching",
        "whyMatters": "Universal query language essential for retrieving, transforming, and analyzing structured business data.",
        "jobsRequiring": ["Data Analyst", "Data Scientist", "Backend Developer", "Software Engineer", "Full Stack Developer"],
        "learningPath": [
            "Relational database design and normal forms",
            "Complex JOINs, GROUP BY, HAVING, and aggregations",
            "Window functions: ROW_NUMBER, RANK, DENSE_RANK, LAG/LEAD",
            "Common Table Expressions (CTEs) and Subqueries",
            "Indexes, execution query plans, and performance tuning"
        ]
    }
}

def extract_skills(text: Any) -> List[str]:
    """
    Extracts identified technical and domain skills from raw resume or job text.
    Uses regex boundary matching for exact tokens, accounting for special characters (C++, C#, .js).
    """
    if not text:
        return []
    if not isinstance(text, str):
        text = str(text)
    if not text.strip():
        return []

    text_lower = text.lower()
    found: Set[str] = set()

    # 1. Match aliases first
    for alias, canonical in ALIASES.items():
        escaped_alias = re.escape(alias)
        pattern = r'(?:^|[^a-zA-Z0-9])' + escaped_alias + r'(?=[^a-zA-Z0-9]|$)'
        if re.search(pattern, text_lower):
            found.add(canonical)

    # 2. Match canonical skills
    for skill_lower, canonical in CANONICAL_SKILLS_MAP.items():
        escaped_skill = re.escape(skill_lower)
        if skill_lower == "c":
            pattern = r'(?:^|[^a-zA-Z0-9])c(?![+#a-zA-Z0-9])'
        elif skill_lower == "r":
            pattern = r'(?:^|[^a-zA-Z0-9])r(?![a-zA-Z0-9])'
        elif skill_lower in ["c#", "c++", ".net"] or not skill_lower.isalnum():
            pattern = r'(?:^|[^a-zA-Z0-9])' + escaped_skill + r'(?=[^a-zA-Z0-9]|$)'
        elif len(skill_lower) <= 2:
            pattern = r'\b' + escaped_skill + r'\b'
        else:
            pattern = r'(?:^|[^a-zA-Z0-9])' + escaped_skill + r'(?=[^a-zA-Z0-9]|$)'

        if re.search(pattern, text_lower):
            found.add(canonical)

    return sorted(list(found))

def get_skill_category(skill_name: str) -> str:
    """Returns the primary domain category for a skill."""
    skill_lower = skill_name.lower()
    canonical = CANONICAL_SKILLS_MAP.get(skill_lower, skill_name)
    for category, skills in SKILLS_DICTIONARY.items():
        if canonical in skills:
            return category
    return "Other Technical"

def get_skill_recommendation_details(skill_name: str) -> Dict[str, any]:
    """Returns structured learning paths and justification for a recommended skill."""
    if skill_name in SKILL_LEARNING_PATHS:
        return SKILL_LEARNING_PATHS[skill_name]
    
    category = get_skill_category(skill_name)
    return {
        "priority": "MEDIUM",
        "category": category,
        "whyMatters": f"Essential skill frequently required in modern {category.lower()} workflows.",
        "jobsRequiring": ["Software Engineer", "Technical Specialist"],
        "learningPath": [
            f"Understand core principles and architecture of {skill_name}",
            f"Set up local development and practical hello-world projects with {skill_name}",
            f"Build production-grade applications leveraging {skill_name} best practices",
            f"Integrate {skill_name} into automated testing and deployment pipelines"
        ]
    }
