import { PrismaService } from "@app/shared";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AttributeController } from "./attribute.controller";
import { AttributeService } from "./attribute.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AttributeController],
  providers: [AttributeService, PrismaService],
})
export class AttributeModule {}
