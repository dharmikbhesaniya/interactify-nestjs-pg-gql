import { Exclude, Expose } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsUUID,
} from 'class-validator';
export class UserDto {
  @Expose({ name: 'id' })
  @IsNotEmpty()
  @IsOptional()
  @IsUUID('4', { message: 'Invalid ID format' })
  id: string;

  @Expose({ name: 'firstName' })
  firstName?: any;

  @Expose({ name: 'lastName' })
  lastName?: any;

  @IsEmail()
  // @IsNotBlank()
  // @Transform((value) => value?.trim())
  @Expose({ name: 'email' })
  email?: any;

  @IsNumberString()
  @Expose({ name: 'mobileNumber' })
  mobileNumber?: any;

  @Exclude()
  @Expose({ name: 'password' })
  password?: any;
}

// export function IsNotBlank(
//   property: string,
//   validationOptions?: ValidationOptions,
// ) {
//   return function (object: Object, propertyName: string) {
//     registerDecorator({
//       name: 'isNotBlank',
//       target: object.constructor,
//       propertyName: propertyName,
//       constraints: [property],
//       options: validationOptions,
//       validator: {
//         validate(value: any) {
//           return typeof value === 'string' && value.trim().length > 0;
//         },
//       },
//     });
//   };
// }
