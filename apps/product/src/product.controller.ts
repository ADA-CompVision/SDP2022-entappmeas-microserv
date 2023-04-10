import {
  CreateProductDto,
  Price,
  ProductAttribute,
  S3Service,
  UpdateProductDto,
} from "@app/shared";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Role } from "@prisma/client";
import { randomUUID } from "crypto";
import { ProductService } from "./product.service";

@Controller("product")
export class ProductController {
  constructor(
    private readonly configService: ConfigService,
    private readonly productService: ProductService,
    private readonly s3Service: S3Service,
  ) {}

  @UseInterceptors(FilesInterceptor("images"))
  @Post()
  async create(
    @Query("userId", new ParseIntPipe()) userId: number,
    @Query("userRole") userRole: string,
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    const { name, description, categoryId, attributes, prices } =
      createProductDto;

    const parsedAttributes = attributes
      ? (JSON.parse(attributes) as ProductAttribute[])
      : undefined;

    const parsedPrices = prices ? (JSON.parse(prices) as Price[]) : undefined;

    const _images: Array<{ key: string; url: string }> = [];

    try {
      for (const image of images) {
        const key = `product-images/${randomUUID()}.${image.originalname
          .split(".")
          .pop()}`;
        const url = `${this.configService.get<string>(
          "SPACES_CDN_ENDPOINT",
        )}${key}`;

        await this.s3Service.send(
          new PutObjectCommand({
            Bucket: this.configService.get<string>("SPACES_BUCKET"),
            Key: key,
            Body: image.buffer,
            ContentLength: image.size,
            ACL: "public-read",
          }),
        );

        _images.push({ key, url });
      }

      return this.productService.create({
        data: {
          name,
          description,
          categoryId,
          businessUserId: userRole === Role.BUSINESS ? userId : null,
          productAttributes: {
            createMany: parsedAttributes
              ? {
                  data: parsedAttributes,
                }
              : undefined,
          },
          prices: {
            createMany: parsedPrices
              ? {
                  data: parsedPrices,
                }
              : undefined,
          },
          images: {
            createMany:
              _images.length > 0
                ? {
                    data: _images,
                  }
                : undefined,
          },
        },
        include: {
          category: true,
          productAttributes: true,
          prices: true,
          images: true,
        },
      });
    } catch {
      throw new BadRequestException();
    }
  }

  @Get()
  async findMany() {
    return this.productService.findMany({
      include: {
        category: true,
        productAttributes: true,
        prices: true,
        images: true,
        business: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  @Get(":id")
  async findUnique(@Param("id") id: string) {
    const product = await this.productService.findUnique({
      where: { id },
      include: {
        category: true,
        productAttributes: true,
        prices: true,
        images: true,
        business: true,
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return product;
  }

  @UseInterceptors(FilesInterceptor("images"))
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Query("userId", new ParseIntPipe()) userId: number,
    @Query("userRole") userRole: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    const product = await this.productService.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (userRole === Role.BUSINESS && product.businessUserId !== userId) {
      throw new ForbiddenException();
    }

    const { name, description, categoryId, attributes, prices } =
      updateProductDto;

    const parsedAttributes = attributes
      ? (JSON.parse(attributes) as ProductAttribute[])
      : undefined;

    const parsedPrices = prices ? (JSON.parse(prices) as Price[]) : undefined;

    const _images: Array<{ key: string; url: string }> = [];

    try {
      for (const image of images) {
        const key = `product-images/${randomUUID()}.${image.originalname
          .split(".")
          .pop()}`;
        const url = `${this.configService.get<string>(
          "SPACES_CDN_ENDPOINT",
        )}${key}`;

        await this.s3Service.send(
          new PutObjectCommand({
            Bucket: this.configService.get<string>("SPACES_BUCKET"),
            Key: key,
            Body: image.buffer,
            ContentLength: image.size,
            ACL: "public-read",
          }),
        );

        _images.push({ key, url });
      }

      return this.productService.update({
        data: {
          name,
          description,
          categoryId,
          productAttributes: {
            deleteMany: parsedAttributes ? {} : undefined,
            createMany: parsedAttributes
              ? {
                  data: parsedAttributes,
                }
              : undefined,
          },
          prices: {
            deleteMany: parsedPrices ? {} : undefined,
            createMany: parsedPrices
              ? {
                  data: parsedPrices,
                }
              : undefined,
          },
          images: {
            deleteMany: _images.length > 0 ? {} : undefined,
            createMany:
              _images.length > 0
                ? {
                    data: _images,
                  }
                : undefined,
          },
        },
        where: { id },
        include: {
          category: true,
          productAttributes: true,
          prices: true,
          images: true,
        },
      });
    } catch {
      throw new BadRequestException();
    }
  }

  @Delete(":id")
  async delete(
    @Param("id") id: string,
    @Query("userId", new ParseIntPipe()) userId: number,
    @Query("userRole") userRole: string,
  ) {
    const product = await this.productService.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (userRole === Role.BUSINESS && product.businessUserId !== userId) {
      throw new ForbiddenException();
    }

    return this.productService.delete({
      where: { id },
    });
  }
}