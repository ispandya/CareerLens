import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface CompanyInsight {
  company: string;
  totalApplications: number;
  statusBreakdown: Record<string, number>;
  interviewCount: number;
  offerCount: number;
  rejectionCount: number;
  lastActivity: Date;
}

const INTERVIEW_STAGES = ['PHONE_SCREEN', 'INTERVIEW', 'FINAL_INTERVIEW', 'OFFER'];

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async getForUser(userId: string): Promise<CompanyInsight[]> {
    const applications = await this.prisma.client.application.findMany({
      where: { userId },
      select: { company: true, status: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });

    const byCompany = new Map<string, typeof applications>();

    for (const app of applications) {
      const key = app.company.trim().toLowerCase();
      const existing = byCompany.get(key) ?? [];
      existing.push(app);
      byCompany.set(key, existing);
    }

    const insights: CompanyInsight[] = [];

    for (const apps of byCompany.values()) {
      const statusBreakdown: Record<string, number> = {};
      let interviewCount = 0;
      let offerCount = 0;
      let rejectionCount = 0;

      for (const app of apps) {
        statusBreakdown[app.status] = (statusBreakdown[app.status] ?? 0) + 1;
        if (INTERVIEW_STAGES.includes(app.status)) interviewCount++;
        if (app.status === 'OFFER') offerCount++;
        if (app.status === 'REJECTED') rejectionCount++;
      }

      insights.push({
        company: apps[0].company,
        totalApplications: apps.length,
        statusBreakdown,
        interviewCount,
        offerCount,
        rejectionCount,
        lastActivity: apps[0].updatedAt,
      });
    }

    return insights.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }
}
