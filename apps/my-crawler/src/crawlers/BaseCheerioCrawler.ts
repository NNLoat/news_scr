import { CheerioCrawler, KeyValueStore , KeyValueStoreOptions, log, HttpCrawler  } from 'crawlee';
import { CrawlerDB, hashUrl } from '../db/CrawlerDB.js'; // Ensure correct path
import crypto from 'crypto';
import { Impit } from 'impit';


export abstract class BaseCheerioCrawler {
    startUrls: string[];
    source: String;
    crawler: CheerioCrawler;
    htmlStore!: KeyValueStore;
    // HTML_CACHE_STORE_NAME: string;
    
    constructor(startUrls: string[], source: String) {
        this.startUrls = startUrls;
        this.source = source
        this.crawler = null!
        // this.HTML_CACHE_STORE_NAME = HTML_CACHE_STORE_NAME
    }

    /**
     * This abstract method must be implemented by all subclasses.
     * It is responsible for creating and configuring a concrete crawler instance.
     */
    abstract createCrawler(): CheerioCrawler;

    /**
     * This method for running the crawler.
     * It's a wrapper of crawler.run() from CheerioCrawler
     */
    public async run(){
        this.crawler = this.createCrawler();
        await this.crawler.run(this.startUrls)
    }
}