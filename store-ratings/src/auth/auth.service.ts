import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  // SIGNUP (for Normal Users)
  async signup(dto: { name: string; email: string; address?: string; password: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new UnauthorizedException('Email already exists');

    // Validations
    if (dto.name.length < 2 || dto.name.length > 60)
  throw new UnauthorizedException('Name must be between 2 and 60 characters');
    if (dto.password.length < 8 || dto.password.length > 16)
      throw new UnauthorizedException('Password must be between 8 and 16 characters');
    if (!/(?=.*[A-Z])(?=.*[^A-Za-z0-9])/.test(dto.password))
      throw new UnauthorizedException('Password must include an uppercase and a special character');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash, address: dto.address },
    });

    return { message: 'User registered successfully', user: { id: user.id, email: user.email } };
  }

  // LOGIN
  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwt.sign(payload);

    return {
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
