import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { AuthValidateEmailDto } from './dto/auth-validate-email.dto';
import { LoginResponseType } from './types/login-response.type';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('email/validate')
  @HttpCode(HttpStatus.OK)
  async validateEmail(@Body() validateEmailDto: AuthValidateEmailDto) {
    return this.authService.validateEmail(validateEmailDto);
  }

  @Post('email/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmEmail(@Body() confirmEmailDto: AuthConfirmEmailDto) {
    return this.authService.confirmEmail(confirmEmailDto);
  }

  @Post('email/register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() registerDto: AuthRegisterLoginDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() registerDto: AuthLoginDto): Promise<LoginResponseType> {
    return this.authService.login(registerDto);
  }

  @Post('forgot/request')
  @HttpCode(HttpStatus.OK)
  async forgotRequest(@Body() registerDto: AuthLoginDto) {
    return this.authService.forgotRequest(registerDto);
  }

  @Post('confirm/forgot/request')
  @HttpCode(HttpStatus.OK)
  async confirmForgotRequest(@Body() registerDto: AuthConfirmEmailDto) {
    return this.authService.confirmForgotRequest(registerDto);
  }

  // @Post('send/notification')
  // async sendTempNotification() {
  //   return this.notify.sendMail('rajukhunt15@gmail.com', 'I am demo');
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() registerDto: AuthRegisterLoginDto) {
  //   return this.authService.update(id, registerDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
