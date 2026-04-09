import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { StoreService } from './store.service';

@ApiTags('Store')
@Controller('store')
export class StoreController {
  constructor(private service: StoreService) {}

  @Get('products') findAll() { return this.service.findAllProducts(); }
  @Get('products/:id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findProduct(id); }

  @Post('products') @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  createProduct(@Body() body: any) { return this.service.createProduct(body); }

  @Put('products/:id') @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.service.updateProduct(id, body); }

  @Delete('products/:id') @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  removeProduct(@Param('id', ParseIntPipe) id: number) { return this.service.removeProduct(id); }

  @Post('orders') @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Place an order' })
  createOrder(@Request() req, @Body() body: { items: { productId: number; quantity: number }[]; shippingAddress: string }) {
    return this.service.createOrder(req.user.id, body.items, body.shippingAddress);
  }

  @Get('orders/me') @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'My orders' })
  myOrders(@Request() req) { return this.service.getUserOrders(req.user.id); }

  @Get('orders') @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'All orders (admin)' })
  allOrders() { return this.service.getAllOrders(); }
}
