import { Channel } from '@prisma/client';
export declare class UpsertChannelConfigDto {
    channel: Channel;
    isActive?: boolean;
    phoneNumberId?: string;
    wabaId?: string;
    pageId?: string;
    accessToken?: string;
    webhookVerifyToken?: string;
}
