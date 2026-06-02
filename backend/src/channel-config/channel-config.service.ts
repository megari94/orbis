import { Injectable } from '@nestjs/common';
import { Channel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertChannelConfigDto } from './dto/upsert-channel-config.dto';

@Injectable()
export class ChannelConfigService {
  constructor(private prisma: PrismaService) {}

  /** Devuelve todas las configs del tenant (una por canal) */
  async findAll(tenantId: string) {
    return this.prisma.channelConfig.findMany({
      where: { tenantId },
      orderBy: { channel: 'asc' },
    });
  }

  /** Guarda o actualiza la config de un canal específico */
  async upsert(tenantId: string, dto: UpsertChannelConfigDto) {
    const { channel, ...data } = dto;

    // Si tiene accessToken y phoneNumberId/pageId → marcar activo automáticamente
    const hasCredentials = !!(data.accessToken && (data.phoneNumberId || data.pageId));
    const isActive = data.isActive ?? hasCredentials;

    return this.prisma.channelConfig.upsert({
      where: { tenantId_channel: { tenantId, channel } },
      update: { ...data, isActive },
      create: { tenantId, channel, ...data, isActive },
    });
  }

  /** Busca config por webhookVerifyToken (para verificación de Meta) */
  async findByVerifyToken(channel: string, verifyToken: string) {
    return this.prisma.channelConfig.findFirst({
      where: { channel: channel as any, webhookVerifyToken: verifyToken },
    });
  }

  /** Busca config por phoneNumberId (WhatsApp) */
  async findByPhoneNumberId(phoneNumberId: string) {
    return this.prisma.channelConfig.findFirst({
      where: { phoneNumberId },
    });
  }

  /** Busca config por pageId (Instagram / Messenger) */
  async findByPageId(pageId: string) {
    return this.prisma.channelConfig.findFirst({
      where: { pageId },
    });
  }

  /** Desconecta un canal (borra credenciales y lo marca inactivo) */
  async disconnect(tenantId: string, channel: Channel) {
    return this.prisma.channelConfig.upsert({
      where: { tenantId_channel: { tenantId, channel } },
      update: {
        isActive: false,
        accessToken: null,
        phoneNumberId: null,
        wabaId: null,
        pageId: null,
        webhookVerifyToken: null,
      },
      create: { tenantId, channel, isActive: false },
    });
  }
}
