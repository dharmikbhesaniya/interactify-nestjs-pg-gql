import { UserEntity } from '../../../users/entities/user.entity';

export type JwtPayloadType = Pick<UserEntity, 'id'> & {
  iat: number;
  exp: number;
};
