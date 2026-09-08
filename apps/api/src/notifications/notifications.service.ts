import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface Notification {
  id: string;
  type: 'follow_up' | 'upcoming_interview';
  message: string;
  relatedApplicationId: string;
}

const STALE_THRESHOLD_DAYS = 7;
const UPCOMING_INTERVIEW_WINDOW_DAYS = 3;

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getForUser(userId: string): Promise<Notification[]> {
    const notifications: Notification[] = [];
    const now = Date.now();

    const staleApps = await this.prisma.client.application.findMany({
      where: {
        userId,
        status: { in: ['APPLIED', 'OA'] },
        updatedAt: { lt: new Date(now - STALE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000) },
      },
    });

    for (const app of staleApps) {
      const daysSince = Math.floor((now - app.updatedAt.getTime()) / (24 * 60 * 60 * 1000));
      notifications.push({
        id: `follow-up-${app.id}`,
        type: 'follow_up',
        message: `No update on ${app.company} (${app.role}) in ${daysSince} days - consider following up.`,
        relatedApplicationId: app.id,
      });
    }

    const upcomingInterviews = await this.prisma.client.interview.findMany({
      where: {
        scheduledAt: {
          gte: new Date(now),
          lte: new Date(now + UPCOMING_INTERVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000),
        },
        application: { userId },
      },
      include: { application: true },
    });

    for (const iv of upcomingInterviews) {
      const dateStr = iv.scheduledAt?.toLocaleDateString() ?? '';
      notifications.push({
        id: `interview-${iv.id}`,
        type: 'upcoming_interview',
        message: `${iv.round} with ${iv.application.company} coming up on ${dateStr}.`,
        relatedApplicationId: iv.applicationId,
      });
    }

    return notifications;
  }
}
