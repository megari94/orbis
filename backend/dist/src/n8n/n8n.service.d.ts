import { PrismaService } from '../prisma/prisma.service';
import { AiBotService } from '../ai-bot/ai-bot.service';
export declare class N8nService {
    private prisma;
    private aiBot;
    private readonly logger;
    constructor(prisma: PrismaService, aiBot: AiBotService);
    getConfig(tenantId: string): Promise<{
        name: string;
        n8nWebhookUrl: string;
        n8nSecret: string;
    }>;
    saveConfig(tenantId: string, webhookUrl: string | null, secret: string | null): Promise<{
        n8nWebhookUrl: string;
        n8nSecret: string;
    }>;
    forwardToN8n(tenantId: string, conversationId: string, messageId: string, content: string): Promise<void>;
    saveBotMessage(tenantId: string, conversationId: string, content: string, isInternal?: boolean): Promise<{
        id: string;
        createdAt: Date;
        channel: import(".prisma/client").$Enums.Channel;
        isInternal: boolean;
        content: string;
        conversationId: string;
        sender: import(".prisma/client").$Enums.SenderType;
        isBot: boolean;
    }>;
    createContactMessage(tenantId: string, conversationId: string, content: string): Promise<{
        id: string;
        createdAt: Date;
        channel: import(".prisma/client").$Enums.Channel;
        isInternal: boolean;
        content: string;
        conversationId: string;
        sender: import(".prisma/client").$Enums.SenderType;
        isBot: boolean;
    }>;
    validateSecret(tenantId: string, secret: string): Promise<boolean>;
}
