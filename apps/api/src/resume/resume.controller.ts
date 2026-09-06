import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { Resume } from 'database';
import { ResumeService, JobAnalysisResult } from './resume.service.js';
import { UploadResumeDto } from './dto/upload-resume.dto.js';
import { AnalyzeJobDto } from './dto/analyze-job.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post()
  upload(
    @CurrentUser() user: { userId: string },
    @Body() dto: UploadResumeDto,
  ): Promise<Resume> {
    return this.resumeService.upload(user.userId, dto.text);
  }

  @Get()
  getMine(@CurrentUser() user: { userId: string }): Promise<Resume> {
    return this.resumeService.getMine(user.userId);
  }

  @Post('analyze')
  analyzeJob(
    @CurrentUser() user: { userId: string },
    @Body() dto: AnalyzeJobDto,
  ): Promise<JobAnalysisResult> {
    return this.resumeService.analyzeJob(user.userId, dto.jobDescription);
  }
}
