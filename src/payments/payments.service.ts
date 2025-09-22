import { Request, Response } from 'express';
import { Inject, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

import { envs, NATS_SERVICE } from 'src/config';
import { PaymentSessionDto } from './dto/payment-session';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {
    private readonly stripe = new Stripe(envs.stripeSecret);
    private readonly logger = new Logger('PaymentsService');

    constructor(
        @Inject(NATS_SERVICE)
        private readonly natsClient: ClientProxy
    ) {}

    async createPaymentSession( paymentSessionDto : PaymentSessionDto ) {
        const { currency, items, orderId } = paymentSessionDto;

        //*formateando data a como lo pide stripe
        const line_items = items.map(item => ({
            price_data: { 
                currency,
                product_data: {
                    name: item.name,
                },
                unit_amount: Math.round( item.price  * 100 ) 
            },
            quantity: item.quantity
        }));

        const  session = await this.stripe.checkout.sessions.create({            
            payment_intent_data: {
                metadata: {
                    orderId
                }
            },

            //*items que se estan comprando
            line_items: line_items,
            mode: 'payment',
            success_url: envs.stripeSuccessUrl,
            cancel_url: envs.stripeCancelUrl
        });

        //return session;
        return {
            cancelUrl: session.cancel_url,
            successUrl: session.success_url,
            url: session.url
        }
    }

    async stripeWebhook( request : Request, response : Response ) {
        const signature = request.headers['stripe-signature'];
        let event: Stripe.Event;
        
        try {
            event = this.stripe.webhooks.constructEvent(
                request['rawBody'],
                signature,
                envs.stripeEndpointSecret
            );
        } catch (error) {
            console.log(`⚠️  Webhook signature verification failed.`, error.message);
            return response.sendStatus(400);
        }


        switch(event.type) {
            case 'charge.succeeded' :              
                const chargeSucceeded  = event.data.object;
                const payload = {
                    stripePaymentId: chargeSucceeded.id,
                    orderId: chargeSucceeded.metadata.orderId,
                    receiptUrl: chargeSucceeded.receipt_url,
                }

               //* la funcion emit es para eventos que no esperamos respuesta
                this.natsClient.emit('payment.succeeded', payload);  
            break;
            default:
                console.log(`Event ${event.type } not handled`);
        }        
        
        return response.status(200).json({ signature });
    }

}
