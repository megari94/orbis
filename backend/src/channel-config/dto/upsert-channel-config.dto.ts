import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Channel } from '@prisma/client';

export class UpsertChannelConfigDto {
  @IsEnum(Channel)
  channel: Channel;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // WhatsApp
  @IsOptional()
  @IsString()
  phoneNumberId?: string;

  @IsOptional()
  @IsString()
  wabaId?: string;

  // Instagram / Messenger
  @IsOptional()
  @IsString()
  pageId?: string;

  // Compartidos
  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  webhookVerifyToken?: string;
}
