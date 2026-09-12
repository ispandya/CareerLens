import { Controller, Get, UseGuards } from '@nestjs/common';
import { CompaniesService, CompanyInsight } from './companies.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  getMine(@CurrentUser() user: { userId: string }): Promise<CompanyInsight[]> {
    return this.companiesService.getForUser(user.userId);
  }
}
