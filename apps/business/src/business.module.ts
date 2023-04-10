import { PrismaService } from "@app/shared";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BusinessController } from "./business.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
  ],
  controllers: [BusinessController],
  providers: [PrismaService],
})
export class BusinessModule {}
