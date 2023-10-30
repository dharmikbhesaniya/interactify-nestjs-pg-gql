import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthRegisterEntity } from './entities/auth.entity';
import { abstractRepository } from '../common/abstract/abstract.repository';

@Injectable()
export class AuthRepository extends abstractRepository<AuthRegisterEntity> {
  constructor(
    @InjectRepository(AuthRegisterEntity)
    private authRepository: Repository<AuthRegisterEntity>,
  ) {
    super(authRepository);
  }
}
