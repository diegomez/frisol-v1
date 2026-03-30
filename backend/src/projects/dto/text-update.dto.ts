import { IsString } from 'class-validator';

export class TextUpdateDto {
  @IsString()
  value: string;
}
