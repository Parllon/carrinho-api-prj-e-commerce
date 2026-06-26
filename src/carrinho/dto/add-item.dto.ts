import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AddItemDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  produto_id: number;

  @ApiProperty({ example: 'Flamengo Home 2025' })
  @IsString()
  nome_produto: string;

  @ApiProperty({ example: 349.9 })
  @IsNumber()
  preco_unitario: number;

  @ApiProperty({ enum: ['P', 'M', 'G', 'GG'] })
  @IsString()
  @IsIn(['P', 'M', 'G', 'GG'])
  tamanho: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantidade: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  url_imagem?: string;
}
