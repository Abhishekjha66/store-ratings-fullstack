import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { StoresService } from './stores.service';

@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) {}

  // POST /stores - add store (for admin)
  @Post()
  createStore(@Body() body: { name: string; email?: string; address?: string; ownerId?: string }) {
    return this.storesService.create(body);
  }

  // GET /stores - list all stores
  @Get()
  getStores() {
    return this.storesService.findAll();
  }

  // GET /stores/search?q=...
  @Get('search')
  search(@Query('q') q: string) {
    return this.storesService.search(q);
  }

  // GET /stores/:id
  @Get(':id')
  getStore(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }
}
