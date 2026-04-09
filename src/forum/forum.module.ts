import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumPost, ForumComment } from './forum.entity';
import { ForumController } from './forum.controller';
import { ForumService } from './forum.service';

@Module({
  imports: [TypeOrmModule.forFeature([ForumPost, ForumComment])],
  controllers: [ForumController],
  providers: [ForumService],
})
export class ForumModule {}
