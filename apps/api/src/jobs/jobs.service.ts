import { Injectable } from '@nestjs/common';
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

    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status}`);
    }

    const data = (await response.json()) as AdzunaResponse;

    const resume = await this.prisma.client.resume.findUnique({ where: { userId } });
    const resumeSkills = new Set((resume?.skills ?? []).map((s) => s.toLowerCase()));

    return data.results.map((job) => {
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
}
