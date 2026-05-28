import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AiBotService } from './ai-bot.service';
import { UpsertBotConfigDto } from './dto/bot-config.dto';

@ApiTags('ai-bot')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('ai-bot')
export class AiBotController {
  constructor(private readonly svc: AiBotService) {}

  @Get('config')
  getConfig(@GetUser('tenantId') tenantId: string) {
    return this.svc.getConfig(tenantId);
  }

  @Put('config')
  upsertConfig(
    @GetUser('tenantId') tenantId: string,
    @Body() dto: UpsertBotConfigDto,
  ) {
    return this.svc.upsertConfig(tenantId, dto);
  }

  @Get('test')
  testConnection() {
    return this.svc.testConnection();
  }

  /** Para testear el bot desde ORBIS sin Meta API */
  @Post('simulate')
  simulate(
    @GetUser('tenantId') tenantId: string,
    @Body() body: { conversationId: string; content: string },
  ) {
    return this.svc.processMessage(tenantId, body.conversationId, body.content);
  }
}
