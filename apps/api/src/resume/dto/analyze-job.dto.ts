import { IsString, MinLength } from 'class-validator';

export class AnalyzeJobDto {
  @IsString()
  @MinLength(20)
  jobDescription!: string;
}
