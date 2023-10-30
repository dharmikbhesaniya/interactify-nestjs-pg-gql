// import {
//   HttpException,
//   HttpStatus,
//   Injectable,
//   NestMiddleware,
//   UnauthorizedException,
// } from '@nestjs/common';
// import jwtDecode from 'jwt-decode';
// import { NextFunction } from 'express';
// import { UsersService } from 'src/app/users/users.service';

// @Injectable()
// export class AuthMiddleware implements NestMiddleware {
//   constructor(private readonly usersService: UsersService) {}

//   async use(req: Request, res: Response, next: NextFunction) {
//     try {
//       const authHeaders = req.headers['authorization'];
//       if (!authHeaders) {
//         throw new UnauthorizedException(
//           'Access denied. Authorization header not found.',
//         );
//       }

//       const token = authHeaders.split(' ')[1];
//       if (!token) {
//         throw new UnauthorizedException(
//           'Access denied. Please log in to continue.',
//         );
//       }

//       const decoded = jwtDecode(token) as { exp: number };

//       // if (Date.now() >= decoded.exp * 1000) {
//       //   throw new UnauthorizedException(
//       //     'your session token has expired. Please log in again to continue.',
//       //   );
//       // }

//       //! need to work on it
//       req['user'] = await this.usersService.userSyncProcess(decoded);
//       next();
//     } catch (error) {
//       next(new HttpException(error.message, HttpStatus.UNAUTHORIZED));
//     }
//   }
// }

// /* eslint-disable prettier/prettier */
