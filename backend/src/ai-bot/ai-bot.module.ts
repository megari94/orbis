import { Module, forwardRef } from '@nestjs/common';
import { AiBotController } from './ai-bot.controller';
import { AiBotService } from './ai-bot.service';
import { N8nModule } from '../n8n/n8n.module';

@Module({
  imports:     [forwardRef(() => N8nModule)],
  controllers: [AiBotController],
  providers:   [AiBotService],
  exports:     [AiBotService],
})
export class AiBotModule {}
