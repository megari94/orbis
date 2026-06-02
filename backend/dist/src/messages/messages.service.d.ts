import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class MessagesService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(tenantId: string, conversationId: string): Promise<{
        id: string;
        createdAt: Date;
        channel: import(".prisma/client").$Enums.Channel;
        isInternal: boolean;
        sender: import(".prisma/client").$Enums.SenderType;
        content: string;
        conversationId: string;
        isBot: boolean;
    }[]>;
    create(tenantId: string, conversationId: string, dto: CreateMessageDto): Promise<{
        id: string;
        createdAt: Date;
        channel: import(".prisma/client").$Enums.Channel;
        isInternal: boolean;
        sender: import(".prisma/client").$Enums.SenderType;
        content: string;
        conversationId: string;
        isBot: boolean;
    }>;
    private sendViaChannel;
    private sendWhatsApp;
    private sendFacebookMessage;
}
