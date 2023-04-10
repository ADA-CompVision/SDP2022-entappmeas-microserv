import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { MailModule } from "./mail.module";

async function bootstrap() {
  const app = await NestFactory.create(MailModule);
  const configService = app.get(ConfigService);

  await app.listen(configService.get<number>("MAIL_SERVICE_PORT"));
}
bootstrap();
