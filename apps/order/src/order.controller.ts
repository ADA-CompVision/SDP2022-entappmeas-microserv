import { Body, Controller, Get, Post } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { OrderService } from "./order.service";

@Controller("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(
    @Body()
    data: Prisma.XOR<Prisma.OrderCreateInput, Prisma.OrderUncheckedCreateInput>,
  ) {
    return this.orderService.create({ data });
  }

  @Get()
  async findMany() {
    return this.orderService.findMany();
  }
}
