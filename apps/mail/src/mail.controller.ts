import { ISendMailOptions } from "@nestjs-modules/mailer";
import { Body, Controller, Post } from "@nestjs/common";
import { MailService } from "./mail.service";

@Controller("mail")
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post("send")
  async sendMail(@Body() options: ISendMailOptions) {
    return this.mailService.sendMail(options);
  }
}
