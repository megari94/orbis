import { IsBoolean, IsOptional, IsString } from 'class-validator';

/** Payload que n8n envía de vuelta a ORBIS con la respuesta del bot */
export class N8nMessageDto {
  @IsString()
  conversationId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}

/** Payload que ORBIS envía a n8n cuando llega un mensaje de un contacto */
export interface N8nEvent {
  event:          'message.received';
  tenantId:       string;
  conversationId: string;
  channel:        string;
  isFirstMessage: boolean;
  contact: {
    id:       string;
    name:     string;
    phone?:   string | null;
    email?:   string | null;
  };
  message: {
    id:        string;
    content:   string;
    createdAt: string;
  };
  // ORBIS le dice a n8n a dónde llamar de vuelta
  callbackUrl: string;
  secret:      string;
}
