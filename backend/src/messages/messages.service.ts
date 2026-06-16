import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { SenderType } from '@prisma/client';
// node-fetch / FormData nativos en Node 18+

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

    // ── Lógica automática de estado ───────────────────────────────────────────
    // Cuando el operador responde: NEW/PENDING/RESOLVED → OPEN (en curso)
    // Si ya era OPEN, se mantiene.
    const statusOnReply: Record<string, string> = {
      NEW:      'OPEN',
      OPEN:     'OPEN',
      PENDING:  'OPEN',   // operador retomó la conversación
      RESOLVED: 'OPEN',   // operador envió algo a una conversación resuelta
    };
    const newStatus = statusOnReply[conv.status] ?? 'OPEN';

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessage: dto.content, lastMsgAt: new Date(), unreadCount: 0, status: newStatus as any },
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

    // Normalizar número argentino: WhatsApp envía 549AAANNNNNNN pero Meta espera 54AAA15NNNNNNN
    const toClean = this.normalizeArgentineNumber(to);

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

  // ── Normalización de números argentinos ──────────────────────────────────
  // WhatsApp: 549AAANNNNNNN (con 9, sin 15)
  // Meta API: 54AAA15NNNNNNN (sin 9, con 15)
  // Ej: 5493624175506 → 54362154175506
  private normalizeArgentineNumber(phone: string): string {
    const n = phone.replace(/^\+/, '');

    if (!n.startsWith('549') || n.length !== 13) return n;

    const afterPrefix = n.slice(2); // '9AAANNNNNNN' — 11 dígitos

    // Buenos Aires: 9 + 11 + 8 dígitos
    if (afterPrefix.startsWith('911') && afterPrefix.length === 11) {
      return '5411' + '15' + afterPrefix.slice(3);
    }

    // Interior (área de 3 dígitos): 9 + AAA + 7 dígitos
    if (afterPrefix.length === 11) {
      const area  = afterPrefix.slice(1, 4); // 3 dígitos de área
      const local = afterPrefix.slice(4);    // 7 dígitos locales
      return '54' + area + '15' + local;
    }

    return n;
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

  // ── Enviar archivo adjunto (imagen/documento/video) ───────────────────────
  async sendMedia(tenantId: string, conversationId: string, file: Express.Multer.File) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
      include: { contact: true },
    });
    if (!conv) throw new NotFoundException('Conversation not found');

    // Guardar mensaje en BD con el nombre del archivo como contenido
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        content:    `📎 ${file.originalname}`,
        sender:     SenderType.AGENT,
        channel:    conv.channel,
        isInternal: false,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data:  { lastMessage: `📎 ${file.originalname}`, lastMsgAt: new Date(), unreadCount: 0 },
    });

    // Enviar por WhatsApp si es ese canal
    if (conv.channel === 'WHATSAPP') {
      const config = await this.prisma.channelConfig.findFirst({
        where: { tenantId, channel: 'WHATSAPP', isActive: true },
      });
      if (config?.accessToken && config?.phoneNumberId && conv.contact?.phone) {
        this.uploadAndSendWhatsAppMedia(
          config.accessToken,
          config.phoneNumberId,
          this.normalizeArgentineNumber(conv.contact.phone),
          file,
        ).catch(err => this.logger.warn(`Media WA error: ${err.message}`));
      }
    }

    return message;
  }

  // Sube el archivo a la Media API de WhatsApp y lo envía
  private async uploadAndSendWhatsAppMedia(
    accessToken: string,
    phoneNumberId: string,
    to: string,
    file: Express.Multer.File,
  ) {
    // 1. Subir el archivo a la Media API
    const uploadUrl = `https://graph.facebook.com/v20.0/${phoneNumberId}/media`;
    const form = new (globalThis as any).FormData();
    form.append('messaging_product', 'whatsapp');
    form.append('file', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
    form.append('type', file.mimetype);

    const uploadRes = await fetch(uploadUrl, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` },
      body:    form,
      signal:  AbortSignal.timeout(30000),
    });
    const uploadData = await uploadRes.json() as any;
    if (!uploadRes.ok) throw new Error(`Media upload ${uploadRes.status}: ${uploadData?.error?.message}`);

    const mediaId = uploadData.id as string;

    // 2. Determinar tipo de mensaje según mimetype
    let msgType = 'document';
    if (file.mimetype.startsWith('image/')) msgType = 'image';
    else if (file.mimetype.startsWith('video/')) msgType = 'video';
    else if (file.mimetype.startsWith('audio/')) msgType = 'audio';

    // 3. Enviar el mensaje con el media_id
    const sendUrl = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
    const body: any = {
      messaging_product: 'whatsapp',
      to,
      type: msgType,
      [msgType]: { id: mediaId },
    };
    if (msgType === 'document') body.document.filename = file.originalname;

    const sendRes = await fetch(sendUrl, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
      signal:  AbortSignal.timeout(15000),
    });
    const sendData = await sendRes.json();
    if (!sendRes.ok) throw new Error(`Media send ${sendRes.status}: ${(sendData as any)?.error?.message}`);

    this.logger.log(`WhatsApp media enviado a ${to}: ${msgType} ${mediaId}`);
  }
}
