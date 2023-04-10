import { PrismaService } from "@app/shared";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { CategoryModule } from "./category.module";

async function bootstrap() {
  const app = await NestFactory.create(CategoryModule);
  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await prismaService.enableShutdownHooks(app);

  await app.listen(configService.get<number>("CATEGORY_SERVICE_PORT"));
}
bootstrap();
