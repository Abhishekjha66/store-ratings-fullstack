import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StoresModule } from './stores/stores.module';
import { RatingsModule } from './ratings/ratings.module';

@Module({
  imports: [AuthModule, UsersModule, StoresModule, RatingsModule],
  providers: [PrismaService],
})
export class AppModule {}
