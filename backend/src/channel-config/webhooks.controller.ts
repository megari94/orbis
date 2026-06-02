import { Controller, Get, Post, Param, Query, Body, Res, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ChannelConfigService } from './channel-config.service';
import { N8nService } from '../n8n/n8n.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly channelConfig: ChannelConfigService,
    private readonly n8nService: N8nService,
  ) {}

  // ── GET /api/webhooks/:channel — verificación de Meta ─────────────────────
  @Get(':channel')
  async verify(
    @Param('channel') channel: string,
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    this.logger.log(`Webhook verify: channel=${channel} mode=${mode} token=${verifyToken}`);

    if (mode === 'subscribe' && verifyToken && challenge) {
      const config = await this.channelConfig.findByVerifyToken(
        channel.toUpperCase(),
        verifyToken,
      );

      if (config) {
        this.logger.log(`Webhook verificado para tenant ${config.tenantId}`);
        return res.status(200).send(challenge);
      }
    }

    this.logger.warn(`Webhook rechazado: token no válido o modo incorrecto`);
    return res.status(403).send('Forbidden');
  }

  // ── POST /api/webhooks/whatsapp — mensajes entrantes de WhatsApp ───────────
  @Post('whatsapp')
  async receiveWhatsapp(@Body() body: any, @Res() res: Response) {
    res.sendStatus(200); // Meta requiere respuesta inmediata

    try {
      const entry = body?.entry?.[0];
      const change = entry?.changes?.[0]?.value;
      const messages = change?.messages;

      if (!messages?.length) return;

      const msg = messages[0];
      const phoneNumberId = change.metadata?.phone_number_id;
      const from = msg.from; // número del cliente
      const text = msg.text?.body || msg.type;

      if (!phoneNumberId || !text) return;

      // Buscar tenant por phoneNumberId
      const config = await this.channelConfig.findByPhoneNumberId(phoneNumberId);
      if (!config) {
        this.logger.warn(`No se encontró tenant para phoneNumberId: ${phoneNumberId}`);
        return;
      }

      this.logger.log(`Mensaje de WhatsApp: de=${from} tenant=${config.tenantId}`);

      // Crear mensaje en ORBIS (reutiliza la lógica de n8n)
      await this.n8nService.createIncomingMessage(
        config.tenantId,
        'WHATSAPP',
        from,
        `+${from}`,
        text,
      );
    } catch (err) {
      this.logger.error('Error procesando webhook WhatsApp', err);
    }
  }

  // ── POST /api/webhooks/instagram — mensajes entrantes de Instagram ─────────
  @Post('instagram')
  async receiveInstagram(@Body() body: any, @Res() res: Response) {
    res.sendStatus(200);

    try {
      const entry = body?.entry?.[0];
      const messaging = entry?.messaging?.[0];
      if (!messaging) return;

      const pageId = entry?.id;
      const from = messaging.sender?.id;
      const text = messaging.message?.text;

      if (!pageId || !from || !text) return;

      const config = await this.channelConfig.findByPageId(pageId);
      if (!config) return;

      await this.n8nService.createIncomingMessage(
        config.tenantId,
        'INSTAGRAM',
        from,
        from,
        text,
      );
    } catch (err) {
      this.logger.error('Error procesando webhook Instagram', err);
    }
  }

  // ── POST /api/webhooks/messenger — mensajes entrantes de Messenger ─────────
  @Post('messenger')
  async receiveMessenger(@Body() body: any, @Res() res: Response) {
    res.sendStatus(200);

    try {
      const entry = body?.entry?.[0];
      const messaging = entry?.messaging?.[0];
      if (!messaging) return;

      const pageId = entry?.id;
      const from = messaging.sender?.id;
      const text = messaging.message?.text;

      if (!pageId || !from || !text) return;

      const config = await this.channelConfig.findByPageId(pageId);
      if (!config) return;

      await this.n8nService.createIncomingMessage(
        config.tenantId,
        'MESSENGER',
        from,
        from,
        text,
      );
    } catch (err) {
      this.logger.error('Error procesando webhook Messenger', err);
    }
  }
}
