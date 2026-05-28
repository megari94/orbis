import { AiBotService } from './ai-bot.service';
import { UpsertBotConfigDto } from './dto/bot-config.dto';
export declare class AiBotController {
    private readonly svc;
    constructor(svc: AiBotService);
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
    testConnection(): Promise<{
        ok: boolean;
        model?: string;
        error?: string;
    }>;
    simulate(tenantId: string, body: {
        conversationId: string;
        content: string;
    }): Promise<void>;
}
