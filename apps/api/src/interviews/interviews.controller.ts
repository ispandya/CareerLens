import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import type { Interview } from 'database';
import { InterviewsService } from './interviews.service.js';
import { CreateInterviewDto } from './dto/create-interview.dto.js';
import { UpdateInterviewDto } from './dto/update-interview.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller()
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post('applications/:applicationId/interviews')
  create(
    @CurrentUser() user: { userId: string },
    @Param('applicationId') applicationId: string,
    @Body() dto: CreateInterviewDto,
  ): Promise<Interview> {
    return this.interviewsService.create(user.userId, applicationId, dto);
  }

  @Get('applications/:applicationId/interviews')
  findAll(
    @CurrentUser() user: { userId: string },
    @Param('applicationId') applicationId: string,
  ): Promise<Interview[]> {
    return this.interviewsService.findAllForApplication(user.userId, applicationId);
  }

  @Patch('interviews/:id')
  update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateInterviewDto,
  ): Promise<Interview> {
    return this.interviewsService.update(user.userId, id, dto);
  }

  @Delete('interviews/:id')
  remove(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ): Promise<Interview> {
    return this.interviewsService.remove(user.userId, id);
  }
}
