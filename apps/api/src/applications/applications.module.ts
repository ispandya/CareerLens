import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ApplicationsService } from './applications.service.js';
import { ApplicationsController } from './applications.controller.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
