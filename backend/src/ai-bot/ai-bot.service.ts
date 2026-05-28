import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SenderType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertBotConfigDto } from './dto/bot-config.dto';

// Señal que le pedimos al bot que incluya cuando debe derivar a un humano
const HANDOFF_SIGNAL = '[DERIVAR_HUMANO]';

// Cuántos mensajes anteriores pasarle a OpenAI como contexto
const HISTORY_LIMIT = 20;

@Injectable()
export class AiBotService {
  private readonly logger = new Logger(AiBotService.name);
  private openai: OpenAI | null = null;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey !== 'acá-pegá-tu-api-key') {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('✅ OpenAI conectado');
    } else {
      this.logger.warn('⚠️  OPENAI_API_KEY no configurada — bot IA desactivado');
    }
  }

  // ── CRUD de configuración ─────────────────────────────────────────────────

  async getConfig(tenantId: string) {
    return this.prisma.botConfig.findUnique({ where: { tenantId } });
  }

  async upsertConfig(tenantId: string, dto: UpsertBotConfigDto) {
    return this.prisma.botConfig.upsert({
      where:  { tenantId },
      update: dto,
      create: { tenantId, ...dto },
    });
  }

  // ── Motor principal del bot ───────────────────────────────────────────────

  async processMessage(tenantId: string, conversationId: string, incomingContent: string) {
    if (!this.openai) return; // Sin API key configurada

    // 1. Verificar que el bot esté activo para este tenant
    const botConfig = await this.getConfig(tenantId);
    if (!botConfig?.isActive) return;

    // 2. Verificar que la conversación no haya sido derivada a humano
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conv || conv.botHandedOff) return;

    // 3. Obtener historial reciente de la conversación
    const history = await this.prisma.message.findMany({
      where:   { conversationId },
      orderBy: { createdAt: 'asc' },
      take:    HISTORY_LIMIT,
    });

    // 4. Construir el array de mensajes para OpenAI
    const systemPrompt = this.buildSystemPrompt(botConfig.businessContext, botConfig.handoffMessage);

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      // Historial previo
      ...history
        .filter(m => m.sender !== SenderType.SYSTEM)
        .map(m => ({
          role: (m.sender === SenderType.CONTACT ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.content,
        })),
      // Mensaje actual (ya guardado en DB, incluido en history, pero por si no)
    ];

    // 5. Llamar a OpenAI
    let aiResponse = '';
    try {
      const completion = await this.openai.chat.completions.create({
        model:       botConfig.model || 'gpt-4o-mini',
        messages,
        max_tokens:  500,
        temperature: 0.7,
      });
      aiResponse = completion.choices[0]?.message?.content?.trim() ?? '';
    } catch (err) {
      this.logger.error(`Error OpenAI: ${err.message}`);
      return;
    }

    if (!aiResponse) return;

    // 6. Detectar si el bot quiere derivar a un humano
    const shouldHandoff = aiResponse.includes(HANDOFF_SIGNAL);
    const cleanResponse = aiResponse.replace(HANDOFF_SIGNAL, '').trim();

    // 7. Guardar respuesta del bot
    await this.prisma.message.create({
      data: {
        conversationId,
        content:  shouldHandoff ? botConfig.handoffMessage : cleanResponse,
        sender:   SenderType.BOT,
        channel:  conv.channel,
        isBot:    true,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage:  shouldHandoff ? botConfig.handoffMessage : cleanResponse,
        lastMsgAt:    new Date(),
        botHandedOff: shouldHandoff,
        // Si derivó, pasar a OPEN para que el agente lo vea
        ...(shouldHandoff && { status: 'OPEN' }),
      },
    });

    // 8. Si se derivó, crear nota interna para el agente
    if (shouldHandoff) {
      await this.prisma.message.create({
        data: {
          conversationId,
          content:    '🤖 El bot derivó esta conversación a un agente humano.',
          sender:     SenderType.SYSTEM,
          channel:    conv.channel,
          isInternal: true,
        },
      });
      this.logger.log(`Conversación ${conversationId} derivada a humano`);
    }
  }

  // ── Construir system prompt ───────────────────────────────────────────────

  private buildSystemPrompt(businessContext: string, handoffMessage: string): string {
    return `Sos el asistente virtual de este negocio. Tu trabajo es responder las consultas de los clientes de manera amigable, clara y útil.

INFORMACIÓN DEL NEGOCIO:
${businessContext}

INSTRUCCIONES:
- Respondé siempre en español, con un tono amigable y profesional.
- Sé conciso pero completo. Usá emojis con moderación.
- Si no tenés información sobre algo, decilo honestamente y ofrecé conectar con un humano.
- Nunca inventes precios, disponibilidades ni datos que no estén en la información del negocio.
- Si el cliente quiere hablar con una persona, si la consulta requiere atención personalizada para cerrar una venta/operación, o si no podés responder correctamente luego de 2 intentos, incluí exactamente "${HANDOFF_SIGNAL}" al final de tu respuesta (sin comillas).

Ejemplo de derivación:
"Entendido, con gusto te pongo en contacto con un asesor. ${HANDOFF_SIGNAL}"

Fecha y hora actual: ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`;
  }

  // ── Verificar conexión con OpenAI ─────────────────────────────────────────

  async testConnection(): Promise<{ ok: boolean; model?: string; error?: string }> {
    if (!this.openai) return { ok: false, error: 'API key no configurada' };
    try {
      await this.openai.models.retrieve('gpt-4o-mini');
      return { ok: true, model: 'gpt-4o-mini' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }
}
