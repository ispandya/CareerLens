import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface AnalyticsDashboard {
  totalApplications: number;
  pipeline: Record<string, number>;
  interviews: number;
  offers: number;
  responseRate: number;
  funnel: {
    applicationToResponse: number;
    responseToInterview: number;
    interviewToOffer: number;
  };
}

const INTERVIEW_STAGES = ['PHONE_SCREEN', 'INTERVIEW', 'FINAL_INTERVIEW', 'OFFER'];
const RESPONDED_STAGES = ['OA', 'PHONE_SCREEN', 'INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'REJECTED'];

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string): Promise<AnalyticsDashboard> {
    const applications = await this.prisma.client.application.findMany({
      where: { userId },
      select: { status: true },
    });

    const totalApplications = applications.length;

    const pipeline: Record<string, number> = {};
    for (const app of applications) {
      pipeline[app.status] = (pipeline[app.status] ?? 0) + 1;
    }

    const appliedOrFurther = applications.filter((a) => a.status !== 'SAVED').length;
    const responded = applications.filter((a) => RESPONDED_STAGES.includes(a.status)).length;
    const interviewed = applications.filter((a) => INTERVIEW_STAGES.includes(a.status)).length;
    const offers = applications.filter((a) => a.status === 'OFFER').length;

    const responseRate = appliedOrFurther === 0
      ? 0
      : Math.round((responded / appliedOrFurther) * 1000) / 10;

    const applicationToResponse = appliedOrFurther === 0
      ? 0
      : Math.round((responded / appliedOrFurther) * 1000) / 10;

    const responseToInterview = responded === 0
      ? 0
      : Math.round((interviewed / responded) * 1000) / 10;

    const interviewToOffer = interviewed === 0
      ? 0
      : Math.round((offers / interviewed) * 1000) / 10;

    return {
      totalApplications,
      pipeline,
      interviews: interviewed,
      offers,
      responseRate,
      funnel: { applicationToResponse, responseToInterview, interviewToOffer },
    };
  }
}
