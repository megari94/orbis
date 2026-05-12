import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async findOne(tenantId: string, id: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, tenantId },
      include: { channels: true, conversations: { orderBy: { lastMsgAt: 'desc' }, take: 10 } },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }
}