import { Injectable, NotFoundException } from '@nestjs/common';
import type { Resume } from 'database';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiService } from '../ai/ai.service.js';
import { extractSkills } from './data/extract-skills.js';

export interface JobAnalysisResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  jobSkills: string[];
}

@Injectable()
export class ResumeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async upload(userId: string, text: string): Promise<Resume> {
    const keywordSkills = extractSkills(text);

    let aiSkills: string[] = [];
    try {
      aiSkills = await this.aiService.extractSkillsWithAI(text);
    } catch {
      // AI extraction is a nice-to-have enhancement; fall back to keyword-only if it fails
    }

    const skills = Array.from(new Set([...keywordSkills, ...aiSkills]));

    return this.prisma.client.resume.upsert({
      where: { userId },
      create: { userId, rawText: text, skills },
      update: { rawText: text, skills },
    });
  }

  async getMine(userId: string): Promise<Resume> {
    const resume = await this.prisma.client.resume.findUnique({
      where: { userId },
    });

    if (!resume) {
      throw new NotFoundException('No resume uploaded yet');
    }

    return resume;
  }

  async analyzeJob(userId: string, jobDescription: string): Promise<JobAnalysisResult> {
    const resume = await this.getMine(userId);
    const jobSkills = extractSkills(jobDescription);

    const resumeSkillsSet = new Set(resume.skills.map((s) => s.toLowerCase()));
    const matchedSkills = jobSkills.filter((s) => resumeSkillsSet.has(s.toLowerCase()));
    const missingSkills = jobSkills.filter((s) => !resumeSkillsSet.has(s.toLowerCase()));

    const matchScore = jobSkills.length === 0
      ? 0
      : Math.round((matchedSkills.length / jobSkills.length) * 100);

    return { matchScore, matchedSkills, missingSkills, jobSkills };
  }
}
