import { Controller, Get, Post, Param, Body, Headers } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('messages')
@Controller('conversations/:conversationId/messages')
export class MessagesController {
  constructor(private readonly svc: MessagesService) {}

  @Get()
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Param('conversationId') conversationId: string,
  ) {
    return this.svc.findAll(tenantId, conversationId);
  }

  @Post()
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Param('conversationId') conversationId: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.svc.create(tenantId, conversationId, dto);
  }
}