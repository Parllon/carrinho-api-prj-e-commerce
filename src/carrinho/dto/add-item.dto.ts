import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class AddItemDto {
  @ApiProperty({ example: '1', description: 'ID do produto no catálogo (Fábio)' })
  @IsString()
  produto_id: string;

  @ApiProperty({ example: 'Flamengo Home 2025' })
  @IsString()
  nome: string;

  @ApiProperty({ example: 349.9 })
  @IsNumber()
  preco: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantidade: number;
}
