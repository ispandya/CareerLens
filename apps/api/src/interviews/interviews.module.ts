import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { InterviewsService } from './interviews.service.js';
import { InterviewsController } from './interviews.controller.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [InterviewsController],
  providers: [InterviewsService],
})
export class InterviewsModule {}
