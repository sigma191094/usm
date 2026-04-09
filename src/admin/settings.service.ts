import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from './system-setting.entity';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectRepository(SystemSetting)
    private settingsRepo: Repository<SystemSetting>,
  ) {}

  async getSetting(key: string): Promise<string | null> {
    const setting = await this.settingsRepo.findOne({ where: { key } });
    return setting ? setting.value : null;
  }

  async saveSetting(key: string, value: string): Promise<SystemSetting> {
    this.logger.log(`Saving setting: ${key} = ${value}`);
    let setting = await this.settingsRepo.findOne({ where: { key } });
    if (setting) {
      setting.value = value;
    } else {
      setting = this.settingsRepo.create({ key, value });
    }
    return this.settingsRepo.save(setting);
  }
}
