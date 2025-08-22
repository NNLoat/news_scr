import { CheerioCrawler, Configuration } from 'crawlee';

export abstract class BaseCheerioCrawler {
    startUrls: string[];
    source: String;
    crawler: CheerioCrawler;
    constructor(startUrls: string[], source: String) {
        this.startUrls = startUrls;
        this.source = source
        this.crawler = null!
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