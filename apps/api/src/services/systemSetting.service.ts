import { prisma } from '../lib/prisma.js';

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  type: string;
  description: string | null;
  updatedAt: Date;
}

class SystemSettingServiceImpl {
  private cache: Map<string, SystemSetting> = new Map();

  /**
   * Load all settings from the database and populate the cache.
   */
  async loadAll(): Promise<void> {
    try {
      console.log('[SystemSettingService] Loading configurations from database...');
      const settings = await prisma.systemSetting.findMany();
      this.cache.clear();
      for (const s of settings) {
        this.cache.set(s.key, s);
      }
      console.log(`[SystemSettingService] Loaded ${this.cache.size} settings into memory.`);
    } catch (err: any) {
      console.error('[SystemSettingService] Failed to load settings from DB:', err.message || err);
    }
  }

  /**
   * Get raw SystemSetting object from cache.
   */
  get(key: string): SystemSetting | undefined {
    return this.cache.get(key);
  }

  /**
   * Get string value of setting.
   */
  getString(key: string, defaultValue = ''): string {
    const setting = this.get(key);
    return setting ? setting.value : defaultValue;
  }

  /**
   * Get number value of setting.
   */
  getNumber(key: string, defaultValue = 0): number {
    const setting = this.get(key);
    if (!setting) return defaultValue;
    const parsed = Number(setting.value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Get boolean value of setting.
   */
  getBoolean(key: string, defaultValue = false): boolean {
    const setting = this.get(key);
    if (!setting) return defaultValue;
    return setting.value === 'true';
  }

  /**
   * Set setting value in DB and refresh cache.
   */
  async set(key: string, value: string): Promise<SystemSetting> {
    const existing = this.get(key);
    const type = existing ? existing.type : (value === 'true' || value === 'false' ? 'BOOLEAN' : (isNaN(Number(value)) ? 'STRING' : 'NUMBER'));

    const updated = await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, type }
    });

    this.cache.set(key, updated);
    console.log(`[SystemSettingService] Updated cache: ${key} = ${value}`);
    return updated;
  }

  /**
   * Get all settings from cache.
   */
  getAll(): SystemSetting[] {
    return Array.from(this.cache.values());
  }
}

export const SystemSettingService = new SystemSettingServiceImpl();
