import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpsertBotConfigDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsString()
  @MinLength(10, { message: 'Describí tu negocio con al menos 10 caracteres' })
  businessContext: string;

  @IsOptional()
  @IsString()
  handoffMessage?: string;

  @IsOptional()
  @IsString()
  model?: string;
}
