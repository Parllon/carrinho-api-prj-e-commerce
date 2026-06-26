import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class CarrinhoService {
  constructor(private prisma: PrismaService) {}

  private async getOrCreateCart(usuarioId: string, email: string) {
    await this.prisma.status_carrinho.upsert({
      where: { valor: 'ATIVO' },
      create: { valor: 'ATIVO' },
      update: {},
    });

    await this.prisma.usuario.upsert({
      where: { id: usuarioId },
      create: { id: usuarioId, nome: email, email },
      update: {},
    });

    let carrinho = await this.prisma.carrinho.findFirst({
      where: { usuario_id: usuarioId, status: 'ATIVO' },
      include: { item_carrinho: { include: { produto: true } } },
    });

    if (!carrinho) {
      carrinho = await this.prisma.carrinho.create({
        data: {
          id: randomUUID(),
          usuario_id: usuarioId,
          status: 'ATIVO',
          data_atualizacao: new Date(),
        },
        include: { item_carrinho: { include: { produto: true } } },
      });
    }

    return carrinho;
  }

  async getCart(usuarioId: string, email: string) {
    return this.getOrCreateCart(usuarioId, email);
  }

  async addItem(usuarioId: string, email: string, dto: AddItemDto) {
    const carrinho = await this.getOrCreateCart(usuarioId, email);

    const produto = await this.prisma.produto.upsert({
      where: { sku: dto.produto_id },
      create: {
        id: randomUUID(),
        nome: dto.nome,
        sku: dto.produto_id,
        preco: dto.preco,
        estoque_disponivel: 999,
      },
      update: { nome: dto.nome, preco: dto.preco },
    });

    const existing = carrinho.item_carrinho.find((i) => i.produto_id === produto.id);

    if (existing) {
      return this.prisma.item_carrinho.update({
        where: { id: existing.id },
        data: { quantidade: existing.quantidade + dto.quantidade },
      });
    }

    return this.prisma.item_carrinho.create({
      data: {
        id: randomUUID(),
        carrinho_id: carrinho.id,
        produto_id: produto.id,
        quantidade: dto.quantidade,
        preco_unitario: dto.preco,
      },
    });
  }

  async updateItem(usuarioId: string, itemId: string, dto: UpdateItemDto) {
    const item = await this.prisma.item_carrinho.findUnique({
      where: { id: itemId },
      include: { carrinho: true },
    });

    if (!item) throw new NotFoundException('Item não encontrado.');
    if (item.carrinho.usuario_id !== usuarioId) throw new ForbiddenException('Acesso negado.');

    if (dto.quantidade <= 0) {
      await this.prisma.item_carrinho.delete({ where: { id: itemId } });
      return { removed: true };
    }

    return this.prisma.item_carrinho.update({
      where: { id: itemId },
      data: { quantidade: dto.quantidade },
    });
  }

  async removeItem(usuarioId: string, itemId: string) {
    const item = await this.prisma.item_carrinho.findUnique({
      where: { id: itemId },
      include: { carrinho: true },
    });

    if (!item) throw new NotFoundException('Item não encontrado.');
    if (item.carrinho.usuario_id !== usuarioId) throw new ForbiddenException('Acesso negado.');

    await this.prisma.item_carrinho.delete({ where: { id: itemId } });
    return { removed: true };
  }

  async clearCart(usuarioId: string, email: string) {
    const carrinho = await this.prisma.carrinho.findFirst({
      where: { usuario_id: usuarioId, status: 'ATIVO' },
    });

    if (!carrinho) return { cleared: true };

    await this.prisma.item_carrinho.deleteMany({
      where: { carrinho_id: carrinho.id },
    });

    return { cleared: true };
  }
}
