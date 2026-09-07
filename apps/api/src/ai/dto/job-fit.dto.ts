import { IsString, MinLength } from 'class-validator';

export class JobFitDto {
  @IsString()
  @MinLength(20)
  resumeText!: string;

  @IsString()
  @MinLength(20)
  jobDescription!: string;
}
