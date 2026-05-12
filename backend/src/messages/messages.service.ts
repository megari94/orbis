import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { SenderType } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, conversationId: string) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
    });
    if (!conv) throw new NotFoundException('Conversation not found');

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(tenantId: string, conversationId: string, dto: CreateMessageDto) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
    });
    if (!conv) throw new NotFoundException('Conversation not found');

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        content:    dto.content,
        sender:     SenderType.AGENT,
        channel:    conv.channel,
        isInternal: dto.isInternal ?? false,
      },
    });

    // Actualizar último mensaje en la conversación
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: dto.content,
        lastMsgAt:   new Date(),
        unreadCount: 0,
      },
    });

    return message;
  }
}