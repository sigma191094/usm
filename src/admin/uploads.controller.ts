import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('admin/upload')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class UploadsController {
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4();
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      // Allow images and common video formats
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|mp4|mov|avi|mkv|webm)$/i)) {
        return cb(new Error('Only image and video files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 500 * 1024 * 1024, // 500MB limit for videos
    }
  }))
  uploadFile(@UploadedFile() file: any) {
    return {
      url: `/uploads/${file.filename}`,
    };
  }
}
