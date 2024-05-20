import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @HttpCode(200)
  @Post()
  create(@Body() createAuthDto: CreateAuthDto) {
    if (!createAuthDto.email) throw new HttpException('Email is required', HttpStatus.BAD_REQUEST)
    if (!createAuthDto.password) throw new HttpException('Password is required', HttpStatus.BAD_REQUEST)

    return this.authService.signIn(createAuthDto.email, createAuthDto.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }
}
