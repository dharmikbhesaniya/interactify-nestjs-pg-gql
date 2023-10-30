import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import ms from 'ms';
import * as speakeasy from 'speakeasy';
import { UsersService } from 'src/app/users/users.service';
import { AllConfigType } from 'src/config/config.type';
import { UserEntity } from '../users/entities/user.entity';
import { AuthRepository } from './auth.repository';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { AuthValidateEmailDto } from './dto/auth-validate-email.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<AllConfigType>,
    private readonly userService: UsersService,
    private readonly authRepository: AuthRepository,
  ) {}

  async validateEmail(authDto: AuthValidateEmailDto) {
    const { email } = authDto;
    console.log('authDto', authDto);

    const result = await this.authRepository.findOneBy({ email });

    if (result) {
      throw new BadRequestException(`You already have account`);
    }

    const { base32: secret } = speakeasy.generateSecret({ length: 20 });
    const token = speakeasy.totp({
      secret,
      encoding: 'base32',
    });

    const currentTime = new Date();
    const newTime = new Date(currentTime.getTime() + 5 * 60000);

    try {
      await this.authRepository.save({
        token,
        email,
        secret,
        expireAt: newTime,
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to save auth details: ${error?.message}`,
      );
    }

    return {
      otp: token,
      isUserExist: false,
      message: 'OTP has been sent to your registered email address.',
    };
  }

  async confirmEmail(confirmEmailDto: AuthConfirmEmailDto) {
    const user = await this.authRepository.findOneBy({
      email: confirmEmailDto.email,
    });

    if (!user) {
      throw new HttpException(
        'Sorry, the email address you entered is not valid.',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const tokenValidates = speakeasy.totp.verify({
      secret: user.secret,
      encoding: 'base32',
      token: confirmEmailDto.otp,
      window: 30,
    });

    if (!tokenValidates) {
      throw new HttpException(
        'Sorry, the OTP you entered is not valid. please check and try again.',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const currentTime = new Date();
    const date = user.expireAt?.getTime() as number;
    const diffInMs = Math.abs(currentTime.getTime() - date);

    if (diffInMs > 0) {
      user.isVerified = true;
      await this.authRepository.save(user);
    } else {
      const errorData = `OTP you received has expired and is no longer valid.`;
      throw new BadRequestException(errorData);
    }

    return HttpStatus.ACCEPTED;
  }

  async register(registerDto: AuthRegisterLoginDto) {
    const authUser = await this.authRepository.findOneBy({
      email: registerDto?.email,
    });

    if (!authUser) {
      const errorData = 'Sorry, the email address you entered is not valid.';
      throw new BadRequestException(errorData);
    }

    if (!authUser.isVerified) {
      const errorData = 'Sorry, your OTP has not been verified yet';
      throw new BadRequestException(errorData);
    }

    let user: UserEntity | null = await this.findUserByEmailInUser(
      registerDto?.email,
    );

    const username = await this.generateUsername(registerDto?.email);
    const finalUserName = user?.username || username;

    if (user) {
      throw new HttpException(
        'You are already registered',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashPassword = await bcrypt.hash(
      registerDto.password,
      await bcrypt.genSalt(12),
    );

    const userDto: UserEntity = {
      isVerified: true,
      ...registerDto,
      password: hashPassword,
      username: finalUserName,
      createdBy: 'SYSTEM',
      updatedBy: registerDto.email,
    };
    user = await this.userService.createUser(userDto);

    const token = await this.userService.generateJwtToken(user);

    return { ...user, token };
  }

  async login(loginDto: AuthLoginDto) {
    const user: UserEntity = await this.userService.findUserByEmail(
      loginDto?.email,
    );

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user?.password as string,
    );
    if (!isValidPassword)
      throw new HttpException(
        'Your password was incorrect',
        HttpStatus.UNAUTHORIZED,
      );

    const token = await this.getTokensData({ id: user?.id as string });

    return { ...user, token };
  }

  async forgotRequest(authDto: AuthValidateEmailDto) {
    const { email } = authDto;

    const result = await this.authRepository.findOneBy({ email });
    if (!result) {
      throw new BadRequestException(`You don't have account`);
    }

    const user: UserEntity = await this.userService.findUserByEmail(
      result?.email,
    );
    if (!user) {
      throw new BadRequestException(`You don't have account`);
    }

    // const { base32: secret } = speakeasy.generateSecret({ length: 20 });
    const token = speakeasy.totp({
      secret: result.secret,
      encoding: 'base32',
    });

    const currentTime = new Date();
    const newTime = new Date(currentTime.getTime() + 5 * 60000);

    try {
      await this.authRepository.save({
        token,
        email,
        expireAt: newTime,
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to save auth details: ${error?.message}`,
      );
    }

    return {
      otp: token,
      isUserExist: false,
      message: 'OTP has been sent to your registered email address.',
    };
  }

  async confirmForgotRequest(confirmEmailDto: AuthConfirmEmailDto) {
    const user = await this.authRepository.findOneBy({
      email: confirmEmailDto.email,
    });

    if (!user) {
      throw new HttpException(
        'Sorry, the email address you entered is not valid.',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const tokenValidates = speakeasy.totp.verify({
      secret: user.secret,
      encoding: 'base32',
      token: confirmEmailDto.otp,
      window: 30,
    });

    if (!tokenValidates) {
      throw new HttpException(
        'Sorry, the OTP you entered is not valid. please check and try again.',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const currentTime = new Date();
    const date = user.expireAt?.getTime() as number;
    const diffInMs = Math.abs(currentTime.getTime() - date);

    if (diffInMs > 0) {
      user.isVerified = true;
      await this.authRepository.save(user);
    } else {
      const errorData = `OTP you received has expired and is no longer valid.`;
      throw new BadRequestException(errorData);
    }

    if (!(await this.findUserByEmailInUser(user?.email))) {
      throw new HttpException(
        `You Don't have permission to change password`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.userService.generateJwtToken(user);
  }

  private async getTokensData(data: { id: string }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [accessToken, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        {
          id: data.id,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenExpires,
      token_type: 'Bearer',
    };
  }

  private generateUsername(email) {
    const username = email.split('@')[0];
    const randomString = Math.random().toString(36).substring(2, 8);
    const uniqueUsername = username + '_' + randomString;
    return uniqueUsername;
  }

  private async findUserByEmailInUser(email) {
    try {
      const user = await this.userService.findUserByEmail(email);
      return user;
    } catch (error) {
      return null;
    }
  }
}

// async forgotPassword(email: string): Promise<void> {
//     const user = await this.usersService.findOne({
//       email,
//     });

//     if (!user) {
//       throw new HttpException(
//         {
//           status: HttpStatus.UNPROCESSABLE_ENTITY,
//           errors: {
//             email: 'emailNotExists',
//           },
//         },
//         HttpStatus.UNPROCESSABLE_ENTITY,
//       );
//     }

//     const hash = crypto
//       .createHash('sha256')
//       .update(randomStringGenerator())
//       .digest('hex');
//     await this.forgotService.create({
//       hash,
//       user,
//     });
//   }

//   async resetPassword(hash: string, password: string): Promise<void> {
//     const forgot = await this.forgotService.findOne({
//       where: {
//         hash,
//       },
//     });

//     if (!forgot) {
//       throw new HttpException(
//         {
//           status: HttpStatus.UNPROCESSABLE_ENTITY,
//           errors: {
//             hash: `notFound`,
//           },
//         },
//         HttpStatus.UNPROCESSABLE_ENTITY,
//       );
//     }

//     const user = forgot.user;
//     user.password = password;

//     await this.sessionService.softDelete({
//       user: {
//         id: user.id,
//       },
//     });
//     await user.save();
//     await this.forgotService.softDelete(forgot.id);
//   }

//   // async me(userJwtPayload: JwtPayloadType): Promise<NullableType<User>> {
//   //   return this.usersService.findOne({
//   //     id: userJwtPayload.id,
//   //   });
//   // }

//   async update(
//     userJwtPayload: JwtPayloadType,
//     userDto: AuthUpdateDto,
//   ): Promise<NullableType<User>> {
//     if (userDto.password) {
//       if (userDto.oldPassword) {
//         const currentUser = await this.usersService.findOne({
//           id: userJwtPayload.id,
//         });

//         if (!currentUser) {
//           throw new HttpException(
//             {
//               status: HttpStatus.UNPROCESSABLE_ENTITY,
//               errors: {
//                 user: 'userNotFound',
//               },
//             },
//             HttpStatus.UNPROCESSABLE_ENTITY,
//           );
//         }

//         const isValidOldPassword = await bcrypt.compare(
//           userDto.oldPassword,
//           currentUser.password,
//         );

//         if (!isValidOldPassword) {
//           throw new HttpException(
//             {
//               status: HttpStatus.UNPROCESSABLE_ENTITY,
//               errors: {
//                 oldPassword: 'incorrectOldPassword',
//               },
//             },
//             HttpStatus.UNPROCESSABLE_ENTITY,
//           );
//         } else {
//           await this.sessionService.softDelete({
//             user: {
//               id: currentUser.id,
//             },
//             excludeId: userJwtPayload.sessionId,
//           });
//         }
//       } else {
//         throw new HttpException(
//           {
//             status: HttpStatus.UNPROCESSABLE_ENTITY,
//             errors: {
//               oldPassword: 'missingOldPassword',
//             },
//           },
//           HttpStatus.UNPROCESSABLE_ENTITY,
//         );
//       }
//     }

//     await this.usersService.update(userJwtPayload.id, userDto);

//     return this.usersService.findOne({
//       id: userJwtPayload.id,
//     });
//   }

//   async refreshToken(
//     data: Pick<JwtRefreshPayloadType, 'sessionId'>,
//   ): Promise<Omit<LoginResponseType, 'user'>> {
//     const session = await this.sessionService.findOne({
//       where: {
//         id: data.sessionId,
//       },
//     });

//     if (!session) {
//       throw new UnauthorizedException();
//     }

//     const { token, refreshToken, tokenExpires } = await this.getTokensData({
//       id: 'session.user.id',
//     });

//     return {
//       token,
//       refreshToken,
//       tokenExpires,
//     };
//   }

//   async logout(data: Pick<JwtRefreshPayloadType, 'sessionId'>) {
//     return this.sessionService.softDelete({
//       id: data.sessionId,
//     });
//   }
