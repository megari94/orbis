import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, filters: any) {
    const where: any = { tenantId };
    if (filters.status)  where.status  = filters.status.toUpperCase();
    if (filters.channel) where.channel = filters.channel.toUpperCase();
    if (filters.assignedTo) where.assignedTo = filters.assignedTo;

    return this.prisma.conversation.findMany({
      where,
      include: { contact: true },
      orderBy: { lastMsgAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id, tenantId },
      include: { contact: { include: { channels: true } } },
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    return conv;
  }

  async update(tenantId: string, id: string, dto: UpdateConversationDto) {
    await this.findOne(tenantId, id);
    return this.prisma.conversation.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    const conv = await this.prisma.conversation.findFirst({ where: { id, tenantId } });
    if (!conv) throw new NotFoundException('Conversation not found');
    // Borrar mensajes primero, luego la conversación (contacto se conserva)
    await this.prisma.message.deleteMany({ where: { conversationId: id } });
    await this.prisma.conversation.delete({ where: { id } });
    return { deleted: true };
  }
}