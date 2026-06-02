import { Module, forwardRef } from '@nestjs/common';
import { ChannelConfigController } from './channel-config.controller';
import { WebhooksController } from './webhooks.controller';
import { ChannelConfigService } from './channel-config.service';
import { N8nModule } from '../n8n/n8n.module';

@Module({
  imports:     [forwardRef(() => N8nModule)],
  controllers: [ChannelConfigController, WebhooksController],
  providers:   [ChannelConfigService],
  exports:     [ChannelConfigService],
})
export class ChannelConfigModule {}
