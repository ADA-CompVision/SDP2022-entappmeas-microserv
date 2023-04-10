import { PrismaService } from "@app/shared";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
  ],
  controllers: [CartController],
  providers: [CartService, PrismaService],
})
export class CartModule {}
