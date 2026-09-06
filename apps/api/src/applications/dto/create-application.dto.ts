import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum ApplicationStatus {
  SAVED = 'SAVED',
  APPLIED = 'APPLIED',
  OA = 'OA',
  PHONE_SCREEN = 'PHONE_SCREEN',
  INTERVIEW = 'INTERVIEW',
  FINAL_INTERVIEW = 'FINAL_INTERVIEW',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export class CreateApplicationDto {
  @IsString()
  company!: string;

  @IsString()
  role!: string;

  @IsOptional()
  @IsString()
  jobUrl?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  jobType?: string;

  @IsOptional()
  @IsDateString()
  dateApplied?: string;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
