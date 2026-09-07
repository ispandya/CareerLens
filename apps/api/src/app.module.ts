import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ApplicationsModule } from './applications/applications.module.js';
import { ResumeModule } from './resume/resume.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { AiModule } from './ai/ai.module.js';

@Module({
  imports: [PrismaModule, AuthModule, ApplicationsModule, ResumeModule, AnalyticsModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}