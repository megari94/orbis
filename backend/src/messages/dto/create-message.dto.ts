import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsString() @MinLength(1)
  content: string;

  @IsOptional() @IsBoolean()
  isInternal?: boolean;
}