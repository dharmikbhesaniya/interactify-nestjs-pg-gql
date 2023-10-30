import { UserEntity } from 'src/app/users/entities/user.entity';

export type JwtRefreshPayloadType = Pick<UserEntity, 'id'> & {
  iat: number;
  exp: number;
};
