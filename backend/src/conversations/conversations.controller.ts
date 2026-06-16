import { Controller, Get, Patch, Delete, Param, Body, Query, Headers } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('conversations')
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly svc: ConversationsService) {}

  @Get()
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('status') status?: string,
    @Query('channel') channel?: string,
    @Query('assignedTo') assignedTo?: string,
  ) {
    return this.svc.findAll(tenantId, { status, channel, assignedTo });
  }

  @Get(':id')
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.svc.findOne(tenantId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateConversationDto,
  ) {
    return this.svc.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.svc.remove(tenantId, id);
  }
}