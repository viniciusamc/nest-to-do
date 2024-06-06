import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Queue } from 'bull';
import { DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { ReportTaskDto } from './dto/report-task.dto';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private dataSource: DataSource,
    @InjectQueue('task') private taskQueue: Queue,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const idtask = await queryRunner.query(
        'INSERT INTO tasks(fk_id_user, title, description, date) VALUES ($1, $2, $3, $4) RETURNING id',
        [
          createTaskDto.FkIdUser,
          createTaskDto.title,
          createTaskDto.description,
          createTaskDto.date,
        ],
      );

      await this.cacheManager.del(`tasks:${createTaskDto.FkIdUser}`);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return idtask;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return error;
    }
  }

  async findAll(userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    const cachedItem = await this.cacheManager.get(`tasks:${userId}`);
    if (cachedItem) {
      return cachedItem;
    }

    try {
      await queryRunner.connect();
      const tasks = await queryRunner.query(
        'SELECT * FROM tasks WHERE fk_id_user = $1 ORDER BY id',
        [userId],
      );

      await this.cacheManager.set(`tasks:${userId}`, JSON.stringify(tasks), 0);

      await queryRunner.release();

      return tasks;
    } catch (error) {
      await queryRunner.release();
      return error;
    }
  }

  async findOne(id: number, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    const cachedItem = await this.cacheManager.get<string>(`tasks:${userId}`);
    if (cachedItem) {
      const taskParsed = JSON.parse(cachedItem);

      const task = taskParsed.find((task) => task.id === id);

      if (!task)
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);

      return task;
    }

    try {
      await queryRunner.connect();

      const task = await queryRunner.query(
        'SELECT * FROM tasks WHERE id = $1 AND fk_id_user = $2',
        [id, userId],
      );

      await queryRunner.release();

      return task;
    } catch (error) {
      await queryRunner.release();
      return error;
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const task = await queryRunner.query(
        'SELECT * FROM tasks WHERE id = $1 AND fk_id_user = $2',
        [id, userId],
      );

      const newTask: UpdateTaskDto = {
        title: updateTaskDto.title || task[0].title,
        description: updateTaskDto.description || task[0].description,
        date: updateTaskDto.date || task[0].date,
      };

      await queryRunner.query(
        'UPDATE tasks SET title = $1, description = $2, date = $3, updated_at = now() WHERE id = $4 AND fk_id_user = $5',
        [newTask.title, newTask.description, newTask.date, id, userId],
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      await this.cacheManager.del(`tasks:${userId}`);

      return newTask;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return error;
    }
  }

  async remove(id: number, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const verifyTask = await queryRunner.query(
        'SELECT * FROM tasks WHERE id = $1 AND fk_id_user = $2',
        [id, userId],
      );

      if (verifyTask.length === 0)
        throw new HttpException('Task not found.', HttpStatus.NOT_FOUND);

      const deleteTask = await queryRunner.query(
        'DELETE FROM tasks WHERE id = $1 AND fk_id_user = $2',
        [id, userId],
      );

      await this.cacheManager.del(`tasks:${userId}`);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return deleteTask;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      return error;
    }
  }

  async getCache(userId: number) {
    const cachedItem = await this.cacheManager.get<string>(`tasks:${userId}`);
    if (cachedItem) {
      const taskParsed = JSON.parse(cachedItem);

      return taskParsed;
    }

    return false;
  }

  async report() {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      const reportUsers = await queryRunner.query(
        'SELECT COUNT(id) FROM users',
      );
      const reportTasks = await queryRunner.query(
        'SELECT COUNT(id) FROM tasks',
      );

      const reportData: ReportTaskDto = {
        users: parseInt(reportUsers[0].count),
        tasks: parseInt(reportTasks[0].count),
      };

      await queryRunner.release();

      return reportData;
    } catch (error) {
      await queryRunner.release();
      console.log(error);
      return error;
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    await this.taskQueue.add(
      {
        email: 'task@task.com',
      },
      {
        attempts: 3,
      },
    );
  }
}
