import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  // Create store (Admin only)
  async create(data: { name: string; email?: string; address?: string; ownerId?: string }) {
    return this.prisma.store.create({ data });
  }

  // Get all stores (For Users)
  async findAll() {
    const stores = await this.prisma.store.findMany({
      include: {
        ratings: true,
      },
    });

    // Add average rating calculation
    return stores.map((store) => {
      const avg =
        store.ratings.length > 0
          ? store.ratings.reduce((a, b) => a + b.score, 0) / store.ratings.length
          : 0;
      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: parseFloat(avg.toFixed(2)),
      };
    });
  }

  // Get store by ID
  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: { ratings: true },
    });

    if (!store) return null;

    const avg =
      store.ratings.length > 0
        ? store.ratings.reduce((a, b) => a + b.score, 0) / store.ratings.length
        : 0;

    return {
      ...store,
      averageRating: parseFloat(avg.toFixed(2)),
    };
  }

  // Search stores by name or address
  async search(keyword: string) {
    return this.prisma.store.findMany({
      where: {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { address: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      include: { ratings: true },
    });
  }
}
