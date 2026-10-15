/**
 * Skill Gap & Career Recommendation Service
 */

const resumeRepo = require('../repositories/resume.repository');
const jobMatchRepo = require('../repositories/jobMatch.repository');
const cacheService = require('./cache.service');
const { CACHE_KEYS } = require('../constants');

// Curated step-by-step learning paths for top tech skills
const SKILL_LEARNING_PATHS = {
  Docker: {
    category: 'DevOps & Containers',
    priority: 'HIGH',
    whyMatters: 'Docker standardizes environment configurations and is the core containerization tool in modern CI/CD pipelines.',
    learningPath: ['1. Containerization fundamentals', '2. Dockerfile & Image builds', '3. Multi-stage builds', '4. Docker Compose multi-container setup', '5. Volume persistence & Networking'],
  },
  Kubernetes: {
    category: 'DevOps & Cloud',
    priority: 'HIGH',
    whyMatters: 'Industry standard container orchestration platform used by leading tech enterprises for scalable deployments.',
    learningPath: ['1. Pods & Deployments architecture', '2. Services, Ingress, & DNS', '3. ConfigMaps & Secrets management', '4. Helm package manager', '5. Monitoring with Prometheus'],
  },
  AWS: {
    category: 'Cloud Computing',
    priority: 'HIGH',
    whyMatters: 'Most widely used public cloud platform with over 32% global enterprise market share.',
    learningPath: ['1. IAM security & permissions', '2. Compute (EC2, ECS, Lambda)', '3. Storage (S3, EBS, EFS)', '4. Networking (VPC, Subnets, Route53)', '5. Databases (RDS, DynamoDB)'],
  },
  Azure: {
    category: 'Cloud Computing',
    priority: 'HIGH',
    whyMatters: 'Rapidly growing enterprise cloud platform powering Microsoft-native architectures and enterprise workloads.',
    learningPath: ['1. Azure Resource Manager & Subscriptions', '2. Azure App Service & Container Apps', '3. Azure Blob Storage & Key Vault', '4. Azure Managed Redis & Cosmos DB', '5. Azure Front Door & Virtual Networks'],
  },
  TypeScript: {
    category: 'Programming Languages',
    priority: 'HIGH',
    whyMatters: 'Brings compile-time type safety to JavaScript, significantly reducing runtime production defects.',
    learningPath: ['1. Type annotations & Interfaces', '2. Generics & Utility types', '3. Discriminated unions', '4. TypeScript with React & Node.js', '5. Advanced mapped & conditional types'],
  },
  GraphQL: {
    category: 'APIs & Backend',
    priority: 'MEDIUM',
    whyMatters: 'Provides flexible, query-driven APIs eliminating over-fetching and under-fetching across microservices.',
    learningPath: ['1. Schema Definition Language (SDL)', '2. Query & Mutation resolvers', '3. DataLoader N+1 query optimization', '4. Apollo Server integration', '5. Subscriptions for real-time data'],
  },
  Redis: {
    category: 'Databases & Caching',
    priority: 'HIGH',
    whyMatters: 'Ultra-low latency in-memory data store used for session caching, distributed locks, and message queues.',
    learningPath: ['1. In-memory data structures (Strings, Hashes, Sets)', '2. TTL and Cache-aside strategies', '3. Distributed locking with Redlock/Lua', '4. BullMQ background job queues', '5. Pub/Sub and stream processing'],
  },
  'CI/CD': {
    category: 'DevOps',
    priority: 'HIGH',
    whyMatters: 'Automates testing, security scanning, container builds, and zero-downtime production deployments.',
    learningPath: ['1. GitHub Actions workflow syntax', '2. Automated testing & Lint stages', '3. Docker image building & Container Registry push', '4. Environment secrets management', '5. Automated cloud deployment pipelines'],
  },
};

class MatchingService {
  async getSkillGap(userId, resumeId) {
    let targetResume = null;
    if (resumeId) {
      targetResume = await resumeRepo.findByIdAndUser(resumeId, userId);
    } else {
      targetResume = await resumeRepo.findLatestByUserId(userId);
    }

    if (!targetResume) {
      return {
        hasResume: false,
        userSkills: [],
        matchedSkills: [],
        missingSkills: [],
        recommendedSkills: [],
      };
    }

    const cacheKey = CACHE_KEYS.RESUME_SKILL_GAP(targetResume._id);

    const { data } = await cacheService.wrap(
      cacheKey,
      async () => {
        const userSkills = (targetResume.skills || []).map((s) => s.toLowerCase());
        const userSkillsSet = new Set(userSkills);

        // Fetch top job matches
        const topMatches = await jobMatchRepo.findTopMatchesByResumeId(targetResume._id, 10);

        const skillFrequency = {};
        const skillJobMap = {};

        topMatches.forEach((match) => {
          (match.missingSkills || []).forEach((skill) => {
            const normalized = skill.trim();
            skillFrequency[normalized] = (skillFrequency[normalized] || 0) + 1;
            if (!skillJobMap[normalized]) {
              skillJobMap[normalized] = [];
            }
            if (match.jobId && match.jobId.title) {
              skillJobMap[normalized].push(`${match.jobId.title} at ${match.jobId.company}`);
            }
          });
        });

        // Sort missing skills by demand frequency across matched jobs
        const sortedMissing = Object.entries(skillFrequency)
          .sort((a, b) => b[1] - a[1])
          .map(([skill, count]) => {
            const meta = SKILL_LEARNING_PATHS[skill] || {
              category: 'Technical Competency',
              priority: count >= 3 ? 'HIGH' : count === 2 ? 'MEDIUM' : 'LOW',
              whyMatters: `Required by ${count} jobs that match your career profile.`,
              learningPath: [
                `1. Learn ${skill} syntax and fundamentals`,
                `2. Build a practical project using ${skill}`,
                `3. Integrate ${skill} into full-stack architecture`,
                `4. Add measurable project accomplishments to resume`,
              ],
            };

            return {
              skill,
              frequency: count,
              priority: meta.priority,
              category: meta.category,
              whyMatters: meta.whyMatters,
              jobsRequiring: skillJobMap[skill] ? skillJobMap[skill].slice(0, 3) : [],
              learningPath: meta.learningPath,
            };
          });

        return {
          hasResume: true,
          resumeId: targetResume._id,
          fileName: targetResume.fileName,
          resumeScore: targetResume.resumeScore,
          userSkills: targetResume.skills || [],
          totalMissingCount: sortedMissing.length,
          recommendedSkills: sortedMissing,
        };
      },
      1800
    );

    return data;
  }

  async getDashboardSummary(userId) {
    const cacheKey = CACHE_KEYS.DASHBOARD_SUMMARY(userId);

    const { data } = await cacheService.wrap(
      cacheKey,
      async () => {
        const [latestResume, totalResumes] = await Promise.all([
          resumeRepo.findLatestByUserId(userId),
          resumeRepo.countByUserId(userId),
        ]);

        if (!latestResume) {
          return {
            totalResumes: 0,
            latestResume: null,
            resumeScore: 0,
            skillsDetectedCount: 0,
            skillsDetected: [],
            jobsMatchedCount: 0,
            missingSkillsCount: 0,
            missingSkills: [],
            topJobs: [],
            recommendedSkills: [],
            scoreBreakdown: {
              skills: { score: 0, max: 30 },
              projects: { score: 0, max: 20 },
              experience: { score: 0, max: 20 },
              education: { score: 0, max: 10 },
              certifications: { score: 0, max: 10 },
              completeness: { score: 0, max: 10 },
            },
            suggestions: [
              'Upload your resume in PDF or DOCX format to receive an AI ATS score.',
              'Explore tech job listings tailored to your domain.',
            ],
            strengths: [],
            weaknesses: [],
            matchDistribution: [],
            skillDistribution: [],
          };
        }

        const topMatches = await jobMatchRepo.findTopMatchesByResumeId(latestResume._id, 6);
        const skillGapData = await this.getSkillGap(userId, latestResume._id);

        const breakdown = latestResume.analysisResult?.scoreBreakdown || {
          skills: { score: 20, max: 30 },
          projects: { score: 15, max: 20 },
          experience: { score: 15, max: 20 },
          education: { score: 8, max: 10 },
          certifications: { score: 5, max: 10 },
          completeness: { score: 8, max: 10 },
        };

        const topJobs = topMatches
          .filter((m) => m.jobId)
          .map((m) => ({
            id: m.jobId._id,
            title: m.jobId.title,
            company: m.jobId.company,
            location: m.jobId.location,
            salary: m.jobId.salary,
            type: m.jobId.jobType,
            matchPercentage: m.matchPercentage,
            similarityScore: m.similarityScore,
            skillScore: m.skillScore,
            experienceScore: m.experienceScore,
            matchedSkills: m.matchedSkills,
            missingSkills: m.missingSkills,
          }));

        return {
          totalResumes,
          latestResume: {
            id: latestResume._id,
            fileName: latestResume.fileName,
            resumeScore: latestResume.resumeScore,
            createdAt: latestResume.createdAt,
          },
          resumeScore: latestResume.resumeScore,
          skillsDetectedCount: (latestResume.skills || []).length,
          skillsDetected: latestResume.skills || [],
          jobsMatchedCount: topMatches.length,
          missingSkillsCount: (skillGapData.recommendedSkills || []).length,
          missingSkills: (skillGapData.recommendedSkills || []).map((s) => s.skill),
          topJobs,
          recommendedSkills: skillGapData.recommendedSkills || [],
          scoreBreakdown: breakdown,
          suggestions: latestResume.analysisResult?.recommendations || [],
          strengths: latestResume.analysisResult?.strengths || [],
          weaknesses: latestResume.analysisResult?.weaknesses || [],
          matchDistribution: [
            { range: '90-100%', count: topMatches.filter((m) => m.matchPercentage >= 90).length },
            { range: '75-89%', count: topMatches.filter((m) => m.matchPercentage >= 75 && m.matchPercentage < 90).length },
            { range: '60-74%', count: topMatches.filter((m) => m.matchPercentage >= 60 && m.matchPercentage < 75).length },
            { range: '<60%', count: topMatches.filter((m) => m.matchPercentage < 60).length },
          ],
          skillDistribution: (latestResume.skills || []).slice(0, 6).map((skill, index) => ({
            name: skill,
            value: Math.max(10, 100 - index * 12),
          })),
        };
      },
      600 // 10 minutes TTL
    );

    return data;
  }
}

module.exports = new MatchingService();
