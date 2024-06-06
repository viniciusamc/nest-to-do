import { MailerService } from '@nestjs-modules/mailer';
import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { TaskService } from './task.service';

@Processor('task')
export class TaskProcessor {
  private readonly logger = new Logger(TaskProcessor.name);
  constructor(
    private readonly mailerService: MailerService,
    private readonly taskService: TaskService,
  ) {}

  @Process()
  async handleReport(job: Job) {
    try {
      this.logger.log('starting report');
      const report = await this.taskService.report();

      await this.mailerService
        .sendMail({
          to: job.data.email,
          from: 'noreply@todo.com',
          subject: '5 MINUTES REPORT',
          text: '5 MINUTES REPORT',
          html: `TOTAL USERS ${report.users}</BR> TOTAL TASKS ${report.tasks}`,
        })
        .catch((error) => {
          this.logger.error(error);
        });

      this.logger.log('report completed');
    } catch (error) {
      this.logger.error(error);
    }
  }
}
