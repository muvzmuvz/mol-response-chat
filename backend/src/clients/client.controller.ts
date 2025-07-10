import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { ClientService } from './client.service';
import { Delete } from '@nestjs/common';

interface CreateClientDto {
  routeTitle: string;
  organization: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  comment?: string; // добавлено
}

interface UpdateClientDto {
  routeTitle?: string;
  organization?: string;
  name?: string;
  phone?: string;
  email?: string;
  status?: string;
  comment?: string; // добавлено
}

@Controller('clients')
export class ClientController {
    constructor(private svc: ClientService) { }

    @Post()
    create(@Body() dto: CreateClientDto) {
        return this.svc.create(dto);
    }

    @Get()
    findAll() {
        return this.svc.findAll();
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
        return this.svc.update(+id, dto);
    }
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.svc.remove(+id);
    }
    @Get('with-history')
    getClientsWithHistory() {
        return this.svc.findAllWithHistory();
    }
}
