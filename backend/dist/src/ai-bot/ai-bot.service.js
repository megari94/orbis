"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiBotService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiBotService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = require("openai");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const HANDOFF_SIGNAL = '[DERIVAR_HUMANO]';
const HISTORY_LIMIT = 20;
let AiBotService = AiBotService_1 = class AiBotService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.logger = new common_1.Logger(AiBotService_1.name);
        this.openai = null;
        const apiKey = this.config.get('OPENAI_API_KEY');
        if (apiKey && apiKey !== 'acá-pegá-tu-api-key') {
            this.openai = new openai_1.default({ apiKey });
            this.logger.log('✅ OpenAI conectado');
        }
        else {
            this.logger.warn('⚠️  OPENAI_API_KEY no configurada — bot IA desactivado');
        }
    }
    async getConfig(tenantId) {
        return this.prisma.botConfig.findUnique({ where: { tenantId } });
    }
    async upsertConfig(tenantId, dto) {
        return this.prisma.botConfig.upsert({
            where: { tenantId },
            update: dto,
            create: { tenantId, ...dto },
        });
    }
    async processMessage(tenantId, conversationId, incomingContent) {
        if (!this.openai)
            return;
        const botConfig = await this.getConfig(tenantId);
        if (!botConfig?.isActive)
            return;
        const conv = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conv || conv.botHandedOff)
            return;
        const history = await this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            take: HISTORY_LIMIT,
        });
        const systemPrompt = this.buildSystemPrompt(botConfig.businessContext, botConfig.handoffMessage);
        const messages = [
            { role: 'system', content: systemPrompt },
            ...history
                .filter(m => m.sender !== client_1.SenderType.SYSTEM)
                .map(m => ({
                role: (m.sender === client_1.SenderType.CONTACT ? 'user' : 'assistant'),
                content: m.content,
            })),
        ];
        let aiResponse = '';
        try {
            const completion = await this.openai.chat.completions.create({
                model: botConfig.model || 'gpt-4o-mini',
                messages,
                max_tokens: 500,
                temperature: 0.7,
            });
            aiResponse = completion.choices[0]?.message?.content?.trim() ?? '';
        }
        catch (err) {
            this.logger.error(`Error OpenAI: ${err.message}`);
            return;
        }
        if (!aiResponse)
            return;
        const shouldHandoff = aiResponse.includes(HANDOFF_SIGNAL);
        const cleanResponse = aiResponse.replace(HANDOFF_SIGNAL, '').trim();
        await this.prisma.message.create({
            data: {
                conversationId,
                content: shouldHandoff ? botConfig.handoffMessage : cleanResponse,
                sender: client_1.SenderType.BOT,
                channel: conv.channel,
                isBot: true,
            },
        });
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: {
                lastMessage: shouldHandoff ? botConfig.handoffMessage : cleanResponse,
                lastMsgAt: new Date(),
                botHandedOff: shouldHandoff,
                ...(shouldHandoff && { status: 'OPEN' }),
            },
        });
        if (shouldHandoff) {
            await this.prisma.message.create({
                data: {
                    conversationId,
                    content: '🤖 El bot derivó esta conversación a un agente humano.',
                    sender: client_1.SenderType.SYSTEM,
                    channel: conv.channel,
                    isInternal: true,
                },
            });
            this.logger.log(`Conversación ${conversationId} derivada a humano`);
        }
    }
    buildSystemPrompt(businessContext, handoffMessage) {
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
    async testConnection() {
        if (!this.openai)
            return { ok: false, error: 'API key no configurada' };
        try {
            await this.openai.models.retrieve('gpt-4o-mini');
            return { ok: true, model: 'gpt-4o-mini' };
        }
        catch (err) {
            return { ok: false, error: err.message };
        }
    }
};
exports.AiBotService = AiBotService;
exports.AiBotService = AiBotService = AiBotService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AiBotService);
//# sourceMappingURL=ai-bot.service.js.map