import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NewsService } from './news.service';
import { NewsCategory } from './news.entity';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private service: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all news' })
  @ApiQuery({ name: 'category', required: false, enum: NewsCategory })
  findAll(@Query('category') category?: NewsCategory) { return this.service.findAll(category); }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get comments for a news article' })
  getComments(@Param('id', ParseIntPipe) id: number) { return this.service.getComments(id); }

  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post(':id/comments')
  @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Add comment to a news article' })
  addComment(@Param('id', ParseIntPipe) id: number, @Body() body: { content: string }, @Request() req: any) {
    const authorName = req.user?.name || req.user?.email || 'Supporter';
    return this.service.addComment(req.user.id, authorName, id, body.content);
  }

  @Post() @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  create(@Body() body: any) { return this.service.create(body); }

  @Put(':id') @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.service.update(id, body); }

  @Delete(':id') @ApiBearerAuth() @UseGuards(AuthGuard('jwt'))
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}

