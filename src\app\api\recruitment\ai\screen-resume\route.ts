import { NextResponse } from 'next/server';
import { screenCandidate, generateJobDescription, generateInterviewQuestions, generateOfferLetter } from '@/lib/ai-screening';
import { getJobById } from '@/lib/recruitment-store';
import type { NextRequest } from 'next/server';
import type { Candidate } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, candidate, jobId, jobTitle } = body;

    switch (action) {
      case 'screen-resume': {
        if (!candidate || !jobId) {
          return NextResponse.json({ error: 'Missing candidate or jobId' }, { status: 400 });
        }
        const job = await getJobById(jobId);
        if (!job) {
          return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }
        const result = screenCandidate(candidate as Candidate, job);
        return NextResponse.json(result);
      }

      case 'generate-jd': {
        if (!jobTitle) {
          return NextResponse.json({ error: 'Missing jobTitle' }, { status: 400 });
        }
        const jd = generateJobDescription(jobTitle);
        return NextResponse.json(jd);
      }

      case 'interview-questions': {
        if (!body.stageName || !jobTitle) {
          return NextResponse.json({ error: 'Missing stageName or jobTitle' }, { status: 400 });
        }
        const questions = generateInterviewQuestions(body.stageName, jobTitle);
        return NextResponse.json({ questions });
      }

      case 'generate-offer-letter': {
        if (!body.candidateName || !jobTitle || !body.salary) {
          return NextResponse.json({ error: 'Missing candidateName, jobTitle, or salary' }, { status: 400 });
        }
        const letter = generateOfferLetter(body.candidateName, jobTitle, Number(body.salary));
        return NextResponse.json({ letter });
      }

      default:
        return NextResponse.json({ error: 'Invalid action. Use: screen-resume, generate-jd, interview-questions, generate-offer-letter' }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}
