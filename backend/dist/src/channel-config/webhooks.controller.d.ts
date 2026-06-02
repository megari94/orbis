import { Response } from 'express';
import { ChannelConfigService } from './channel-config.service';
import { N8nService } from '../n8n/n8n.service';
export declare class WebhooksController {
    private readonly channelConfig;
    private readonly n8nService;
    private readonly logger;
    constructor(channelConfig: ChannelConfigService, n8nService: N8nService);
    verify(channel: string, mode: string, verifyToken: string, challenge: string, res: Response): Promise<Response<any, Record<string, any>>>;
    receiveWhatsapp(body: any, res: Response): Promise<void>;
    receiveInstagram(body: any, res: Response): Promise<void>;
    receiveMessenger(body: any, res: Response): Promise<void>;
}
