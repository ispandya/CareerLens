import { Controller, Get, UseGuards } from '@nestjs/common';
import { NotificationsService, Notification } from './notifications.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getMine(@CurrentUser() user: { userId: string }): Promise<Notification[]> {
    return this.notificationsService.getForUser(user.userId);
  }
}
