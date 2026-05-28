import { Body, Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common';
import { Channel } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ChannelConfigService } from './channel-config.service';
import { UpsertChannelConfigDto } from './dto/upsert-channel-config.dto';

@UseGuards(JwtAuthGuard)
@Controller('channel-config')
export class ChannelConfigController {
  constructor(private readonly service: ChannelConfigService) {}

  /** GET /api/channel-config — lista todas las configs del tenant */
  @Get()
  findAll(@GetUser('tenantId') tenantId: string) {
    return this.service.findAll(tenantId);
  }

  /** PUT /api/channel-config — crear o actualizar config de un canal */
  @Put()
  upsert(
    @GetUser('tenantId') tenantId: string,
    @Body() dto: UpsertChannelConfigDto,
  ) {
    return this.service.upsert(tenantId, dto);
  }

  /** DELETE /api/channel-config/:channel — desconectar un canal */
  @Delete(':channel')
  disconnect(
    @GetUser('tenantId') tenantId: string,
    @Param('channel') channel: Channel,
  ) {
    return this.service.disconnect(tenantId, channel);
  }
}
