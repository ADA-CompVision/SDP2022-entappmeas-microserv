import { CreateUserDto, hash } from "@app/shared";
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("create")
  async create(@Body() createUserDto: CreateUserDto) {
    const password = hash(createUserDto.password);

    const user = await this.userService.create({
      data: {
        ...createUserDto,
        password,
      },
      include: {
        customer: true,
        business: true,
        image: true,
      },
    });

    delete user.password;

    return user;
  }

  @Get()
  async findUnique(
    @Query("email") email?: string,
    @Query("phone") phone?: string,
  ) {
    return this.userService.findUnique({
      where: { email, phone },
      include: { customer: true, business: true, image: true },
    });
  }

  @Get(":id")
  async getUser(@Param("id") id: number) {
    return this.userService.findUnique({
      where: { id },
      include: { customer: true, business: true, image: true },
    });
  }

  @Patch(":id")
  async updateUser(
    @Param("id") id: number,
    @Body()
    data: Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>,
  ) {
    const user = await this.userService.update({
      data,
      where: { id },
      include: { customer: true, business: true, image: true },
    });

    delete user.password;

    return user;
  }
}
