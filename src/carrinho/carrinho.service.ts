import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class CarrinhoService {
  constructor(private prisma: PrismaService) {}

  private async getOrCreateCart(usuarioId: string) {
    let carrinho = await this.prisma.carrinho.findFirst({
      where: { usuario_id: usuarioId },
      include: { itens: true },
    });

    if (!carrinho) {
      carrinho = await this.prisma.carrinho.create({
        data: { usuario_id: usuarioId },
        include: { itens: true },
      });
    }

    return carrinho;
  }

  async getCart(usuarioId: string) {
    return this.getOrCreateCart(usuarioId);
  }

  async addItem(usuarioId: string, dto: AddItemDto) {
    const carrinho = await this.getOrCreateCart(usuarioId);

    const existing = carrinho.itens.find(
      (i) => i.produto_id === dto.produto_id && i.tamanho === dto.tamanho,
    );

    if (existing) {
      return this.prisma.itemCarrinho.update({
        where: { id: existing.id },
        data: { quantidade: existing.quantidade + dto.quantidade },
      });
    }

    return this.prisma.itemCarrinho.create({
      data: {
        carrinho_id: carrinho.id,
        produto_id: dto.produto_id,
        nome_produto: dto.nome_produto,
        preco_unitario: dto.preco_unitario,
        tamanho: dto.tamanho,
        quantidade: dto.quantidade,
        url_imagem: dto.url_imagem ?? null,
      },
    });
  }

  async updateItem(usuarioId: string, itemId: number, dto: UpdateItemDto) {
    const item = await this.prisma.itemCarrinho.findUnique({
      where: { id: itemId },
      include: { carrinho: true },
    });

    if (!item) throw new NotFoundException('Item não encontrado.');
    if (item.carrinho.usuario_id !== usuarioId) throw new ForbiddenException('Acesso negado.');

    if (dto.quantidade <= 0) {
      await this.prisma.itemCarrinho.delete({ where: { id: itemId } });
      return { removed: true };
    }

    return this.prisma.itemCarrinho.update({
      where: { id: itemId },
      data: { quantidade: dto.quantidade },
    });
  }

  async removeItem(usuarioId: string, itemId: number) {
    const item = await this.prisma.itemCarrinho.findUnique({
      where: { id: itemId },
      include: { carrinho: true },
    });

    if (!item) throw new NotFoundException('Item não encontrado.');
    if (item.carrinho.usuario_id !== usuarioId) throw new ForbiddenException('Acesso negado.');

    await this.prisma.itemCarrinho.delete({ where: { id: itemId } });
    return { removed: true };
  }

  async clearCart(usuarioId: string) {
    const carrinho = await this.prisma.carrinho.findFirst({
      where: { usuario_id: usuarioId },
    });

    if (!carrinho) return { cleared: true };

    await this.prisma.itemCarrinho.deleteMany({
      where: { carrinho_id: carrinho.id },
    });

    return { cleared: true };
  }
}
