import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CarrinhoService } from './carrinho.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@ApiTags('carrinho')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('carrinho')
export class CarrinhoController {
  constructor(private readonly carrinhoService: CarrinhoService) {}

  @Get()
  getCart(@Request() req: any) {
    return this.carrinhoService.getCart(req.user.sub, req.user.email);
  }

  @Post('itens')
  addItem(@Request() req: any, @Body() dto: AddItemDto) {
    return this.carrinhoService.addItem(req.user.sub, req.user.email, dto);
  }

  @Patch('itens/:id')
  updateItem(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.carrinhoService.updateItem(req.user.sub, id, dto);
  }

  @Delete('itens/:id')
  removeItem(@Request() req: any, @Param('id') id: string) {
    return this.carrinhoService.removeItem(req.user.sub, id);
  }

  @Delete()
  clearCart(@Request() req: any) {
    return this.carrinhoService.clearCart(req.user.sub, req.user.email);
  }
}
