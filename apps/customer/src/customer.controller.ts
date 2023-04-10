import { CreateCustomerDto, hash, PrismaService } from "@app/shared";
import { HttpService } from "@nestjs/axios";
import { Body, Controller, Post } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Role } from "@prisma/client";
import { AxiosError } from "axios";
import { catchError, lastValueFrom, map } from "rxjs";

@Controller("customer")
export class CustomerController {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
  ) {}

  @Post("register")
  async register(
    @Body()
    { firstName, lastName, birthDate, gender, ...user }: CreateCustomerDto,
  ) {
    const password = hash(user.password);

    const customer = await this.prismaService.user.create({
      data: {
        ...user,
        password,
        role: Role.CUSTOMER,
        customer: {
          create: {
            firstName,
            lastName,
            birthDate: new Date(birthDate),
            gender,
          },
        },
      },
      include: {
        customer: true,
        business: true,
        image: true,
      },
    });

    delete customer.password;

    lastValueFrom(
      this.httpService
        .get(
          `${this.configService.get<string>(
            "AUTH_SERVICE_URL",
          )}/auth/send-confirmation-email/${customer.id}`,
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        ),
    );

    return customer;
  }
}
