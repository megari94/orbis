import { Module, forwardRef } from '@nestjs/common';
import { N8nController } from './n8n.controller';
import { N8nService } from './n8n.service';
import { AiBotModule } from '../ai-bot/ai-bot.module';

@Module({
  imports:     [forwardRef(() => AiBotModule)],
  controllers: [N8nController],
  providers:   [N8nService],
  exports:     [N8nService],
})
export class N8nModule {}
