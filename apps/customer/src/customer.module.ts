import { PrismaService } from "@app/shared";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CustomerController } from "./customer.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
  ],
  controllers: [CustomerController],
  providers: [PrismaService],
})
export class CustomerModule {}
