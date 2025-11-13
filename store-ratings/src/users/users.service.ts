import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Get all users (Admin only)
  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, address: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get a single user
  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, address: true, role: true },
    });
  }

  // Delete user
  async delete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
