import { IsString, MinLength } from 'class-validator';

export class ResumeFeedbackDto {
  @IsString()
  @MinLength(20)
  resumeText!: string;
}
