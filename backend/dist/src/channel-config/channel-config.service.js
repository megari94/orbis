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
exports.ChannelConfigService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ChannelConfigService = class ChannelConfigService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId) {
        return this.prisma.channelConfig.findMany({
            where: { tenantId },
            orderBy: { channel: 'asc' },
        });
    }
    async upsert(tenantId, dto) {
        const { channel, ...data } = dto;
        const hasCredentials = !!(data.accessToken && (data.phoneNumberId || data.pageId));
        const isActive = data.isActive ?? hasCredentials;
        return this.prisma.channelConfig.upsert({
            where: { tenantId_channel: { tenantId, channel } },
            update: { ...data, isActive },
            create: { tenantId, channel, ...data, isActive },
        });
    }
    async findByVerifyToken(channel, verifyToken) {
        return this.prisma.channelConfig.findFirst({
            where: { channel: channel, webhookVerifyToken: verifyToken },
        });
    }
    async findByPhoneNumberId(phoneNumberId) {
        return this.prisma.channelConfig.findFirst({
            where: { phoneNumberId },
        });
    }
    async findByPageId(pageId) {
        return this.prisma.channelConfig.findFirst({
            where: { pageId },
        });
    }
    async disconnect(tenantId, channel) {
        return this.prisma.channelConfig.upsert({
            where: { tenantId_channel: { tenantId, channel } },
            update: {
                isActive: false,
                accessToken: null,
                phoneNumberId: null,
                wabaId: null,
                pageId: null,
                webhookVerifyToken: null,
            },
            create: { tenantId, channel, isActive: false },
        });
    }
};
exports.ChannelConfigService = ChannelConfigService;
exports.ChannelConfigService = ChannelConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChannelConfigService);
//# sourceMappingURL=channel-config.service.js.map