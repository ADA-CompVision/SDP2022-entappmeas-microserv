import { PrismaService } from "@app/shared";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AttributeModule } from "./attribute.module";

async function bootstrap() {
  const app = await NestFactory.create(AttributeModule);
  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await prismaService.enableShutdownHooks(app);

  await app.listen(configService.get<number>("ATTRIBUTE_SERVICE_PORT"));
}
bootstrap();
