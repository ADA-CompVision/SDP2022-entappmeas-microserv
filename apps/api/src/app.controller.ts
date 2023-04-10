import {
  AccountWithoutPassword,
  AuthGuard,
  CheckoutDto,
  CreateAttributeDto,
  CreateBusinessDto,
  CreateCartDto,
  CreateCategoryDto,
  CreateCustomerDto,
  CreateDiscountDto,
  CreateProductDto,
  CreateUserDto,
  GetUser,
  LoginUserDto,
  RoleGuard,
  Roles,
  UpdateAttributeDto,
  UpdateCategoryDto,
  UpdateDiscountDto,
  UpdateProductDto,
  UpdateUserDto,
} from "@app/shared";
import { HttpService } from "@nestjs/axios";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { AxiosError } from "axios";
import { catchError, lastValueFrom, map } from "rxjs";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FormData = require("form-data");

@Controller()
export class AppController {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  @ApiTags("Auth")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Post("auth/register")
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .post<AccountWithoutPassword>(
            `${this.configService.get<string>(
              "AUTH_SERVICE_URL",
            )}/auth/register`,
            createUserDto,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Auth")
  @Post("auth/login")
  @HttpCode(200)
  async login(@Body() loginUserDto: LoginUserDto) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .post<{
            user: AccountWithoutPassword;
            accessToken: string;
          }>(
            `${this.configService.get<string>("AUTH_SERVICE_URL")}/auth/login`,
            loginUserDto,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Auth")
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get("auth/account")
  async getAccount(@GetUser() user: AccountWithoutPassword) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .get<AccountWithoutPassword>(
            `${this.configService.get<string>(
              "AUTH_SERVICE_URL",
            )}/auth/account`,
            { params: { id: user.id } },
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Auth")
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor("image"))
  @Patch("auth/account")
  async updateAccount(
    @GetUser() user: AccountWithoutPassword,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const formData = new FormData();

    updateUserDto.email && formData.append("email", updateUserDto.email);
    updateUserDto.phone && formData.append("phone", updateUserDto.phone);
    image &&
      formData.append("image", Buffer.from(image.buffer), image.originalname);

    try {
      const response = await lastValueFrom(
        this.httpService
          .patch<AccountWithoutPassword>(
            `${this.configService.get<string>(
              "AUTH_SERVICE_URL",
            )}/auth/account/${user.id}`,
            formData,
            { headers: formData.getHeaders() },
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Auth")
  @Get("auth/confirm")
  async confirmEmail(@Query("hash") hash: string) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .get<AccountWithoutPassword>(
            `${this.configService.get<string>(
              "AUTH_SERVICE_URL",
            )}/auth/confirm`,
            { params: { hash } },
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Customer")
  @Post("customer/register")
  async registerCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .post<AccountWithoutPassword>(
            `${this.configService.get<string>(
              "CUSTOMER_SERVICE_URL",
            )}/customer/register`,
            createCustomerDto,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Business")
  @Post("business/register")
  async registerBusiness(@Body() createBusinessDto: CreateBusinessDto) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .post<AccountWithoutPassword>(
            `${this.configService.get<string>(
              "BUSINESS_SERVICE_URL",
            )}/business/register`,
            createBusinessDto,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Category")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Post("category")
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .post(
            `${this.configService.get<string>(
              "CATEGORY_SERVICE_URL",
            )}/category`,
            createCategoryDto,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Category")
  @Get("category")
  async getCategories() {
    try {
      const response = await lastValueFrom(
        this.httpService
          .get(
            `${this.configService.get<string>(
              "CATEGORY_SERVICE_URL",
            )}/category`,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Category")
  @Get("category/:id")
  async getCategory(@Param("id") id: string) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .get(
            `${this.configService.get<string>(
              "CATEGORY_SERVICE_URL",
            )}/category/${id}`,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Category")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Patch("category/:id")
  async updateCategory(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .patch(
            `${this.configService.get<string>(
              "CATEGORY_SERVICE_URL",
            )}/category/${id}`,
            updateCategoryDto,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Category")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Delete("category/:id")
  async deleteCategory(@Param("id") id: string) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .delete(
            `${this.configService.get<string>(
              "CATEGORY_SERVICE_URL",
            )}/category/${id}`,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Attribute")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Post("attribute")
  async createAttribute(@Body() createAttributeDto: CreateAttributeDto) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .post(
            `${this.configService.get<string>(
              "ATTRIBUTE_SERVICE_URL",
            )}/attribute`,
            createAttributeDto,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Attribute")
  @Get("attribute")
  async getAttributes() {
    try {
      const response = await lastValueFrom(
        this.httpService
          .get(
            `${this.configService.get<string>(
              "ATTRIBUTE_SERVICE_URL",
            )}/attribute`,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Attribute")
  @Get("attribute/:id")
  async getAttribute(@Param("id") id: string) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .get(
            `${this.configService.get<string>(
              "ATTRIBUTE_SERVICE_URL",
            )}/attribute/${id}`,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Attribute")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Patch("attribute/:id")
  async updateAttribute(
    @Param("id") id: string,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .patch(
            `${this.configService.get<string>(
              "ATTRIBUTE_SERVICE_URL",
            )}/attribute/${id}`,
            updateAttributeDto,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Attribute")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Delete("attribute/:id")
  async deleteAttribute(@Param("id") id: string) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .delete(
            `${this.configService.get<string>(
              "ATTRIBUTE_SERVICE_URL",
            )}/attribute/${id}`,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Product")
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @Roles(Role.ADMIN, Role.BUSINESS)
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FilesInterceptor("images"))
  @Post("product")
  async createProduct(
    @GetUser() user: AccountWithoutPassword,
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    const formData = new FormData();

    formData.append("name", createProductDto.name);
    formData.append("description", createProductDto.description);
    formData.append("categoryId", createProductDto.categoryId);

    createProductDto.attributes &&
      formData.append("attributes", createProductDto.attributes);
    createProductDto.prices &&
      formData.append("prices", createProductDto.prices);

    images.forEach((image) => {
      formData.append("images", Buffer.from(image.buffer), image.originalname);
    });

    try {
      const response = await lastValueFrom(
        this.httpService
          .post(
            `${this.configService.get<string>("PRODUCT_SERVICE_URL")}/product`,
            formData,
            {
              headers: formData.getHeaders(),
              params: { userId: user.id, userRole: user.role },
            },
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Product")
  @Get("product")
  async getProducts() {
    try {
      const response = await lastValueFrom(
        this.httpService
          .get(
            `${this.configService.get<string>("PRODUCT_SERVICE_URL")}/product`,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Product")
  @Get("product/:id")
  async getProduct(@Param("id") id: string) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .get(
            `${this.configService.get<string>(
              "PRODUCT_SERVICE_URL",
            )}/product/${id}`,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Product")
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @Roles(Role.ADMIN, Role.BUSINESS)
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FilesInterceptor("images"))
  @Patch("product/:id")
  async updateProduct(
    @GetUser() user: AccountWithoutPassword,
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    const formData = new FormData();

    updateProductDto.name && formData.append("name", updateProductDto.name);
    updateProductDto.description &&
      formData.append("description", updateProductDto.description);
    updateProductDto.categoryId &&
      formData.append("categoryId", updateProductDto.categoryId);
    updateProductDto.attributes &&
      formData.append("attributes", updateProductDto.attributes);
    updateProductDto.prices &&
      formData.append("prices", updateProductDto.prices);

    images.forEach((image) => {
      formData.append("images", Buffer.from(image.buffer), image.originalname);
    });

    try {
      const response = await lastValueFrom(
        this.httpService
          .patch(
            `${this.configService.get<string>(
              "PRODUCT_SERVICE_URL",
            )}/product/${id}`,
            formData,
            {
              headers: formData.getHeaders(),
              params: { userId: user.id, userRole: user.role },
            },
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }
  @ApiTags("Product")
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.BUSINESS)
  @UseGuards(AuthGuard, RoleGuard)
  @Delete("product/:id")
  async deleteProduct(
    @GetUser() user: AccountWithoutPassword,
    @Param("id") id: string,
  ) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .delete(
            `${this.configService.get<string>(
              "PRODUCT_SERVICE_URL",
            )}/product/${id}`,
            { params: { userId: user.id, userRole: user.role } },
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Cart")
  @ApiBearerAuth()
  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @Get("cart")
  async getCart(@GetUser() user: AccountWithoutPassword) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .get(
            `${this.configService.get<string>("CART_SERVICE_URL")}/cart/${
              user.id
            }`,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Cart")
  @ApiBearerAuth()
  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @Post("cart")
  async addToCart(
    @GetUser() user: AccountWithoutPassword,
    @Body() createCartDto: CreateCartDto,
  ) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .post(
            `${this.configService.get<string>("CART_SERVICE_URL")}/cart/${
              user.id
            }`,
            createCartDto,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Cart")
  @ApiBearerAuth()
  @ApiQuery({ name: "discountCode", required: false })
  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @Get("cart/total")
  async getCartTotal(
    @GetUser() user: AccountWithoutPassword,
    @Query("discountCode") discountCode?: string,
  ) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .get(
            `${this.configService.get<string>("CART_SERVICE_URL")}/cart/total/${
              user.id
            }`,
            {
              params: {
                discountCode,
              },
            },
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Cart")
  @ApiBearerAuth()
  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @Post("cart/checkout")
  async checkout(
    @GetUser() user: AccountWithoutPassword,
    @Body() checkoutDto: CheckoutDto,
  ) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .post(
            `${this.configService.get<string>(
              "CART_SERVICE_URL",
            )}/cart/checkout/${user.id}`,
            checkoutDto,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Discount")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Post("discount")
  async createDiscount(@Body() createDiscountDto: CreateDiscountDto) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .post(
            `${this.configService.get<string>(
              "DISCOUNT_SERVICE_URL",
            )}/discount`,
            createDiscountDto,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Discount")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Get("discount")
  async getDiscounts() {
    try {
      const response = await lastValueFrom(
        this.httpService
          .get(
            `${this.configService.get<string>(
              "DISCOUNT_SERVICE_URL",
            )}/discount`,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Discount")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Get("discount/:id")
  async getDiscount(@Param("id") id: string) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .get(
            `${this.configService.get<string>(
              "DISCOUNT_SERVICE_URL",
            )}/discount/${id}`,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Discount")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Patch("discount/:id")
  async updateDiscount(
    @Param("id") id: string,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .patch(
            `${this.configService.get<string>(
              "DISCOUNT_SERVICE_URL",
            )}/discount/${id}`,
            updateDiscountDto,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Discount")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Delete("discount/:id")
  async deleteDiscount(@Param("id") id: string) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .delete(
            `${this.configService.get<string>(
              "DISCOUNT_SERVICE_URL",
            )}/discount/${id}`,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Order")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Get("order")
  async findMany() {
    try {
      const response = await lastValueFrom(
        this.httpService
          .get(`${this.configService.get<string>("ORDER_SERVICE_URL")}/order`)
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return response;
    } catch (error) {
      throw error;
    }
  }
}
