import { Module } from '@nestjs/common';
import { ChannelConfigController } from './channel-config.controller';
import { ChannelConfigService } from './channel-config.service';

@Module({
  controllers: [ChannelConfigController],
  providers:   [ChannelConfigService],
  exports:     [ChannelConfigService],
})
export class ChannelConfigModule {}
