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
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ContactsService = class ContactsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId) {
        return this.prisma.contact.findMany({
            where: { tenantId },
            include: { channels: true },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(tenantId, id) {
        const contact = await this.prisma.contact.findFirst({
            where: { id, tenantId },
            include: { channels: true, conversations: { orderBy: { lastMsgAt: 'desc' }, take: 10 } },
        });
        if (!contact)
            throw new common_1.NotFoundException('Contact not found');
        return contact;
    }
    async update(tenantId, id, data) {
        const contact = await this.prisma.contact.findFirst({ where: { id, tenantId } });
        if (!contact)
            throw new common_1.NotFoundException('Contact not found');
        return this.prisma.contact.update({
            where: { id },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.email !== undefined ? { email: data.email } : {}),
                ...(data.location !== undefined ? { location: data.location } : {}),
            },
        });
    }
    async remove(tenantId, id) {
        const contact = await this.prisma.contact.findFirst({
            where: { id, tenantId },
            include: { conversations: true },
        });
        if (!contact)
            throw new common_1.NotFoundException('Contact not found');
        const convIds = contact.conversations.map(c => c.id);
        if (convIds.length > 0) {
            await this.prisma.message.deleteMany({ where: { conversationId: { in: convIds } } });
            await this.prisma.conversation.deleteMany({ where: { id: { in: convIds } } });
        }
        await this.prisma.contactChannel.deleteMany({ where: { contactId: id } });
        await this.prisma.contact.delete({ where: { id } });
        return { deleted: true };
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map