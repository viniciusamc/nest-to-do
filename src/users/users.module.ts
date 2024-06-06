import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BullModule } from '@nestjs/bull';
import { UserProcessor } from './users.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    BullModule.registerQueue({
      name: 'user',
    }),
    UserProcessor,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, UserProcessor],
})
export class UsersModule {}
