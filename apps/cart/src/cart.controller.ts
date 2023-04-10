import { CheckoutDto, CreateCartDto } from "@app/shared";
import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CartService } from "./cart.service";

@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(":userId")
  async getCart(@Param("userId") userId: number) {
    return this.cartService.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            prices: true,
            images: true,
          },
        },
      },
    });
  }

  @Post(":userId")
  async addToCart(
    @Param("userId") userId: number,
    @Body() createCartDto: CreateCartDto,
  ) {
    return this.cartService.addToCart(userId, createCartDto);
  }

  @Get("total/:userId")
  async getCartTotal(
    @Param("userId") userId: number,
    @Query("discountCode") discountCode?: string,
  ) {
    const { total, discountTotal } = await this.cartService.findTotal(
      userId,
      discountCode,
    );

    return { total, discountTotal };
  }

  @Post("checkout/:userId")
  async checkout(
    @Param("userId") userId: number,
    @Body() checkoutDto: CheckoutDto,
  ) {
    return this.cartService.checkout(userId, checkoutDto);
  }
}
