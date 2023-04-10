import { CreateAttributeDto, UpdateAttributeDto } from "@app/shared";
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
import { AttributeService } from "./attribute.service";

@Controller("attribute")
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @Post()
  async create(@Body() createAttributeDto: CreateAttributeDto) {
    const { categories, ...rest } = createAttributeDto;

    return this.attributeService.create({
      data: {
        ...rest,
        categories: {
          connect: categories?.map((id) => ({ id })),
        },
      },
      include: { categories: true },
    });
  }

  @Get()
  async findMany() {
    return this.attributeService.findMany({ include: { categories: true } });
  }

  @Get(":id")
  async findUnique(@Param("id") id: string) {
    const attribute = await this.attributeService.findUnique({
      where: { id },
      include: { categories: true },
    });

    if (!attribute) {
      throw new NotFoundException("Attribute not found");
    }

    return attribute;
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ) {
    const attribute = await this.attributeService.findUnique({
      where: { id },
      include: {
        categories: true,
      },
    });

    if (!attribute) {
      throw new NotFoundException("Attribute not found");
    }

    const { categories, ...rest } = updateAttributeDto;
    const attributeCategories = attribute.categories.map(({ id }) => id);

    const connect = categories
      ? categories
          .filter((category) => !attributeCategories.includes(category))
          .map((id) => ({ id }))
      : undefined;

    const disconnect = categories
      ? attributeCategories
          .filter(
            (attributeCategory) => !categories.includes(attributeCategory),
          )
          .map((id) => ({ id }))
      : undefined;

    return this.attributeService.update({
      data: {
        ...rest,
        categories: {
          disconnect,
          connect,
        },
      },
      where: { id },
      include: { categories: true },
    });
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    const attribute = await this.attributeService.findUnique({
      where: { id },
    });

    if (!attribute) {
      throw new NotFoundException("Attribute not found");
    }

    return this.attributeService.delete({
      where: { id },
      include: { categories: true },
    });
  }
}
