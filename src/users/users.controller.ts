import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'nest-keycloak-connect';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
@Roles({ roles: ['user', 'admin'] })
async findAll() {
  return await this.usersService.findAll();
}

@Post()
@Roles({ roles: ['admin'] })
async create(@Body() createUserDto: CreateUserDto) {
  return await this.usersService.create(createUserDto);
}

@Delete(':id')
@Roles({ roles: ['admin'] })
async delete(@Param('id') id: string) {
  return await `User with id ${id} deleted`;
}
}
