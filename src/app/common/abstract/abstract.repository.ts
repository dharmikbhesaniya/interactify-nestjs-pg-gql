import { Injectable } from '@nestjs/common';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Injectable()
export abstract class abstractRepository<TDocument extends AbstractEntity> {
  constructor(protected repository: Repository<TDocument>) {}

  async findAllUser(): Promise<TDocument[]> {
    return await this.repository.find();
  }

  async findBy(
    where: FindOptionsWhere<TDocument> | FindOptionsWhere<TDocument>[],
  ): Promise<TDocument[]> {
    return await this.repository.findBy(where);
  }

  async findOne(options: FindOneOptions<TDocument>): Promise<any> {
    return await this.repository.findOne(options);
  }

  async findOneBy(where: FindOptionsWhere<TDocument>): Promise<any> {
    return await this.repository.findOneBy(where);
  }

  async save(user: TDocument): Promise<TDocument> {
    return await this.repository.save(user);
  }
}
