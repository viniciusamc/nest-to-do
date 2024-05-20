export class CreateTaskDto {
  id: number;
  FkIdUser: number;
  title: string;
  description: string;
  date: Date;
  created_at: Date;
  updated_at: Date;
}
