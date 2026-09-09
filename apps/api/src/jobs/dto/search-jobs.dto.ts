import { IsString, MinLength, IsOptional } from 'class-validator';

export class SearchJobsDto {
  @IsString()
  @MinLength(2)
  what!: string;

  @IsOptional()
  @IsString()
  where?: string;

  @IsOptional()
  @IsString()
  country?: string;
}
