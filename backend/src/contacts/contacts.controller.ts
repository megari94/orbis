import { Controller, Get, Patch, Param, Body, Headers } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly svc: ContactsService) {}

  @Get()
  findAll(@Headers('x-tenant-id') tenantId: string) {
    return this.svc.findAll(tenantId);
  }

  @Get(':id')
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.svc.findOne(tenantId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() body: { name?: string; email?: string; location?: string },
  ) {
    return this.svc.update(tenantId, id, body);
  }
}