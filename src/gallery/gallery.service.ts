import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gallery, GalleryCategory } from './gallery.entity';

@Injectable()
export class GalleryService {
  constructor(@InjectRepository(Gallery) private repo: Repository<Gallery>) {}

  findAll(category?: GalleryCategory) {
    if (category) return this.repo.find({ where: { category }, order: { createdAt: 'DESC' } });
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  // Images groupées par album (match ou personnalisé)
  async findAlbums() {
    const all = await this.repo.find({ order: { createdAt: 'DESC' } });
    const albums = new Map<string, { matchId: number | null; matchLabel: string; cover: string; count: number; images: Gallery[] }>();
    
    for (const img of all) {
      if (!img.matchLabel && !img.matchId) continue; // Skip images not in an album

      const key = img.matchLabel || `match-${img.matchId}`;
      if (!albums.has(key)) {
        albums.set(key, {
          matchId: img.matchId || null,
          matchLabel: img.matchLabel || key,
          cover: img.imageUrl,
          count: 0,
          images: []
        });
      }
      const album = albums.get(key);
      if (album) {
        album.count++;
        album.images.push(img);
      }
    }

    return Array.from(albums.values());
  }

  // Images d'un match spécifique
  findByMatch(matchId: number) {
    return this.repo.find({ where: { matchId }, order: { createdAt: 'DESC' } });
  }

  // Images mises en avant pour le slideshow de l'accueil
  findFeatured() {
    return this.repo.find({ where: { featured: true }, order: { createdAt: 'DESC' }, take: 10 });
  }

  async findOne(id: number) {
    const g = await this.repo.findOne({ where: { id } });
    if (!g) throw new NotFoundException('Not found');
    return g;
  }

  create(data: Partial<Gallery>) { return this.repo.save(this.repo.create(data)); }
  async update(id: number, data: Partial<Gallery>) { await this.repo.update(id, data); return this.findOne(id); }
  async remove(id: number) { await this.repo.delete(id); return { deleted: true }; }
}
