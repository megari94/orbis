import { PrismaService } from '../prisma/prisma.service';
export declare class ContactsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string): Promise<({
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
    })[]>;
    findOne(tenantId: string, id: string): Promise<{
        conversations: {
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
        }[];
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
    }>;
    update(tenantId: string, id: string, data: {
        name?: string;
        email?: string;
        location?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        tenantId: string;
        email: string | null;
        phone: string | null;
        location: string | null;
    }>;
}
