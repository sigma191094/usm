import { Controller, Get, Patch, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Get() @ApiOperation({ summary: 'My notifications' })
  getMyNotifications(@Request() req) { return this.service.getMyNotifications(req.user.id); }

  @Patch(':id/read') @ApiOperation({ summary: 'Mark notification as read' })
  markRead(@Param('id', ParseIntPipe) id: number, @Request() req) { return this.service.markRead(id, req.user.id); }

  @Patch('read-all') @ApiOperation({ summary: 'Mark all as read' })
  markAllRead(@Request() req) { return this.service.markAllRead(req.user.id); }
}
