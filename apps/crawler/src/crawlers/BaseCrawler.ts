// crawlers/BaseCrawler.ts

// base class for crawler
import type { Dataset } from 'crawlee';

export interface SiteConfig {
  label: string;
  entryUrls: string[];
  urlPattern?: RegExp;   // optional stricter check
}

export abstract class BaseCrawler {
  public abstract readonly config: SiteConfig;
  public abstract launch(): Promise<void>;
}