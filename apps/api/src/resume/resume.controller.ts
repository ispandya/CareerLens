import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post('upload-pdf')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(
    @CurrentUser() user: { userId: string },
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Resume> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('File must be a PDF');
    }

    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: file.buffer });
    const result = await parser.getText();

    if (!result.text || result.text.trim().length < 20) {
      throw new BadRequestException(
        'Could not extract enough text from this PDF. It may be a scanned image rather than text.',
      );
    }

    return this.resumeService.upload(user.userId, result.text);
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
