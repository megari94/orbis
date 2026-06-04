import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { SenderType } from '@prisma/client';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, conversationId: string) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
    });
    if (!conv) throw new NotFoundException('Conversation not found');

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(tenantId: string, conversationId: string, dto: CreateMessageDto) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
      include: { contact: true },
    });
    if (!conv) throw new NotFoundException('Conversation not found');

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        content:    dto.content,
        sender:     SenderType.AGENT,
        channel:    conv.channel,
        isInternal: dto.isInternal ?? false,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessage: dto.content, lastMsgAt: new Date(), unreadCount: 0 },
    });

    // Enviar el mensaje por el canal correspondiente (si no es interno)
    if (!dto.isInternal) {
      this.sendViaChannel(tenantId, conv.channel, conv.contact?.phone, dto.content)
        .catch(err => this.logger.warn(`No se pudo enviar por ${conv.channel}: ${err.message}`));
    }

    return message;
  }

  // ── Despacha el mensaje al canal de mensajería correcto ───────────────────

  private async sendViaChannel(tenantId: string, channel: string, recipientPhone: string | null | undefined, content: string) {
    const config = await this.prisma.channelConfig.findFirst({
      where: { tenantId, channel: channel as any, isActive: true },
    });

    if (!config?.accessToken) {
      this.logger.warn(`Canal ${channel} no tiene accessToken configurado`);
      return;
    }

    if (channel === 'WHATSAPP') {
      await this.sendWhatsApp(config.accessToken, config.phoneNumberId!, recipientPhone, content);
    } else if (channel === 'INSTAGRAM' || channel === 'MESSENGER') {
      await this.sendFacebookMessage(config.accessToken, config.pageId!, recipientPhone, content);
    }
  }

  // ── WhatsApp Cloud API ────────────────────────────────────────────────────

  private async sendWhatsApp(accessToken: string, phoneNumberId: string, to: string | null | undefined, content: string) {
    if (!to) { this.logger.warn('WhatsApp: sin número de destino'); return; }

    // Quitar el "+" si lo trae
    let toClean = to.replace(/^\+/, '');

    // Argentina: WhatsApp recibe mensajes con el 9 del prefijo móvil (549XXXXXXXXXX)
    // pero la API de Meta para enviar espera sin el 9 (54XXXXXXXXXX).
    // Ej: 5493624260894 → 543624260894
    if (toClean.startsWith('549') && toClean.length === 13) {
      toClean = '54' + toClean.slice(3);
    }

    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
    const body = {
      messaging_product: 'whatsapp',
      to:                toClean,
      type:              'text',
      text:              { body: content },
    };

    const res = await fetch(url, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type':  'application/json',
      },
      body:   JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json();
    if (!res.ok) {
      this.logger.error(`WhatsApp API error ${res.status}: ${JSON.stringify(data)}`);
      throw new Error(`WhatsApp API ${res.status}: ${data?.error?.message ?? 'unknown'}`);
    }

    this.logger.log(`WhatsApp enviado a ${toClean}: ${res.status}`);
  }

  // ── Instagram / Messenger (Facebook Graph API) ────────────────────────────

  private async sendFacebookMessage(accessToken: string, pageId: string, recipientId: string | null | undefined, content: string) {
    if (!recipientId) { this.logger.warn('Facebook: sin ID de destinatario'); return; }

    const url = `https://graph.facebook.com/v20.0/${pageId}/messages`;
    const body = {
      recipient: { id: recipientId },
      message:   { text: content },
      messaging_type: 'RESPONSE',
    };

    const res = await fetch(url, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type':  'application/json',
      },
      body:   JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json();
    if (!res.ok) {
      this.logger.error(`Facebook API error ${res.status}: ${JSON.stringify(data)}`);
      throw new Error(`Facebook API ${res.status}: ${data?.error?.message ?? 'unknown'}`);
    }

    this.logger.log(`Facebook message enviado a ${recipientId}: ${res.status}`);
  }
}
