import { PrismaService } from "@app/shared";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiscountController } from "./discount.controller";
import { DiscountService } from "./discount.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [DiscountController],
  providers: [DiscountService, PrismaService],
})
export class DiscountModule {}
