import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ClientService } from '../clients/client.service';
import { HistoryService } from '../history/history.service';

@Injectable()
export class TasksService {
    constructor(
        private cs: ClientService,
        private hs: HistoryService,
    ) { }

    @Cron('0 0 * * *')
    async resetStatuses() {
        try {
            const clients = await this.cs.findAll();

            for (const client of clients) {
                if (client.status !== 'В процессе' || client.comment !== '') {
                    // сохраняем историю перед сбросом
                    await this.hs.record(client);

                    await this.cs.update(
                        client.id,
                        {
                            status: 'В процессе',
                            comment: '', // очищаем комментарий
                        },
                        true // не писать в историю повторно
                    );
                }
            }

            console.log('Statuses and comments reset at', new Date().toISOString());
        } catch (error) {
            console.error('Error resetting statuses and comments:', error);
        }
    }
}