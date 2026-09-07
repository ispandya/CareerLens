import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ResumeService } from './resume.service.js';
import { ResumeController } from './resume.controller.js';
import { AiModule } from '../ai/ai.module.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), AiModule],
  controllers: [ResumeController],
  providers: [ResumeService],
})
export class ResumeModule {}