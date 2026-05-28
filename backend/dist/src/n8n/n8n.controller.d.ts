import { N8nService } from './n8n.service';
import { N8nMessageDto } from './dto/n8n-message.dto';
export declare class N8nController {
    private readonly n8n;
    constructor(n8n: N8nService);
    getConfig(tenantId: string): Promise<{
        name: string;
        n8nWebhookUrl: string;
        n8nSecret: string;
    }>;
    saveConfig(tenantId: string, body: {
        webhookUrl: string | null;
        secret: string | null;
    }): Promise<{
        n8nWebhookUrl: string;
        n8nSecret: string;
    }>;
    receiveFromN8n(secret: string, dto: N8nMessageDto & {
        tenantId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        channel: import(".prisma/client").$Enums.Channel;
        isInternal: boolean;
        content: string;
        conversationId: string;
        sender: import(".prisma/client").$Enums.SenderType;
        isBot: boolean;
    }>;
    simulateContactMessage(tenantId: string, conversationId: string, body: {
        content: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        channel: import(".prisma/client").$Enums.Channel;
        isInternal: boolean;
        content: string;
        conversationId: string;
        sender: import(".prisma/client").$Enums.SenderType;
        isBot: boolean;
    }>;
}
