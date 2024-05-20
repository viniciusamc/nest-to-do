import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    if (!createUserDto.name) throw new HttpException('Name is required', HttpStatus.BAD_REQUEST)
    if (!createUserDto.email) throw new HttpException('Email is required', HttpStatus.BAD_REQUEST)
    if (!createUserDto.password) throw new HttpException('Password is required', HttpStatus.BAD_REQUEST)
    if (createUserDto.password.length < 6) throw new HttpException('Password must be at least 6 characters long', HttpStatus.BAD_REQUEST);

    return this.usersService.create(createUserDto);
  }
}
