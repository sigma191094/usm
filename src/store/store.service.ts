import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Order, OrderItem, OrderStatus } from './order.entity';
import { User } from '../users/user.entity';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Product) private productsRepo: Repository<Product>,
    @InjectRepository(Order) private ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemsRepo: Repository<OrderItem>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  // Products
  findAllProducts() { return this.productsRepo.find({ where: { active: true } }); }
  async findProduct(id: number) {
    const p = await this.productsRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }
  createProduct(data: Partial<Product>) { return this.productsRepo.save(this.productsRepo.create(data)); }
  async updateProduct(id: number, data: Partial<Product>) { await this.productsRepo.update(id, data); return this.findProduct(id); }
  async removeProduct(id: number) { await this.productsRepo.delete(id); return { deleted: true }; }

  // Orders
  async createOrder(userId: number, items: { productId: number; quantity: number }[], shippingAddress: string) {
    let total = 0;
    let totalPointsEarned = 0;
    const orderItems: Partial<OrderItem>[] = [];
    
    for (const item of items) {
      const product = await this.findProduct(item.productId);
      if (product.stock < item.quantity) throw new BadRequestException(`Insufficient stock for ${product.name}`);
      
      const itemPrice = Number(product.price);
      total += itemPrice * item.quantity;
      
      // Calculate points dynamically based on Sponsor Collab rewards or default
      if (product.pointsReward && product.pointsReward > 0) {
        totalPointsEarned += product.pointsReward * item.quantity;
      } else {
        totalPointsEarned += Math.floor(itemPrice / 2) * item.quantity;
      }
      
      orderItems.push({ 
        productId: product.id, 
        productName: product.name, 
        quantity: item.quantity, 
        unitPrice: itemPrice 
      });
      
      await this.productsRepo.update(product.id, { stock: product.stock - item.quantity });
    }

    const order = this.ordersRepo.create({ 
      userId, 
      total, 
      shippingAddress, 
      status: OrderStatus.CONFIRMED 
    });
    
    const saved = await this.ordersRepo.save(order);
    
    for (const item of orderItems) {
      await this.itemsRepo.save(this.itemsRepo.create({ ...item, orderId: saved.id }));
    }

    // Award points dynamically calculated
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (user) {
      user.pointsBalance += totalPointsEarned;
      await this.usersRepo.save(user);
    }

    return this.ordersRepo.findOne({ where: { id: saved.id }, relations: ['items'] });
  }

  getUserOrders(userId: number) { 
    return this.ordersRepo.find({ 
      where: { userId }, 
      relations: ['items'],
      order: { createdAt: 'DESC' } 
    }); 
  }
  getAllOrders() { return this.ordersRepo.find({ order: { createdAt: 'DESC' } }); }
  countProducts() { return this.productsRepo.count(); }
}
