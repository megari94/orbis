import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class MessagesController {
    private readonly svc;
    constructor(svc: MessagesService);
    findAll(tenantId: string, conversationId: string): Promise<{
        id: string;
        createdAt: Date;
        channel: import(".prisma/client").$Enums.Channel;
        isInternal: boolean;
        content: string;
        conversationId: string;
        sender: import(".prisma/client").$Enums.SenderType;
        isBot: boolean;
    }[]>;
    create(tenantId: string, conversationId: string, dto: CreateMessageDto): Promise<{
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
