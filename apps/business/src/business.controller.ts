import { CreateBusinessDto, hash, PrismaService } from "@app/shared";
import { HttpService } from "@nestjs/axios";
import { Body, Controller, Post } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Role } from "@prisma/client";
import { AxiosError } from "axios";
import { catchError, lastValueFrom, map } from "rxjs";

@Controller("business")
export class BusinessController {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
  ) {}

  @Post("register")
  async register(
    @Body()
    { name, ...user }: CreateBusinessDto,
  ) {
    const password = hash(user.password);

    const business = await this.prismaService.user.create({
      data: {
        ...user,
        password,
        role: Role.BUSINESS,
        business: { create: { name } },
      },
      include: {
        customer: true,
        business: true,
        image: true,
      },
    });

    delete business.password;

    lastValueFrom(
      this.httpService
        .get(
          `${this.configService.get<string>(
            "AUTH_SERVICE_URL",
          )}/auth/send-confirmation-email/${business.id}`,
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        ),
    );

    return business;
  }
}
