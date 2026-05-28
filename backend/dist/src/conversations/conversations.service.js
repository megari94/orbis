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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ConversationsService = class ConversationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, filters) {
        const where = { tenantId };
        if (filters.status)
            where.status = filters.status.toUpperCase();
        if (filters.channel)
            where.channel = filters.channel.toUpperCase();
        if (filters.assignedTo)
            where.assignedTo = filters.assignedTo;
        return this.prisma.conversation.findMany({
            where,
            include: { contact: true },
            orderBy: { lastMsgAt: 'desc' },
        });
    }
    async findOne(tenantId, id) {
        const conv = await this.prisma.conversation.findFirst({
            where: { id, tenantId },
            include: { contact: { include: { channels: true } } },
        });
        if (!conv)
            throw new common_1.NotFoundException('Conversation not found');
        return conv;
    }
    async update(tenantId, id, dto) {
        await this.findOne(tenantId, id);
        return this.prisma.conversation.update({
            where: { id },
            data: dto,
        });
    }
};
exports.ConversationsService = ConversationsService;
exports.ConversationsService = ConversationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConversationsService);
//# sourceMappingURL=conversations.service.js.map