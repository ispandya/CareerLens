import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService, AnalyticsDashboard } from './analytics.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser() user: { userId: string }): Promise<AnalyticsDashboard> {
    return this.analyticsService.getDashboard(user.userId);
  }
}
