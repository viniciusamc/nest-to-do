import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
  Header,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @Post()
  @UseGuards(AuthGuard)
  @Header('Content-Type', 'application/json')
  create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
    if (!createTaskDto.title) {
      throw new HttpException('Title is required.', HttpStatus.BAD_REQUEST)
    }

    if (createTaskDto.title.length < 3) {
      throw new HttpException('The title is too short. Please make sure it is at least 3 characters long.', HttpStatus.BAD_REQUEST);
    }

    createTaskDto.FkIdUser = req.user.sub

    return this.taskService.create(createTaskDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @Header('Content-Type', 'application/json')
  findAll(@Request() req: any) {
    return this.taskService.findAll(req.user.sub);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Header('Content-Type', 'application/json')
  findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.sub
    return this.taskService.findOne(+id, userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Header('Content-Type', 'application/json')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req: any) {
    const userId = req.user.sub;
    return this.taskService.update(+id, updateTaskDto, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.sub
    return this.taskService.remove(+id, userId);
  }
}
