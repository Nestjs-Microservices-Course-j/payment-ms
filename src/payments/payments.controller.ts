import { Request, Response } from 'express';
import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  //@Post('create-payment-session')
  @MessagePattern('create.payment.session')
  createPaymentSession(
    @Payload() paymentSessionDto : PaymentSessionDto,   
  ) {    
    return this.paymentsService.createPaymentSession( paymentSessionDto );
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
  stripeWebhook( 
   @Req() request : Request,
   @Res() response : Response
  ) {
    return this.paymentsService.stripeWebhook(request, response);
  }
}
