import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { extractSkills } from '../resume/data/extract-skills.js';

export interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  redirectUrl: string;
  salaryMin: number | null;
  salaryMax: number | null;
  matchScore: number | null;
  matchedSkills: string[];
  missingSkills: string[];
}

interface AdzunaJob {
  id: string;
  title: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
}

interface AdzunaResponse {
  results: AdzunaJob[];
}

const DEFAULT_COUNTRY = 'ca';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapResults(jobs: AdzunaJob[], resumeSkills: Set<string>): JobResult[] {
    return jobs.map((job) => {
      const jobSkills = extractSkills(job.description);
      const matchedSkills = jobSkills.filter((s) => resumeSkills.has(s.toLowerCase()));
      const missingSkills = jobSkills.filter((s) => !resumeSkills.has(s.toLowerCase()));

      const matchScore = jobSkills.length === 0
        ? null
        : Math.round((matchedSkills.length / jobSkills.length) * 100);

      return {
        id: job.id,
        title: job.title,
        company: job.company?.display_name ?? 'Unknown',
        location: job.location?.display_name ?? 'Unknown',
        description: job.description,
        redirectUrl: job.redirect_url,
        salaryMin: job.salary_min ?? null,
        salaryMax: job.salary_max ?? null,
        matchScore,
        matchedSkills,
        missingSkills,
      };
    });
  }

  private async fetchAdzuna(params: URLSearchParams, country: string): Promise<AdzunaJob[]> {
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status}`);
    }

    const data = (await response.json()) as AdzunaResponse;
    return data.results;
  }

  async search(
    userId: string,
    what: string,
    where?: string,
    country: string = DEFAULT_COUNTRY,
  ): Promise<JobResult[]> {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    const params = new URLSearchParams({
      app_id: appId ?? '',
      app_key: appKey ?? '',
      results_per_page: '10',
      what,
      'content-type': 'application/json',
    });

    if (where) {
      params.set('where', where);
    }

    const jobs = await this.fetchAdzuna(params, country);

    const resume = await this.prisma.client.resume.findUnique({ where: { userId } });
    const resumeSkills = new Set((resume?.skills ?? []).map((s) => s.toLowerCase()));

    return this.mapResults(jobs, resumeSkills);
  }

  async getRecommendations(userId: string, where?: string): Promise<JobResult[]> {
    const resume = await this.prisma.client.resume.findUnique({ where: { userId } });

    if (!resume || resume.skills.length === 0) {
      throw new NotFoundException(
        'Upload a resume first so we know what to recommend based on.',
      );
    }

    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    // Use up to 6 skills to keep the query focused; Adzuna's what_or matches ANY of them.
    const topSkills = resume.skills.slice(0, 6);

    const params = new URLSearchParams({
      app_id: appId ?? '',
      app_key: appKey ?? '',
      results_per_page: '10',
      what_or: topSkills.join(' '),
      'content-type': 'application/json',
    });

    if (where) {
      params.set('where', where);
    }

    const jobs = await this.fetchAdzuna(params, DEFAULT_COUNTRY);
    const resumeSkillsSet = new Set(resume.skills.map((s) => s.toLowerCase()));

    return this.mapResults(jobs, resumeSkillsSet);
  }
}
