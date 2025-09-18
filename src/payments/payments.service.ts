import { Request, Response } from 'express';
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

import { envs } from 'src/config';
import { PaymentSessionDto } from './dto/payment-session';

@Injectable()
export class PaymentsService {
    private readonly stripe = new Stripe(envs.stripeSecret);

    async createPaymentSession( paymentSessionDto : PaymentSessionDto ) {
        const { currency, items } = paymentSessionDto;

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
            //todo: Colocar aqui ID de mi orden
            payment_intent_data: {
                metadata: {}
            },

            //*items que se estan comprando
            line_items: line_items,
            mode: 'payment',
            success_url: 'http://localhost:3003/payments/success',
            cancel_url: 'http://localhost:3003/payments/cancelled'
        });

        return session;
    }

    async stripeWebhook( request : Request, response : Response ) {
        const signature = request.headers['stripe-signature'];
        let event: Stripe.Event;

        const endpointSecret = 'whsec_4e46be94425a930c86e8d920d3afca4001868695e084db38dcca0a96cac21d0a';
        
        try {
            event = this.stripe.webhooks.constructEvent(
                request['rawBody'],
                signature,
                endpointSecret
            );
        } catch (error) {
            console.log(`⚠️  Webhook signature verification failed.`, error.message);
            return response.sendStatus(400);
        }


        switch(event.type) {
            case 'charge.succeeded' :
                //todo: llamar nuestro microservicio
                console.log(event);
            break;
            default:
                console.log(`evento no controlado`);
        }        
        
        return response.status(200).json({ signature });
    }

}
