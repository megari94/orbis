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
var MessagesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let MessagesService = MessagesService_1 = class MessagesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MessagesService_1.name);
    }
    async findAll(tenantId, conversationId) {
        const conv = await this.prisma.conversation.findFirst({
            where: { id: conversationId, tenantId },
        });
        if (!conv)
            throw new common_1.NotFoundException('Conversation not found');
        return this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async create(tenantId, conversationId, dto) {
        const conv = await this.prisma.conversation.findFirst({
            where: { id: conversationId, tenantId },
            include: { contact: true },
        });
        if (!conv)
            throw new common_1.NotFoundException('Conversation not found');
        const message = await this.prisma.message.create({
            data: {
                conversationId,
                content: dto.content,
                sender: client_1.SenderType.AGENT,
                channel: conv.channel,
                isInternal: dto.isInternal ?? false,
            },
        });
        const statusOnReply = {
            NEW: 'OPEN',
            OPEN: 'OPEN',
            PENDING: 'OPEN',
            RESOLVED: 'OPEN',
        };
        const newStatus = statusOnReply[conv.status] ?? 'OPEN';
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessage: dto.content, lastMsgAt: new Date(), unreadCount: 0, status: newStatus },
        });
        if (!dto.isInternal) {
            this.sendViaChannel(tenantId, conv.channel, conv.contact?.phone, dto.content)
                .catch(err => this.logger.warn(`No se pudo enviar por ${conv.channel}: ${err.message}`));
        }
        return message;
    }
    async sendViaChannel(tenantId, channel, recipientPhone, content) {
        const config = await this.prisma.channelConfig.findFirst({
            where: { tenantId, channel: channel, isActive: true },
        });
        if (!config?.accessToken) {
            this.logger.warn(`Canal ${channel} no tiene accessToken configurado`);
            return;
        }
        if (channel === 'WHATSAPP') {
            await this.sendWhatsApp(config.accessToken, config.phoneNumberId, recipientPhone, content);
        }
        else if (channel === 'INSTAGRAM' || channel === 'MESSENGER') {
            await this.sendFacebookMessage(config.accessToken, config.pageId, recipientPhone, content);
        }
    }
    async sendWhatsApp(accessToken, phoneNumberId, to, content) {
        if (!to) {
            this.logger.warn('WhatsApp: sin número de destino');
            return;
        }
        const toClean = this.normalizeArgentineNumber(to);
        const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
        const body = {
            messaging_product: 'whatsapp',
            to: toClean,
            type: 'text',
            text: { body: content },
        };
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(10000),
        });
        const data = await res.json();
        if (!res.ok) {
            this.logger.error(`WhatsApp API error ${res.status}: ${JSON.stringify(data)}`);
            throw new Error(`WhatsApp API ${res.status}: ${data?.error?.message ?? 'unknown'}`);
        }
        this.logger.log(`WhatsApp enviado a ${toClean}: ${res.status}`);
    }
    normalizeArgentineNumber(phone) {
        const n = phone.replace(/^\+/, '');
        if (!n.startsWith('549') || n.length !== 13)
            return n;
        const afterPrefix = n.slice(2);
        if (afterPrefix.startsWith('911') && afterPrefix.length === 11) {
            return '5411' + '15' + afterPrefix.slice(3);
        }
        if (afterPrefix.length === 11) {
            const area = afterPrefix.slice(1, 4);
            const local = afterPrefix.slice(4);
            return '54' + area + '15' + local;
        }
        return n;
    }
    async sendFacebookMessage(accessToken, pageId, recipientId, content) {
        if (!recipientId) {
            this.logger.warn('Facebook: sin ID de destinatario');
            return;
        }
        const url = `https://graph.facebook.com/v20.0/${pageId}/messages`;
        const body = {
            recipient: { id: recipientId },
            message: { text: content },
            messaging_type: 'RESPONSE',
        };
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(10000),
        });
        const data = await res.json();
        if (!res.ok) {
            this.logger.error(`Facebook API error ${res.status}: ${JSON.stringify(data)}`);
            throw new Error(`Facebook API ${res.status}: ${data?.error?.message ?? 'unknown'}`);
        }
        this.logger.log(`Facebook message enviado a ${recipientId}: ${res.status}`);
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = MessagesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map