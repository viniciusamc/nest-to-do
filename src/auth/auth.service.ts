import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user.length === 0)
      throw new HttpException(
        'No account is associated with this email address. Please verify your entry or create a new account.',
        HttpStatus.NOT_FOUND,
      );

    const verifyPassword = await bcrypt.compare(password, user[0].password);

    if (!verifyPassword)
      throw new HttpException(
        'The password you entered is invalid. Please try again.',
        HttpStatus.NOT_FOUND,
      );

    const payload = { sub: user[0].id };

    return {
      token: await this.jwtService.signAsync(payload),
    };
  }
}
