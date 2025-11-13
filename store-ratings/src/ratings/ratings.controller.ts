import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { RatingsService } from './ratings.service';

@Controller('ratings')
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Post()
  async rateStore(@Body() body: { storeId: string; userId: string; score: number }) {
    return this.ratingsService.rateStore(body.storeId, body.userId, body.score);
  }

  @Get()
  async getAllRatings() {
    return this.ratingsService.getAllRatings();
  }

  @Get('store/:id')
  async getRatingsByStore(@Param('id') id: string) {
    return this.ratingsService.getRatingsByStore(id);
  }

  @Get('count')
  async countRatings() {
    return this.ratingsService.countRatings();
  }
}
