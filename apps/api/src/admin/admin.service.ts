import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface AdminUserSummary {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  applicationCount: number;
}

export interface PlatformStats {
  totalUsers: number;
  totalApplications: number;
  totalResumes: number;
  statusBreakdown: Record<string, number>;
  usersLast7Days: number;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers(): Promise<AdminUserSummary[]> {
    const users = await this.prisma.client.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { applications: true } } },
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
      applicationCount: u._count.applications,
    }));
  }

  async getPlatformStats(): Promise<PlatformStats> {
    const [totalUsers, totalApplications, totalResumes, applications, usersLast7Days] =
      await Promise.all([
        this.prisma.client.user.count(),
        this.prisma.client.application.count(),
        this.prisma.client.resume.count(),
        this.prisma.client.application.findMany({ select: { status: true } }),
        this.prisma.client.user.count({
          where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        }),
      ]);

    const statusBreakdown: Record<string, number> = {};
    for (const app of applications) {
      statusBreakdown[app.status] = (statusBreakdown[app.status] ?? 0) + 1;
    }

    return { totalUsers, totalApplications, totalResumes, statusBreakdown, usersLast7Days };
  }
}
