import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertBotConfigDto } from './dto/bot-config.dto';
export declare class AiBotService {
    private prisma;
    private config;
    private readonly logger;
    private openai;
    constructor(prisma: PrismaService, config: ConfigService);
    getConfig(tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        updatedAt: Date;
        isActive: boolean;
        businessContext: string;
        handoffMessage: string;
        model: string;
    }>;
    upsertConfig(tenantId: string, dto: UpsertBotConfigDto): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        updatedAt: Date;
        isActive: boolean;
        businessContext: string;
        handoffMessage: string;
        model: string;
    }>;
    processMessage(tenantId: string, conversationId: string, incomingContent: string): Promise<void>;
    private buildSystemPrompt;
    testConnection(): Promise<{
        ok: boolean;
        model?: string;
        error?: string;
    }>;
}
