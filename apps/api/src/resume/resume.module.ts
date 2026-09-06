import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ResumeService } from './resume.service.js';
import { ResumeController } from './resume.controller.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [ResumeController],
  providers: [ResumeService],
})
export class ResumeModule {}
