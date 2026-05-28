import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { ContactsModule } from './contacts/contacts.module';
import { ChannelConfigModule } from './channel-config/channel-config.module';
import { N8nModule } from './n8n/n8n.module';
import { AiBotModule } from './ai-bot/ai-bot.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Sirve el frontend de React desde backend/client/
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'client'),
      exclude: ['/api/{*path}'],
      serveStaticOptions: { index: false },
    }),
    PrismaModule,
    AuthModule,
    ConversationsModule,
    MessagesModule,
    ContactsModule,
    ChannelConfigModule,
    N8nModule,
    AiBotModule,
  ],
})
export class AppModule {}
