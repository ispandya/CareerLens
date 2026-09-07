import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { Interview } from 'database';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateInterviewDto } from './dto/create-interview.dto.js';
import { UpdateInterviewDto } from './dto/update-interview.dto.js';

@Injectable()
export class InterviewsService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyApplicationOwnership(userId: string, applicationId: string) {
    const application = await this.prisma.client.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('You do not own this application');
    }
  }

  async create(
    userId: string,
    applicationId: string,
    dto: CreateInterviewDto,
  ): Promise<Interview> {
    await this.verifyApplicationOwnership(userId, applicationId);

    return this.prisma.client.interview.create({
      data: {
        applicationId,
        round: dto.round,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        notes: dto.notes,
      },
    });
  }

  async findAllForApplication(userId: string, applicationId: string): Promise<Interview[]> {
    await this.verifyApplicationOwnership(userId, applicationId);

    return this.prisma.client.interview.findMany({
      where: { applicationId },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  private async findInterviewWithOwnershipCheck(userId: string, id: string): Promise<Interview> {
    const interview = await this.prisma.client.interview.findUnique({
      where: { id },
      include: { application: true },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (interview.application.userId !== userId) {
      throw new ForbiddenException('You do not own this interview');
    }

    return interview;
  }

  async update(userId: string, id: string, dto: UpdateInterviewDto): Promise<Interview> {
    await this.findInterviewWithOwnershipCheck(userId, id);

    return this.prisma.client.interview.update({
      where: { id },
      data: {
        ...dto,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
    });
  }

  async remove(userId: string, id: string): Promise<Interview> {
    await this.findInterviewWithOwnershipCheck(userId, id);

    return this.prisma.client.interview.delete({
      where: { id },
    });
  }
}
