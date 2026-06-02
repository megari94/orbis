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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var N8nService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const ai_bot_service_1 = require("../ai-bot/ai-bot.service");
let N8nService = N8nService_1 = class N8nService {
    constructor(prisma, aiBot) {
        this.prisma = prisma;
        this.aiBot = aiBot;
        this.logger = new common_1.Logger(N8nService_1.name);
    }
    async getConfig(tenantId) {
        return this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { n8nWebhookUrl: true, n8nSecret: true, name: true },
        });
    }
    async saveConfig(tenantId, webhookUrl, secret) {
        return this.prisma.tenant.update({
            where: { id: tenantId },
            data: { n8nWebhookUrl: webhookUrl, n8nSecret: secret },
            select: { n8nWebhookUrl: true, n8nSecret: true },
        });
    }
    async forwardToN8n(tenantId, conversationId, messageId, content) {
        const config = await this.getConfig(tenantId);
        if (!config?.n8nWebhookUrl)
            return;
        const conv = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { contact: true, messages: { orderBy: { createdAt: 'asc' } } },
        });
        if (!conv)
            return;
        const hasBotMessages = conv.messages.some(m => m.sender === client_1.SenderType.BOT);
        const isFirstMessage = !hasBotMessages;
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
        const payload = {
            event: 'message.received',
            tenantId,
            conversationId,
            channel: conv.channel,
            isFirstMessage,
            contact: {
                id: conv.contact.id,
                name: conv.contact.name,
                phone: conv.contact.phone,
                email: conv.contact.email,
            },
            message: {
                id: messageId,
                content,
                createdAt: new Date().toISOString(),
            },
            callbackUrl: `${backendUrl}/api/n8n/message`,
            secret: config.n8nSecret ?? '',
        };
        try {
            const res = await fetch(config.n8nWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(8000),
            });
            this.logger.log(`n8n notificado: ${res.status} para conversación ${conversationId}`);
        }
        catch (err) {
            this.logger.warn(`No se pudo notificar a n8n: ${err.message}`);
        }
    }
    async saveBotMessage(tenantId, conversationId, content, isInternal = false) {
        const conv = await this.prisma.conversation.findFirst({
            where: { id: conversationId, tenantId },
        });
        if (!conv)
            return null;
        const message = await this.prisma.message.create({
            data: {
                conversationId,
                content,
                sender: client_1.SenderType.BOT,
                channel: conv.channel,
                isBot: true,
                isInternal,
            },
        });
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: {
                lastMessage: content,
                lastMsgAt: new Date(),
                status: conv.status === 'NEW' ? 'OPEN' : conv.status,
            },
        });
        return message;
    }
    async createContactMessage(tenantId, conversationId, content) {
        const conv = await this.prisma.conversation.findFirst({
            where: { id: conversationId, tenantId },
        });
        if (!conv)
            return null;
        const message = await this.prisma.message.create({
            data: {
                conversationId,
                content,
                sender: client_1.SenderType.CONTACT,
                channel: conv.channel,
            },
        });
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessage: content, lastMsgAt: new Date(), unreadCount: { increment: 1 } },
        });
        this.aiBot.processMessage(tenantId, conversationId, content).catch(() => { });
        this.forwardToN8n(tenantId, conversationId, message.id, content).catch(() => { });
        return message;
    }
    async createIncomingMessage(tenantId, channel, externalId, displayName, content) {
        let contact = await this.prisma.contact.findFirst({
            where: { tenantId, phone: externalId },
        });
        if (!contact) {
            contact = await this.prisma.contact.create({
                data: { tenantId, name: displayName, phone: externalId },
            });
        }
        let conversation = await this.prisma.conversation.findFirst({
            where: { tenantId, contactId: contact.id, channel: channel, status: { not: 'CLOSED' } },
            orderBy: { lastMsgAt: 'desc' },
        });
        if (!conversation) {
            conversation = await this.prisma.conversation.create({
                data: { tenantId, contactId: contact.id, channel: channel, status: 'NEW' },
            });
        }
        return this.createContactMessage(tenantId, conversation.id, content);
    }
    async validateSecret(tenantId, secret) {
        const config = await this.getConfig(tenantId);
        if (!config?.n8nSecret)
            return true;
        return config.n8nSecret === secret;
    }
};
exports.N8nService = N8nService;
exports.N8nService = N8nService = N8nService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => ai_bot_service_1.AiBotService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_bot_service_1.AiBotService])
], N8nService);
//# sourceMappingURL=n8n.service.js.map