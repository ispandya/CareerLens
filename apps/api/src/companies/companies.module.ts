import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CompaniesService } from './companies.service.js';
import { CompaniesController } from './companies.controller.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [CompaniesController],
  providers: [CompaniesService],
})
export class CompaniesModule {}
