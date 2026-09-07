import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-haiku-4-5-20251001';

export interface ResumeCritique {
  overallImpression: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface InterviewPrep {
  technicalTopics: string[];
  technicalQuestions: string[];
  behavioralQuestions: string[];
}

@Injectable()
export class AiService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  private async askForJson<T>(prompt: string): Promise<T> {
    const message = await this.client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const block = message.content.find((b) => b.type === 'text');
    const text = block && 'text' in block ? block.text : '{}';
    const match = text.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : text) as T;
  }

  async critiqueResume(resumeText: string): Promise<ResumeCritique> {
    const prompt = `You are a career coach reviewing a resume for a university student applying to software engineering internships.

Resume text:
"""
${resumeText}
"""

Give honest, constructive feedback. Respond with ONLY valid JSON, no other text, in this exact shape:
{
  "overallImpression": "one or two sentence summary",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "suggestions": ["specific actionable suggestion 1", "specific actionable suggestion 2"]
}`;

    return this.askForJson<ResumeCritique>(prompt);
  }

  async explainJobFit(
    resumeText: string,
    jobDescription: string,
    matchedSkills: string[],
    missingSkills: string[],
  ): Promise<string> {
    const prompt = `You are a career coach. A student is considering applying to this job.

Resume:
"""
${resumeText}
"""

Job description:
"""
${jobDescription}
"""

Matched skills: ${matchedSkills.join(', ') || 'none'}
Missing skills: ${missingSkills.join(', ') || 'none'}

Write a short (3-5 sentence), honest, encouraging explanation of how well this student's background fits the role, and what to emphasize in their application. Respond with plain text only, no JSON, no markdown headers.`;

    const message = await this.client.messages.create({
      model: MODEL,
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });

    const block = message.content.find((b) => b.type === 'text');
    return block && 'text' in block ? block.text.trim() : '';
  }

  async generateInterviewPrep(
    jobDescription: string,
    resumeText: string,
  ): Promise<InterviewPrep> {
    const prompt = `You are helping a student prepare for an interview.

Job description:
"""
${jobDescription}
"""

Student's resume:
"""
${resumeText}
"""

Generate interview preparation content. Respond with ONLY valid JSON, no other text, in this exact shape:
{
  "technicalTopics": ["topic 1", "topic 2", "topic 3"],
  "technicalQuestions": ["question 1", "question 2", "question 3"],
  "behavioralQuestions": ["question 1", "question 2", "question 3"]
}`;

    return this.askForJson<InterviewPrep>(prompt);
  }

  async extractSkillsWithAI(text: string): Promise<string[]> {
    const prompt = `Extract technical skills, tools, frameworks, and programming languages mentioned in this text. Return ONLY a JSON array of skill names, no other text, e.g. ["React", "Kubernetes"].

Text:
"""
${text}
"""`;

    const message = await this.client.messages.create({
      model: MODEL,
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const block = message.content.find((b) => b.type === 'text');
    const text2 = block && 'text' in block ? block.text : '[]';
    const match = text2.match(/\[[\s\S]*\]/);

    try {
      return JSON.parse(match ? match[0] : '[]') as string[];
    } catch {
      return [];
    }
  }
}
