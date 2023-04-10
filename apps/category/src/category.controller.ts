import { CreateCategoryDto, UpdateCategoryDto } from "@app/shared";
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
import { CategoryService } from "./category.service";

@Controller("category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const { attributes, ...rest } = createCategoryDto;

    return this.categoryService.create({
      data: {
        ...rest,
        attributes: {
          connect: attributes?.map((id) => ({ id })),
        },
      },
      include: { attributes: true },
    });
  }

  @Get()
  async findMany() {
    return this.categoryService.findMany({ include: { attributes: true } });
  }

  @Get(":id")
  async findUnique(@Param("id") id: string) {
    const category = await this.categoryService.findUnique({
      where: { id },
      include: { attributes: true },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return category;
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoryService.findUnique({
      where: { id },
      include: {
        attributes: true,
      },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    const { attributes, ...rest } = updateCategoryDto;
    const categoryAttributes = category.attributes.map(({ id }) => id);

    const connect = attributes
      ? attributes
          .filter((attribute) => !categoryAttributes.includes(attribute))
          .map((id) => ({ id }))
      : undefined;

    const disconnect = attributes
      ? categoryAttributes
          .filter(
            (categoryAttribute) => !attributes.includes(categoryAttribute),
          )
          .map((id) => ({ id }))
      : undefined;

    return this.categoryService.update({
      data: {
        ...rest,
        attributes: {
          disconnect,
          connect,
        },
      },
      where: { id },
      include: { attributes: true },
    });
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    const category = await this.categoryService.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return this.categoryService.delete({
      where: { id },
      include: { attributes: true },
    });
  }
}
