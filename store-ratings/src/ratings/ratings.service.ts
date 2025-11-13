import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  // ✅ Create or update a rating
  async rateStore(storeId: string, userId: string, score: number) {
    // Check if store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Create or update rating
    const rating = await this.prisma.rating.upsert({
      where: {
        userId_storeId: { userId, storeId },
      },
      update: { score },
      create: { userId, storeId, score },
    });

    return rating;
  }

  // ✅ Get all ratings
  async getAllRatings() {
    return this.prisma.rating.findMany();
  }

  // ✅ Get ratings by store
  async getRatingsByStore(storeId: string) {
    return this.prisma.rating.findMany({
      where: { storeId },
    });
  }

  // ✅ Count total ratings
  async countRatings() {
    return this.prisma.rating.count();
  }
}
