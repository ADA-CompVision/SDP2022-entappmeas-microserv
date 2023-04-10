import { CreateDiscountDto, UpdateDiscountDto } from "@app/shared";
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { DiscountService } from "./discount.service";

@Controller("discount")
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  async create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountService.create({
      data: createDiscountDto,
    });
  }

  @Get()
  async findAll() {
    return this.discountService.findMany();
  }

  @Get(":id")
  async findUnique(@Param("id") id: string) {
    const discount = await this.discountService.findUnique({
      where: { id },
    });

    if (!discount) {
      throw new NotFoundException("Discount not found");
    }

    return discount;
  }

  @Get("code/:code")
  async findByCode(@Param("code") code: string) {
    const discount = await this.discountService.findUnique({
      where: { code },
    });

    if (!discount) {
      throw new NotFoundException("Discount not found");
    }

    return discount;
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ) {
    const discount = await this.discountService.findUnique({
      where: { id },
    });

    if (!discount) {
      throw new NotFoundException("Discount not found");
    }

    return this.discountService.update({
      data: updateDiscountDto,
      where: { id },
    });
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    const discount = await this.discountService.findUnique({
      where: { id },
    });

    if (!discount) {
      throw new NotFoundException("Discount not found");
    }

    return this.discountService.delete({
      where: { id },
    });
  }

  @Get("decrement/:code")
  async decrement(@Param("code") code: string) {
    const discount = await this.discountService.findUnique({
      where: { code },
    });

    if (discount.limit) {
      return this.discountService.update({
        data: {
          remaining: { decrement: 1 },
        },
        where: { code },
      });
    } else {
      return null;
    }
  }
}
