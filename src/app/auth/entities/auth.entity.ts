import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

@Entity({ name: 'auth-register-entity' })
export class AuthRegisterEntity {
  @IsEmail()
  @PrimaryColumn()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @Column({ nullable: true })
  token?: string;

  @Column({ name: 'is_verified', nullable: false, default: false })
  isVerified?: boolean;

  @Column({ nullable: true })
  secret?: string;

  @VersionColumn()
  version?: number;

  @Column({ name: 'expire_at', nullable: true, type: 'timestamptz' })
  expireAt?: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt?: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date;
}
