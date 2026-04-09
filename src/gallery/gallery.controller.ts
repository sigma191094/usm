import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GalleryService } from './gallery.service';
import { GalleryCategory } from './gallery.entity';

@ApiTags('Gallery')
@Controller('gallery')
export class GalleryController {
  constructor(private service: GalleryService) {}

  @Get()
  @ApiOperation({ summary: 'All gallery images' })
  findAll(@Query('category') category?: GalleryCategory) { 
    return this.service.findAll(category); 
  }

  @Get('albums')
  @ApiOperation({ summary: 'Match albums (grouped by match)' })
  findAlbums() { return this.service.findAlbums(); }

  @Get('featured')
  @ApiOperation({ summary: 'Featured images for slideshow' })
  findFeatured() { return this.service.findFeatured(); }

  @Get('match/:matchId')
  @ApiOperation({ summary: 'Images for a specific match' })
  findByMatch(@Param('matchId', ParseIntPipe) matchId: number) { 
    return this.service.findByMatch(matchId); 
  }

  @Get(':id') 
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post() 
  @ApiBearerAuth() 
  @UseGuards(AuthGuard('jwt')) 
  create(@Body() body: any) { return this.service.create(body); }

  @Put(':id') 
  @ApiBearerAuth() 
  @UseGuards(AuthGuard('jwt')) 
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.service.update(id, body); }

  @Patch(':id') 
  @ApiBearerAuth() 
  @UseGuards(AuthGuard('jwt')) 
  patch(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.service.update(id, body); }

  @Delete(':id') 
  @ApiBearerAuth() 
  @UseGuards(AuthGuard('jwt')) 
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
