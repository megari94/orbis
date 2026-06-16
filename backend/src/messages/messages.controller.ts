import { Controller, Get, Post, Param, Body, Headers, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post('media')
  @UseInterceptors(FileInterceptor('file'))
  sendMedia(
    @Headers('x-tenant-id') tenantId: string,
    @Param('conversationId') conversationId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.svc.sendMedia(tenantId, conversationId, file);
  }
}