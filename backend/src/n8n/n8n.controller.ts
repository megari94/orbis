import {
  Body, Controller, Get, Headers, Param,
  Post, Put, UnauthorizedException, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { N8nService } from './n8n.service';
import { N8nMessageDto } from './dto/n8n-message.dto';

@ApiTags('n8n')
@Controller('n8n')
export class N8nController {
  constructor(private readonly n8n: N8nService) {}

  // ── Config (requiere JWT) ─────────────────────────────────────────────────

  @Get('config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getConfig(@GetUser('tenantId') tenantId: string) {
    return this.n8n.getConfig(tenantId);
  }

  @Put('config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  saveConfig(
    @GetUser('tenantId') tenantId: string,
    @Body() body: { webhookUrl: string | null; secret: string | null },
  ) {
    return this.n8n.saveConfig(tenantId, body.webhookUrl, body.secret);
  }

  // ── Callback de n8n → ORBIS (sin JWT, usa secret en header) ─────────────

  /**
   * n8n llama a este endpoint con la respuesta del bot.
   * Header requerido: X-Orbis-Secret: <secret configurado>
   * Body: { conversationId, tenantId, content, isInternal? }
   */
  @Post('message')
  async receiveFromN8n(
    @Headers('x-orbis-secret') secret: string,
    @Body() dto: N8nMessageDto & { tenantId: string },
  ) {
    const valid = await this.n8n.validateSecret(dto.tenantId, secret ?? '');
    if (!valid) throw new UnauthorizedException('Secret inválido');

    return this.n8n.saveBotMessage(dto.tenantId, dto.conversationId, dto.content, dto.isInternal ?? false);
  }

  // ── Simular mensaje entrante (solo para desarrollo / testing) ─────────────

  /**
   * Simula que un contacto mandó un mensaje.
   * Útil para testear el bot sin tener Meta API configurado.
   * POST /api/n8n/simulate/:conversationId
   * Header: x-tenant-id
   * Body: { content }
   */
  @Post('simulate/:conversationId')
  simulateContactMessage(
    @Headers('x-tenant-id') tenantId: string,
    @Param('conversationId') conversationId: string,
    @Body() body: { content: string },
  ) {
    return this.n8n.createContactMessage(tenantId, conversationId, body.content);
  }
}
