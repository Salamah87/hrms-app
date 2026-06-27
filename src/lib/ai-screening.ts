import type { Candidate, Job } from '@/types';

interface ScreeningResult {
  score: number;
  summary: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  experienceYears: number;
  relevanceScore: number;
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'need',
  'must', 'able', 'ability', 'experience', 'skills', 'knowledge',
  'including', 'preferred', 'required', 'must', 'should', 'strong',
  'excellent', 'good', 'proven', 'demonstrated', 'solid', 'plus',
]);

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().replace(/[,./()]/g, ' ').split(/\s+/);
  return [...new Set(words.filter((w) => w.length > 2 && !STOP_WORDS.has(w)))];
}

function computeOverlap(candidateText: string, keywords: string[]): {
  matched: string[]; missing: string[]; score: number;
} {
  const candidateWords = new Set(extractKeywords(candidateText));
  const matched = keywords.filter((k) => candidateWords.has(k));
  const missing = keywords.filter((k) => !candidateWords.has(k));
  const score = keywords.length > 0 ? Math.round((matched.length / keywords.length) * 100) : 50;
  return { matched, missing, score: Math.min(100, score) };
}

function estimateExperience(title: string): number {
  const levels: [RegExp, number][] = [
    [/senior|lead|principal|staff|architect|head|director|vp/i, 8],
    [/mid|intermediate|experienced/i, 4],
    [/junior|associate|trainee|intern/i, 1],
    [/fresh|graduate|entry/i, 0],
  ];
  for (const [re, yrs] of levels) {
    if (re.test(title)) return yrs;
  }
  return 3;
}

export function screenCandidate(candidate: Candidate, job: Job): ScreeningResult {
  const requirements = job.requirements || job.description || '';
  const keywords = extractKeywords(requirements);

  const candidateProfile = [
    candidate.currentTitle || '',
    candidate.currentCompany || '',
    candidate.location || '',
  ].join(' ');

  const { matched, missing, score: keywordScore } = computeOverlap(candidateProfile, keywords);
  const titleYears = estimateExperience(candidate.currentTitle || '');

  const titleRelevance = (() => {
    const titleWords = (candidate.currentTitle || '').toLowerCase().split(/\s+/);
    const jobWords = job.title.toLowerCase().split(/\s+/);
    const overlap = titleWords.filter((w) => jobWords.includes(w)).length;
    return Math.min(100, Math.round((overlap / Math.max(jobWords.length, 1)) * 80 + 20));
  })();

  const score = Math.min(100, Math.round(keywordScore * 0.6 + titleRelevance * 0.3 + Math.min(titleYears * 5, 10)));

  const summary = [
    `${candidate.firstName} ${candidate.lastName}`,
    candidate.currentTitle ? `is a ${candidate.currentTitle}` : 'is a professional',
    candidate.currentCompany ? `at ${candidate.currentCompany}` : '',
    `with ~${titleYears} years of experience.`,
    score >= 70 ? 'Strong match for this role.' : score >= 40 ? 'Potential match with some gaps.' : 'Limited match for this role.',
    matched.length > 0 ? `Matches: ${matched.slice(0, 5).join(', ')}${matched.length > 5 ? ` and ${matched.length - 5} more` : ''}.` : '',
    missing.length > 0 ? `Missing: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? ` and ${missing.length - 3} more` : ''}.` : '',
  ].filter(Boolean).join(' ');

  return { score, summary, matchedKeywords: matched, missingKeywords: missing, experienceYears: titleYears, relevanceScore: titleRelevance };
}

const JOB_TEMPLATES: Record<string, { description: string; requirements: string }> = {
  'Frontend Developer': {
    description: 'Build and maintain web applications using React, TypeScript, and modern frontend tooling. Collaborate with designers and backend engineers to deliver performant, accessible user interfaces.',
    requirements: 'React, TypeScript, JavaScript, HTML5, CSS3, responsive design, Git, REST APIs, testing (Jest/Cypress), performance optimization. Bonus: Next.js, GraphQL, Tailwind CSS, Storybook.',
  },
  'Backend Developer': {
    description: 'Design and implement scalable backend services and APIs. Work with databases, message queues, and cloud infrastructure to power our platform.',
    requirements: 'Node.js/Python/Java, PostgreSQL, RESTful API design, microservices, Docker, Git, CI/CD, unit testing, system design. Bonus: AWS/GCP, Kubernetes, GraphQL, Redis, Kafka.',
  },
  'Product Manager': {
    description: 'Define product vision, strategy, and roadmap. Work cross-functionally with engineering, design, and business teams to deliver impactful products.',
    requirements: 'Product strategy, roadmapping, user research, A/B testing, analytics, agile/scrum, stakeholder management, technical understanding, data-driven decision making. Bonus: B2B/SaaS experience, SQL.',
  },
};

export function generateJobDescription(title: string): { description: string; requirements: string } {
  const template = JOB_TEMPLATES[title];
  if (template) return template;
  return {
    description: `We are looking for a talented ${title} to join our growing team. You will work on challenging problems and collaborate with cross-functional teams to deliver high-quality solutions.`,
    requirements: `${title}, relevant technical skills, team collaboration, problem-solving, communication skills. Experience with modern tools and best practices preferred.`,
  };
}

export function generateInterviewQuestions(stageName: string, jobTitle: string): string[] {
  const questions: Record<string, string[]> = {
    'Phone Screen': [
      `Tell me about yourself and your experience with ${jobTitle} roles.`,
      'Why are you interested in this position and our company?',
      'What are your salary expectations and availability?',
    ],
    'Technical Interview': [
      `Walk me through a complex ${jobTitle} project you worked on.`,
      'How do you approach debugging and troubleshooting?',
      'Describe your experience with testing and code quality practices.',
      'How do you stay current with industry trends and technologies?',
    ],
    'Final Interview': [
      'Describe a time you had a conflict with a team member and how you resolved it.',
      'Where do you see your career in the next 3-5 years?',
      'What would success look like for you in this role after 6 months?',
    ],
  };
  return questions[stageName] || [
    `Tell me about your experience relevant to ${jobTitle}.`,
    'What attracted you to apply for this position?',
    'Describe a challenging situation you handled professionally.',
  ];
}

export function generateOfferLetter(candidateName: string, jobTitle: string, salary: number): string {
  return `
Dear ${candidateName},

We are delighted to offer you the position of ${jobTitle} at our company.

We were impressed by your skills, experience, and enthusiasm during the interview process. We believe you will be a valuable addition to our team.

Offer Details:
- Position: ${jobTitle}
- Annual Salary: $${salary.toLocaleString()}
- Start Date: To be confirmed
- Benefits: Health insurance, annual leave, professional development

Please review the attached offer letter for full details. To accept, please sign electronically via the link provided.

We look forward to welcoming you to the team!

Best regards,
The HR Team
`.trim();
}
