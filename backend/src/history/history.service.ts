import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { History } from './history.entity';
import { Repository } from 'typeorm';
import { Client } from '../clients/client.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History)
    private repo: Repository<History>,
  ) { }

  record(client: Client) {
    const h = this.repo.create({
      client,
      status: client.status,
      date: new Date(), // сохраняем дату и время
    });
    return this.repo.save(h);
  }
  async findByClientId(clientId: number) {
    return this.repo.find({
      where: {
        client: { id: clientId }
      },
      relations: ['client'],
      order: { date: 'DESC' }
    });
  }
  async deleteByClientId(clientId: number) {
    await this.repo.delete({ client: { id: clientId } });
  }

}
