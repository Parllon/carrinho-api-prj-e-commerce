import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateItemDto {
  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0)
  quantidade: number;
}
