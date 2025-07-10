import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RouteService } from '../route/route.service';
import { HistoryService } from '../history/history.service';
import { History } from '../history/history.entity';

// DTO для создания клиента
interface CreateClientDto {
    routeTitle: string;
    organization: string;
    name: string;
    phone: string;
    email: string;
    status: string;
    comment?: string; // Новый параметр комментария
}

// DTO для обновления клиента
interface UpdateClientDto {
    routeTitle?: string;
    organization?: string;
    name?: string;
    phone?: string;
    email?: string;
    status?: string;
    comment?: string; // Новый параметр комментария
}

@Injectable()
export class ClientService {
    constructor(
        @InjectRepository(Client)
        private repo: Repository<Client>,
        private routeService: RouteService,
        private historyService: HistoryService
    ) {}

    // Создание клиента
    async create(dto: CreateClientDto) {
        if (!dto.routeTitle) {
            throw new BadRequestException('routeTitle is required');
        }

        const route = await this.routeService.findOrCreate(dto.routeTitle);
        if (!route) {
            throw new NotFoundException('Route could not be created or found');
        }

        const client = this.repo.create({
            organization: dto.organization,
            name: dto.name,
            phone: dto.phone,
            email: dto.email,
            status: dto.status,
            comment: dto.comment ?? '', // Сохраняем комментарий, если передан
            route,
        });

        const savedClient = await this.repo.save(client);

        return this.repo.findOne({
            where: { id: savedClient.id },
            relations: ['route'],
        });
    }

    // Получение всех клиентов
    findAll() {
        return this.repo.find({
            order: { createdAt: 'DESC' },
            relations: ['route'],
        });
    }

    // Обновление клиента
    async update(id: number, dto: UpdateClientDto, skipHistory = false) {
        const client = await this.repo.findOne({
            where: { id },
            relations: ['route'],
        });

        if (!client) {
            throw new NotFoundException('Client not found');
        }

        if (dto.routeTitle) {
            const route = await this.routeService.findOrCreate(dto.routeTitle);
            client.route = route;
        }

        client.organization = dto.organization ?? client.organization;
        client.name = dto.name ?? client.name;
        client.phone = dto.phone ?? client.phone;
        client.email = dto.email ?? client.email;
        client.status = dto.status ?? client.status;
        client.comment = dto.comment ?? client.comment; // Обновляем комментарий

        await this.repo.save(client);

        if (!skipHistory) {
            await this.historyService.record(client); // Сохраняем в историю
        }

        return this.repo.findOne({
            where: { id },
            relations: ['route'],
        });
    }

    // Удаление клиента
    async remove(id: number) {
        const client = await this.repo.findOne({ where: { id } });

        if (!client) {
            throw new NotFoundException('Client not found');
        }

        await this.historyService.deleteByClientId(id);
        await this.repo.remove(client);

        return { message: `Client with id ${id} has been deleted` };
    }

    // Получение клиентов вместе с историей
    async findAllWithHistory() {
        const clients = await this.repo.find({
            relations: ['route'],
            order: { createdAt: 'DESC' },
        });

        const result: Array<Client & { history: History[] }> = [];

        for (const client of clients) {
            const history = await this.historyService.findByClientId(client.id);
            result.push({
                ...client,
                history,
            });
        }

        return result;
    }
}
