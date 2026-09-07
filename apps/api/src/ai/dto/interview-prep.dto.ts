import { IsString, MinLength } from 'class-validator';

export class InterviewPrepDto {
  @IsString()
  @MinLength(20)
  jobDescription!: string;

  @IsString()
  @MinLength(20)
  resumeText!: string;
}
