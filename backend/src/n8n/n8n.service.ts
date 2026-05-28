import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SenderType } from '@prisma/client';
import { N8nEvent } from './dto/n8n-message.dto';
import { AiBotService } from '../ai-bot/ai-bot.service';

@Injectable()
export class N8nService {
  private readonly logger = new Logger(N8nService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AiBotService))
    private aiBot: AiBotService,
  ) {}

  // ── Obtener config n8n del tenant ─────────────────────────────────────────

  async getConfig(tenantId: string) {
    return this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { n8nWebhookUrl: true, n8nSecret: true, name: true },
    });
  }

  async saveConfig(tenantId: string, webhookUrl: string | null, secret: string | null) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { n8nWebhookUrl: webhookUrl, n8nSecret: secret },
      select: { n8nWebhookUrl: true, n8nSecret: true },
    });
  }

  // ── Enviar evento a n8n ───────────────────────────────────────────────────

  async forwardToN8n(tenantId: string, conversationId: string, messageId: string, content: string) {
    const config = await this.getConfig(tenantId);
    if (!config?.n8nWebhookUrl) return; // n8n no configurado — no hacer nada

    // Obtener datos del contacto para enriquecer el evento
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { contact: true, messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!conv) return;

    // "Primer mensaje" = no hay mensajes de BOT previos en esta conversación
    const hasBotMessages = conv.messages.some(m => m.sender === SenderType.BOT);
    const isFirstMessage  = !hasBotMessages;

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

    const payload: N8nEvent = {
      event:          'message.received',
      tenantId,
      conversationId,
      channel:        conv.channel,
      isFirstMessage,
      contact: {
        id:    conv.contact.id,
        name:  conv.contact.name,
        phone: conv.contact.phone,
        email: conv.contact.email,
      },
      message: {
        id:        messageId,
        content,
        createdAt: new Date().toISOString(),
      },
      callbackUrl: `${backendUrl}/api/n8n/message`,
      secret:      config.n8nSecret ?? '',
    };

    try {
      const res = await fetch(config.n8nWebhookUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
        signal:  AbortSignal.timeout(8000), // 8s timeout
      });
      this.logger.log(`n8n notificado: ${res.status} para conversación ${conversationId}`);
    } catch (err) {
      // No bloquear el flujo principal si n8n no responde
      this.logger.warn(`No se pudo notificar a n8n: ${err.message}`);
    }
  }

  // ── Guardar respuesta del bot (llamado por n8n de vuelta) ─────────────────

  async saveBotMessage(tenantId: string, conversationId: string, content: string, isInternal = false) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
    });
    if (!conv) return null;

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        content,
        sender:     SenderType.BOT,
        channel:    conv.channel,
        isBot:      true,
        isInternal,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content,
        lastMsgAt:   new Date(),
        // Si era NEW, pasarlo a OPEN ahora que el bot respondió
        status: conv.status === 'NEW' ? 'OPEN' : conv.status,
      },
    });

    return message;
  }

  // ── Crear mensaje de contacto (para simular entrada de mensajes) ──────────

  async createContactMessage(tenantId: string, conversationId: string, content: string) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
    });
    if (!conv) return null;

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        content,
        sender:  SenderType.CONTACT,
        channel: conv.channel,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessage: content, lastMsgAt: new Date(), unreadCount: { increment: 1 } },
    });

    // 1. Intentar bot IA (tiene prioridad sobre n8n)
    this.aiBot.processMessage(tenantId, conversationId, content).catch(() => {});

    // 2. Si hay n8n configurado, también notificar (para automatizaciones extra)
    this.forwardToN8n(tenantId, conversationId, message.id, content).catch(() => {});

    return message;
  }

  // ── Validar secret del callback de n8n ───────────────────────────────────

  async validateSecret(tenantId: string, secret: string): Promise<boolean> {
    const config = await this.getConfig(tenantId);
    if (!config?.n8nSecret) return true; // Sin secret configurado = aceptar todo
    return config.n8nSecret === secret;
  }
}
