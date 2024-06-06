import { MailerService } from '@nestjs-modules/mailer';
import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('user')
export class UserProcessor {
  private readonly logger = new Logger(UserProcessor.name);
  constructor(private readonly mailerService: MailerService) {}

  @Process()
  async handleSendEmail(job: Job) {
    try {
      this.logger.log('starting sending email');
      await this.mailerService
        .sendMail({
          to: job.data.email,
          from: 'noreply@todo.com',
          subject: 'Olá',
          text: 'E-mail de boas vindas',
          html: `Seja bem vindo(a) ao nosso site`,
        })
        .catch((error) => {
          this.logger.error(error);
        });

      this.logger.log('email completed');
    } catch (error) {
      this.logger.error(error);
    }
  }
}
