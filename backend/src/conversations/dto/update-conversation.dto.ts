import { IsEnum, IsOptional, IsString, IsArray } from 'class-validator';
import { Status, Priority } from '@prisma/client';

export class UpdateConversationDto {
  @IsOptional() @IsEnum(Status)    status?: Status;
  @IsOptional() @IsEnum(Priority)  priority?: Priority;
  @IsOptional() @IsString()        assignedTo?: string;
  @IsOptional() @IsArray()         tags?: string[];
}