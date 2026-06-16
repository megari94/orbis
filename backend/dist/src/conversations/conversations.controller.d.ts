import { ConversationsService } from './conversations.service';
import { UpdateConversationDto } from './dto/update-conversation.dto';
export declare class ConversationsController {
    private readonly svc;
    constructor(svc: ConversationsService);
    create(tenantId: string, contactId: string, channel: string): Promise<{
        contact: {
            channels: {
                id: string;
                contactId: string;
                channel: import(".prisma/client").$Enums.Channel;
                externalId: string;
                linked: boolean;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            tenantId: string;
            email: string | null;
            phone: string | null;
            location: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        tenantId: string;
        contactId: string;
        channel: import(".prisma/client").$Enums.Channel;
        status: import(".prisma/client").$Enums.Status;
        priority: import(".prisma/client").$Enums.Priority;
        assignedTo: string | null;
        tags: string[];
        lastMessage: string | null;
        lastMsgAt: Date;
        unreadCount: number;
        botHandedOff: boolean;
    }>;
    findAll(tenantId: string, status?: string, channel?: string, assignedTo?: string): Promise<({
        contact: {
            id: string;
            name: string;
            createdAt: Date;
            tenantId: string;
            email: string | null;
            phone: string | null;
            location: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        tenantId: string;
        contactId: string;
        channel: import(".prisma/client").$Enums.Channel;
        status: import(".prisma/client").$Enums.Status;
        priority: import(".prisma/client").$Enums.Priority;
        assignedTo: string | null;
        tags: string[];
        lastMessage: string | null;
        lastMsgAt: Date;
        unreadCount: number;
        botHandedOff: boolean;
    })[]>;
    findOne(tenantId: string, id: string): Promise<{
        contact: {
            channels: {
                id: string;
                contactId: string;
                channel: import(".prisma/client").$Enums.Channel;
                externalId: string;
                linked: boolean;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            tenantId: string;
            email: string | null;
            phone: string | null;
            location: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        tenantId: string;
        contactId: string;
        channel: import(".prisma/client").$Enums.Channel;
        status: import(".prisma/client").$Enums.Status;
        priority: import(".prisma/client").$Enums.Priority;
        assignedTo: string | null;
        tags: string[];
        lastMessage: string | null;
        lastMsgAt: Date;
        unreadCount: number;
        botHandedOff: boolean;
    }>;
    update(tenantId: string, id: string, dto: UpdateConversationDto): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        contactId: string;
        channel: import(".prisma/client").$Enums.Channel;
        status: import(".prisma/client").$Enums.Status;
        priority: import(".prisma/client").$Enums.Priority;
        assignedTo: string | null;
        tags: string[];
        lastMessage: string | null;
        lastMsgAt: Date;
        unreadCount: number;
        botHandedOff: boolean;
    }>;
    remove(tenantId: string, id: string): Promise<{
        deleted: boolean;
    }>;
}
