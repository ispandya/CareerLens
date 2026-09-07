import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiService, ResumeCritique, InterviewPrep } from './ai.service.js';
import { ResumeFeedbackDto } from './dto/resume-feedback.dto.js';
import { JobFitDto } from './dto/job-fit.dto.js';
import { InterviewPrepDto } from './dto/interview-prep.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('resume-feedback')
  resumeFeedback(@Body() dto: ResumeFeedbackDto): Promise<ResumeCritique> {
    return this.aiService.critiqueResume(dto.resumeText);
  }

  @Post('job-fit')
  jobFit(@Body() dto: JobFitDto): Promise<{ narrative: string }> {
    return this.aiService
      .explainJobFit(dto.resumeText, dto.jobDescription, [], [])
      .then((narrative) => ({ narrative }));
  }

  @Post('interview-prep')
  interviewPrep(@Body() dto: InterviewPrepDto): Promise<InterviewPrep> {
    return this.aiService.generateInterviewPrep(dto.jobDescription, dto.resumeText);
  }
}
