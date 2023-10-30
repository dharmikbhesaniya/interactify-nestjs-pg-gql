import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('list')
  async getAllUser() {
    return this.usersService.findAllUser();
  }

  @Get('token')
  async generateJwtToken(@Request() req) {
    const { user } = req;
    return this.usersService.generateJwtToken(user);
  }

  @Post('forgot/password')
  forgotPassword(@Request() req, @Body() createUserDto: any) {
    const { user } = req;
    return this.usersService.forgotPassword(user, createUserDto);
  }

  @Post('change/password')
  changePassword(@Request() req, @Body() createUserDto: any) {
    const { user } = req;
    return this.usersService.changePassword(user, createUserDto);
  }

  // @SerializeOptions({
  //   groups: ['admin'],
  // })
  // @Post()
  // @HttpCode(HttpStatus.CREATED)
  // create(@Body() createProfileDto: CreateUserDto): Promise<User> {
  //   return this.usersService.create(createProfileDto);
  // }

  // @SerializeOptions({
  //   groups: ['admin'],
  // })
  // @Get()
  // @HttpCode(HttpStatus.OK)
  // async findAll(
  //   @Query() query: QueryUserDto,
  // ): Promise<InfinityPaginationResultType<User>> {
  //   const page = query?.page ?? 1;
  //   let limit = query?.limit ?? 10;
  //   if (limit > 50) {
  //     limit = 50;
  //   }

  //   return infinityPagination(
  //     await this.usersService.findManyWithPagination({
  //       filterOptions: query?.filters,
  //       sortOptions: query?.sort,
  //       paginationOptions: {
  //         page,
  //         limit,
  //       },
  //     }),
  //     { page, limit },
  //   );
  // }

  // @SerializeOptions({
  //   groups: ['admin'],
  // })
  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // findOne(@Param('id') id: string): Promise<NullableType<User>> {
  //   return this.usersService.findOne({ id: +id });
  // }

  // @SerializeOptions({
  //   groups: ['admin'],
  // })
  // @Patch(':id')
  // @HttpCode(HttpStatus.OK)
  // update(
  //   @Param('id') id: number,
  //   @Body() updateProfileDto: UpdateUserDto,
  // ): Promise<User> {
  //   return this.usersService.update(id, updateProfileDto);
  // }

  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // remove(@Param('id') id: number): Promise<void> {
  //   return this.usersService.softDelete(id);
  // }
}
