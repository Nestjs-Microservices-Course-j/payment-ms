import { Controller, Get, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  createPaymentSession() {
    return {
      createPaymentSession: 'createPaymentSession'
    }
  }

  @Get('success')
  success() {
    return {
      status: 'ok',
      message: 'Payment successful'
    }
  }

  @Get('cancelled')
  cancel() {
    return {
      status: 'ok',
      message: 'cancelled'
    }
  }

  @Post('webhook')
  async stripeWebhook() {
    return {
     stripeWebhook: 'stripeWebhook'
    }
  }
}
