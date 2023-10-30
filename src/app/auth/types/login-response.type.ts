import { UserEntity } from 'src/app/users/entities/user.entity';

export type LoginResponseType = Readonly<
  UserEntity & {
    token: {
      accessToken: string;
      refreshToken: string;
      tokenExpires: number;
      token_type: string;
    };
  }
>;
