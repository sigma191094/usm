import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { UploadsController } from './uploads.controller';
import { UsersModule } from '../users/users.module';
import { MatchesModule } from '../matches/matches.module';
import { NewsModule } from '../news/news.module';
import { StoreModule } from '../store/store.module';
import { AdsModule } from '../ads/ads.module';
import { GiveawaysModule } from '../giveaways/giveaways.module';
import { FunZoneModule } from '../fun-zone/fun-zone.module';
import { DonationsModule } from '../donations/donations.module';
import { SupportModule } from '../support/support.module';
import { CommunityModule } from '../community/community.module';
import { SponsorsModule } from '../sponsors/sponsors.module';
import { SystemSetting } from './system-setting.entity';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemSetting]),
    UsersModule, 
    MatchesModule, 
    NewsModule, 
    StoreModule, 
    AdsModule,
    GiveawaysModule,
    FunZoneModule,
    DonationsModule,
    SupportModule,
    CommunityModule,
    SponsorsModule,
  ],
  controllers: [AdminController, UploadsController, SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class AdminModule {}
