import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { abstractRepository } from '../common/abstract/abstract.repository';

@Injectable()
export class UsersRepository extends abstractRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {
    super(userRepository);
  }

  public async changeProfilePicture(id, picture) {
    await this.userRepository
      .createQueryBuilder()
      .update(UserEntity)
      .set({
        picture,
      })
      .where(`id = :id`, { id })
      .execute();
  }

  public async updateOnlyOneColumnName(userId, columnName, val) {
    await this.userRepository
      .createQueryBuilder()
      .update(UserEntity)
      .set({
        columnName: val,
      })
      .where(`id = :id`, { userId })
      .execute();
  }
}
