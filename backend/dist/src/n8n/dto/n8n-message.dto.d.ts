export declare class N8nMessageDto {
    conversationId: string;
    content: string;
    isInternal?: boolean;
}
export interface N8nEvent {
    event: 'message.received';
    tenantId: string;
    conversationId: string;
    channel: string;
    isFirstMessage: boolean;
    contact: {
        id: string;
        name: string;
        phone?: string | null;
        email?: string | null;
    };
    message: {
        id: string;
        content: string;
        createdAt: string;
    };
    callbackUrl: string;
    secret: string;
}
