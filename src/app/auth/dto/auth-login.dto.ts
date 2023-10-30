import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class AuthLoginDto {
  @ApiProperty({ example: 'test1@example.com' })
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
