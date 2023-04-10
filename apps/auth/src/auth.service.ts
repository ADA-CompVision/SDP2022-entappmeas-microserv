import {
  Account,
  AccountWithoutPassword,
  compare,
  CreateUserDto,
  LoginUserDto,
  S3Service,
  UpdateUserDto,
} from "@app/shared";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { HttpService } from "@nestjs/axios";
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AxiosError } from "axios";
import { randomUUID } from "crypto";
import { catchError, lastValueFrom, map } from "rxjs";

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly s3Service: S3Service,
  ) {}

  async register(createUserDto: CreateUserDto) {
    try {
      const user = await lastValueFrom(
        this.httpService
          .post<AccountWithoutPassword>(
            `${this.configService.get<string>("USER_SERVICE_URL")}/user/create`,
            createUserDto,
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return user;
    } catch (error) {
      throw error;
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await lastValueFrom(
      this.httpService
        .get<Account>(
          `${this.configService.get<string>("USER_SERVICE_URL")}/user`,
          {
            params: {
              email: loginUserDto.email,
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

    if (user && compare(loginUserDto.password, user.password)) {
      delete user.password;

      return {
        user,
        accessToken: this.jwtService.sign(user),
      };
    } else {
      throw new UnauthorizedException();
    }
  }

  async getAccount(id: number) {
    const user = await lastValueFrom(
      this.httpService
        .get<Account>(
          `${this.configService.get<string>("USER_SERVICE_URL")}/user/${id}`,
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        ),
    );

    delete user.password;

    return user;
  }

  async updateAccount(
    id: number,
    updateUserDto: UpdateUserDto,
    image?: Express.Multer.File,
  ) {
    const _user = await lastValueFrom(
      this.httpService
        .get<Account>(
          `${this.configService.get<string>("USER_SERVICE_URL")}/user/${id}`,
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        ),
    );

    const key =
      image &&
      `user-images/${id}-${randomUUID()}.${image.originalname
        .split(".")
        .pop()}`;
    const url =
      image && `${this.configService.get<string>("SPACES_CDN_ENDPOINT")}${key}`;

    try {
      image &&
        (await this.s3Service.send(
          new PutObjectCommand({
            Bucket: this.configService.get<string>("SPACES_BUCKET"),
            Key: key,
            Body: image.buffer,
            ContentLength: image.size,
            ACL: "public-read",
          }),
        ));

      const user = await lastValueFrom(
        this.httpService
          .patch<AccountWithoutPassword>(
            `${this.configService.get<string>("USER_SERVICE_URL")}/user/${id}`,
            {
              email: updateUserDto.email,
              phone: updateUserDto.phone,
              image: image
                ? {
                    delete: !!_user.image,
                    create: { key, url },
                  }
                : undefined,
            },
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      return user;
    } catch {
      throw new BadRequestException();
    }
  }

  async sendConfirmationEmail(id: number) {
    const account = await this.getAccount(id);

    account.confirmed = true;

    const accessToken = this.jwtService.sign(account);
    const hash = Buffer.from(accessToken, "utf8").toString("hex");

    return await lastValueFrom(
      this.httpService
        .post(
          `${this.configService.get<string>("MAIL_SERVICE_URL")}/mail/send`,
          {
            from: "admin@eminaliyev.tech",
            to: account.email,
            subject: "Gift | Email confirmation",
            html: `<a href="http://159.223.250.148/confirm/${hash}">Click on the link to confirm your email address</a>`,
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        ),
    );
  }

  async confirmEmail(hash: string) {
    const accessToken = Buffer.from(hash, "hex").toString("utf8");

    try {
      const account = (await this.jwtService.verifyAsync(
        accessToken,
      )) as AccountWithoutPassword;

      if (account) {
        const user = await lastValueFrom(
          this.httpService
            .patch<AccountWithoutPassword>(
              `${this.configService.get<string>("USER_SERVICE_URL")}/user/${
                account.id
              }`,
              {
                confirmed: account.confirmed,
              },
            )
            .pipe(
              map((response) => response.data),
              catchError((error: AxiosError) => {
                throw error.response.data;
              }),
            ),
        );

        return {
          user,
          accessToken: this.jwtService.sign(user),
        };
      } else {
        throw new BadRequestException();
      }
    } catch (error) {
      throw new BadRequestException();
    }
  }
}
