import { PrismaService, S3Service } from "@app/shared";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService, PrismaService, S3Service],
})
export class ProductModule {}
