import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class HealtCheckController {

    @Get()
    healtCheck() {
        return { status: 'Payments Webhook is running!!' };
    }
}
