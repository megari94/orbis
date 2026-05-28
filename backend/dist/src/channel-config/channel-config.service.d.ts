import { Channel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertChannelConfigDto } from './dto/upsert-channel-config.dto';
export declare class ChannelConfigService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        channel: import(".prisma/client").$Enums.Channel;
        updatedAt: Date;
        isActive: boolean;
        phoneNumberId: string | null;
        wabaId: string | null;
        pageId: string | null;
        accessToken: string | null;
        webhookVerifyToken: string | null;
    }[]>;
    upsert(tenantId: string, dto: UpsertChannelConfigDto): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        channel: import(".prisma/client").$Enums.Channel;
        updatedAt: Date;
        isActive: boolean;
        phoneNumberId: string | null;
        wabaId: string | null;
        pageId: string | null;
        accessToken: string | null;
        webhookVerifyToken: string | null;
    }>;
    disconnect(tenantId: string, channel: Channel): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        channel: import(".prisma/client").$Enums.Channel;
        updatedAt: Date;
        isActive: boolean;
        phoneNumberId: string | null;
        wabaId: string | null;
        pageId: string | null;
        accessToken: string | null;
        webhookVerifyToken: string | null;
    }>;
}
