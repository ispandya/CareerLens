import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService, AdminUserSummary, PlatformStats } from './admin.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getUsers(): Promise<AdminUserSummary[]> {
    return this.adminService.getAllUsers();
  }

  @Get('stats')
  getStats(): Promise<PlatformStats> {
    return this.adminService.getPlatformStats();
  }
}
