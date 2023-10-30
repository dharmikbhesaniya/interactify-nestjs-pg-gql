import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';

/* tslint:disable no-var-requires */
const jwt = require('jsonwebtoken');

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UsersRepository) {}

  async findAllUser() {
    const result = await this.userRepository.findAllUser();
    return result;
  }

  async findUserByEmail(email: string) {
    if (!email)
      throw new HttpException(
        'Were sorry, but the email field cannot be left blank.',
        HttpStatus.NOT_FOUND,
      );

    const user = await this.userRepository.findOneBy({ email });

    if (user) return user;
    else
      throw new HttpException(
        'User account not found for the provided email address. ',
        HttpStatus.NOT_FOUND,
      );
  }

  async createUser(user: UserEntity) {
    try {
      return await this.userRepository.save(user);
    } catch (error) {
      let message = 'Error saving user.';

      if (error.code === '23505') {
        // Unique constraint violation error
        message = 'The user already exists.';
      } else if (error.code === 'XYZ') {
        // Handle other specific error codes, if applicable
        message = 'Specific error message XYZ.';
      }

      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  async generateJwtToken(user: UserEntity) {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;

    const data = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const token = await jwt.sign({ ...data }, jwtSecretKey, {
      expiresIn: '24h',
    });

    return { access_token: token, expiresIn: '24h', token_type: 'Bearer' };
  }

  async forgotPassword(user: UserEntity, dto) {
    if (dto.password !== dto.confirmPassword)
      throw new HttpException(
        'Both password are not same. ',
        HttpStatus.UNAUTHORIZED,
      );

    if (user.email !== dto.email)
      throw new HttpException(
        'You are not authorize for cheng password',
        HttpStatus.UNAUTHORIZED,
      );

    const hashPassword = await bcrypt.hash(
      dto.password,
      await bcrypt.genSalt(12),
    );

    try {
      await this.userRepository.updateOnlyOneColumnName(
        user.id,
        'password',
        hashPassword,
      );
      return { message: 'Your password change successfully' };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async changePassword(user: UserEntity, dto) {
    if (dto.password !== dto.confirmPassword)
      throw new HttpException(
        'Both password are not same. ',
        HttpStatus.UNAUTHORIZED,
      );

    const isValidPassword = await bcrypt.compare(dto.password, user.password);
    if (!isValidPassword)
      throw new HttpException(
        'Your password was incorrect',
        HttpStatus.UNAUTHORIZED,
      );

    const hashPassword = await bcrypt.hash(
      dto.newPassword,
      await bcrypt.genSalt(12),
    );

    try {
      await this.userRepository.updateOnlyOneColumnName(
        user.id,
        'password',
        hashPassword,
      );
      return { message: 'Your password change successfully' };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async userSyncProcess(userInfo: any) {
    return this.findUserByEmail(userInfo.email);
  }

  // async softDelete(user: UserEntity): Promise<void> {
  //   await this.usersService.softDelete(user.id);
  // }

  // create(createProfileDto: CreateUserDto): Promise<User> {
  //   return this.usersRepository.save(
  //     this.usersRepository.create(createProfileDto),
  //   );
  // }

  // findManyWithPagination({
  //   filterOptions,
  //   sortOptions,
  //   paginationOptions,
  // }: {
  //   filterOptions?: FilterUserDto | null;
  //   sortOptions?: SortUserDto[] | null;
  //   paginationOptions: IPaginationOptions;
  // }): Promise<User[]> {
  //   const where: FindOptionsWhere<User> = {};
  //   if (filterOptions?.roles?.length) {
  //     where.role = filterOptions.roles.map((role) => ({
  //       id: role.id,
  //     }));
  //   }

  //   return this.usersRepository.find({
  //     skip: (paginationOptions.page - 1) * paginationOptions.limit,
  //     take: paginationOptions.limit,
  //     where: where,
  //     order: sortOptions?.reduce(
  //       (accumulator, sort) => ({
  //         ...accumulator,
  //         [sort.orderBy]: sort.order,
  //       }),
  //       {},
  //     ),
  //   });
  // }

  // findOne(fields: EntityCondition<User>): Promise<NullableType<User>> {
  //   return this.usersRepository.findOne({
  //     where: fields,
  //   });
  // }

  // update(id: User['id'], payload: DeepPartial<User>): Promise<User> {
  //   return this.usersRepository.save(
  //     this.usersRepository.create({
  //       id,
  //       ...payload,
  //     }),
  //   );
  // }

  // async softDelete(id: User['id']): Promise<void> {
  //   await this.usersRepository.softDelete(id);
  // }
}
