import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateInterviewDto {
  @IsString()
  round!: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
