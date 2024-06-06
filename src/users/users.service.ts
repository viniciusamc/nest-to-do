import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class UsersService {
  constructor(
    private dataSource: DataSource,
    @InjectQueue('user') private userQueue: Queue,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const verifyUser = await queryRunner.query(
      'SELECT * FROM users WHERE email = $1',
      [createUserDto.email],
    );

    if (verifyUser[0]) {
      await queryRunner.release();
      throw new HttpException(
        'This email address is already registered. Please use a different email or log in',
        HttpStatus.CONFLICT,
      );
    }

    const password_hashed = await bcrypt.hash(createUserDto.password, 12);

    await queryRunner.query(
      'INSERT INTO users(name, email, password) VALUES($1,$2,$3) RETURNING id',
      [createUserDto.name, createUserDto.email, password_hashed],
    );

    await queryRunner.commitTransaction();

    await queryRunner.release();

    await this.userQueue.add(
      {
        email: createUserDto.email,
      },
      {
        attempts: 5,
      },
    );

    return 'See your email';
  }

  async findOne(email: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const user = await queryRunner.query(
      'SELECT * from users WHERE email = $1',
      [email],
    );

    await queryRunner.release();

    return user;
  }
}
