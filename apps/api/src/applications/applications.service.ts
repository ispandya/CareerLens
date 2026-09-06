import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { Application } from 'database';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { UpdateApplicationDto } from './dto/update-application.dto.js';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateApplicationDto): Promise<Application> {
    return this.prisma.client.application.create({
      data: {
        userId,
        company: dto.company,
        role: dto.role,
        jobUrl: dto.jobUrl,
        location: dto.location,
        jobType: dto.jobType,
        dateApplied: dto.dateApplied ? new Date(dto.dateApplied) : undefined,
        salary: dto.salary,
        status: dto.status,
        notes: dto.notes,
      },
    });
  }

  findAll(userId: string): Promise<Application[]> {
    return this.prisma.client.application.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string): Promise<Application> {
    const application = await this.prisma.client.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('You do not own this application');
    }

    return application;
  }

  async update(userId: string, id: string, dto: UpdateApplicationDto): Promise<Application> {
    await this.findOne(userId, id);

    return this.prisma.client.application.update({
      where: { id },
      data: {
        ...dto,
        dateApplied: dto.dateApplied ? new Date(dto.dateApplied) : undefined,
      },
    });
  }

  async remove(userId: string, id: string): Promise<Application> {
    await this.findOne(userId, id);

    return this.prisma.client.application.delete({
      where: { id },
    });
  }
}
