import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('PaymentsMS')

  const app = await NestFactory.create(AppModule, {
    rawBody: true
  });

  app.useGlobalPipes(  
    new ValidationPipe({ 
      whitelist: true, 
      forbidNonWhitelisted: true, 
    }) 
  );

  //*configuracion para convertir esta app hibrida (API/Micorservicios)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    
    options: {
      servers: envs.natsServers
    },
  },
  { inheritAppConfig: true }); //se utiliza inheritAppConfig por que como es una app hibrida, si no se pone esta opcion, no hereda la configuracion global del app principal (validaciones, filtros, etc) 

  //*iniciando los microservicios
  await app.startAllMicroservices();

  await app.listen(envs.port);
  logger.log(`Payments Microservice running on port ${ envs.port}`)
}
bootstrap();
