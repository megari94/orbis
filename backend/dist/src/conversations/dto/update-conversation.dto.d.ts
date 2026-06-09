import { Status, Priority } from '@prisma/client';
export declare class UpdateConversationDto {
    status?: Status;
    priority?: Priority;
    assignedTo?: string;
    tags?: string[];
    unreadCount?: number;
}
