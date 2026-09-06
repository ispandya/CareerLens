import { IsString, MinLength } from 'class-validator';

export class UploadResumeDto {
  @IsString()
  @MinLength(20)
  text!: string;
}
