import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
    constructor(private hs: HistoryService) { }

    @Get(':clientId')
    async getClientHistory(@Param('clientId') clientId: string) {
        const history = await this.hs.findByClientId(+clientId);

        if (!history.length) {
            throw new NotFoundException('История не найдена для этого клиента');
        }

        return history;
    }
}
