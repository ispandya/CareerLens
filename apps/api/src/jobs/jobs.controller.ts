import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JobsService, JobResult } from './jobs.service.js';
import { SearchJobsDto } from './dto/search-jobs.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('search')
  search(
    @CurrentUser() user: { userId: string },
    @Query() query: SearchJobsDto,
  ): Promise<JobResult[]> {
    return this.jobsService.search(user.userId, query.what, query.where, query.country);
  }

  @Get('recommendations')
  getRecommendations(
    @CurrentUser() user: { userId: string },
    @Query('where') where?: string,
  ): Promise<JobResult[]> {
    return this.jobsService.getRecommendations(user.userId, where);
  }
}
