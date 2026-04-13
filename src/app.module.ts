import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MatchesModule } from './matches/matches.module';
import { NewsModule } from './news/news.module';
import { GalleryModule } from './gallery/gallery.module';
import { StoreModule } from './store/store.module';
import { PointsModule } from './points/points.module';
import { FunZoneModule } from './fun-zone/fun-zone.module';
import { AdsModule } from './ads/ads.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DonationsModule } from './donations/donations.module';
import { GiveawaysModule } from './giveaways/giveaways.module';
import { ForumModule } from './forum/forum.module';
import { SupportModule } from './support/support.module';
import { CommunityModule } from './community/community.module';
import { SponsorsModule } from './sponsors/sponsors.module';
import { SharedUploadsController } from './shared/shared-uploads.controller';
import { SystemSetting } from './admin/system-setting.entity';
import { SettingsController } from './admin/settings.controller';
import { SettingsService } from './admin/settings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemSetting]),
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DATABASE_HOST'),
        port: parseInt(config.get<string>('DATABASE_PORT') || '3306', 10),
        username: config.get<string>('DATABASE_USER'),
        password: config.get<string>('DATABASE_PASSWORD'),
        database: config.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
      }),
    }),
    ServeStaticModule.forRoot(
      {
        rootPath: join(process.cwd(), 'uploads'),
        serveRoot: '/uploads',
      },
      {
        rootPath: join(process.cwd(), 'public'),
        exclude: ['/api'],
      },
    ),
    AuthModule,
    UsersModule,
    MatchesModule,
    NewsModule,
    GalleryModule,
    StoreModule,
    PointsModule,
    FunZoneModule,
    AdsModule,
    SubscriptionsModule,
    NotificationsModule,
    AdminModule,
    DonationsModule,
    GiveawaysModule,
    ForumModule,
    SupportModule,
    CommunityModule,
    SponsorsModule,
  ],
  controllers: [AppController, SettingsController, SharedUploadsController],
  providers: [AppService, SettingsService],
})
export class AppModule {}
