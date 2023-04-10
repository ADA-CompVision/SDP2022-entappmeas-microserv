import { CreateUserDto, LoginUserDto, UpdateUserDto } from "@app/shared";
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post("login")
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get("account")
  async getAccount(@Query("id") id: number) {
    return this.authService.getAccount(id);
  }

  @UseInterceptors(FileInterceptor("image"))
  @Patch("account/:id")
  async updateAccount(
    @Param("id") id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.authService.updateAccount(id, updateUserDto, image);
  }

  @Get("send-confirmation-email/:id")
  async sendConfirmationEmail(@Param("id") id: number) {
    return this.authService.sendConfirmationEmail(id);
  }

  @Get("confirm")
  async confirmEmail(@Query("hash") hash: string) {
    return this.authService.confirmEmail(hash);
  }
}
