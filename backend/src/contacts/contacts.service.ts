import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.contact.findMany({
      where: { tenantId },
      include: { channels: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, tenantId },
      include: { channels: true, conversations: { orderBy: { lastMsgAt: 'desc' }, take: 10 } },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async update(tenantId: string, id: string, data: { name?: string; email?: string; location?: string }) {
    const contact = await this.prisma.contact.findFirst({ where: { id, tenantId } });
    if (!contact) throw new NotFoundException('Contact not found');
    return this.prisma.contact.update({
      where: { id },
      data: {
        ...(data.name     !== undefined ? { name: data.name }         : {}),
        ...(data.email    !== undefined ? { email: data.email }       : {}),
        ...(data.location !== undefined ? { location: data.location } : {}),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, tenantId },
      include: { conversations: true },
    });
    if (!contact) throw new NotFoundException('Contact not found');

    // Borrar mensajes de todas sus conversaciones
    const convIds = contact.conversations.map(c => c.id);
    if (convIds.length > 0) {
      await this.prisma.message.deleteMany({ where: { conversationId: { in: convIds } } });
      await this.prisma.conversation.deleteMany({ where: { id: { in: convIds } } });
    }
    // Borrar canales vinculados y el contacto
    await this.prisma.contactChannel.deleteMany({ where: { contactId: id } });
    await this.prisma.contact.delete({ where: { id } });
    return { deleted: true };
  }
}