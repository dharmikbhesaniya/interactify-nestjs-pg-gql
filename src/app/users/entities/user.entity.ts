import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumberString, IsString } from 'class-validator';
import { BaseEntity } from 'src/app/common/entitys/base.entity';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum PronounsEnum {
  'She/Her',
  'He/Him',
  'They/Them',
}

@Entity({ name: 'user-entity' })
export class UserEntity extends BaseEntity {
  constructor(id: string) {
    super();
    this.id = id;
  }

  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @IsString()
  @IsNotEmpty()
  @Column({ name: 'first_name', length: 50, nullable: false })
  firstName?: string;

  @IsString()
  @IsNotEmpty()
  @Column({ name: 'last_name', length: 50, nullable: false })
  lastName?: string;

  @Index()
  @IsEmail()
  @IsNotEmpty()
  @Column({ name: 'email', length: 50, unique: true, nullable: false })
  email?: string;

  @IsString()
  @IsNotEmpty()
  @IsNumberString()
  @Column({ name: 'mobile-number', nullable: true })
  mobileNumber?: string;

  @Exclude()
  @IsString()
  @IsNotEmpty()
  @IsNumberString()
  @Column({ name: 'password', nullable: true })
  password?: string;

  @Index()
  @IsNotEmpty()
  @Column({ length: 60, unique: true, nullable: true })
  username?: string;

  @Column({
    nullable: false,
    default: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
  })
  picture?: string;

  @Column({
    type: 'boolean',
    name: 'personalized-event',
    default: false,
  })
  personalizedEvent?: boolean;

  //   @Column({ default: AuthProvidersEnum.EMAIL })
  //   provider?: string;

  @Column({ name: 'is_verified', nullable: false, default: false })
  isVerified?: boolean;
}
