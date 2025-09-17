import { BasicCrawler, KeyValueStore, log } from 'crawlee';
import crypto from 'crypto';
import { htmlObject } from '../types/htmlObject.js';


export abstract class BaseCrawler{
    crawler: BasicCrawler
    source: string
    cacheStoreName: string
    startUrls: string[]
    htmlStore!: KeyValueStore;

    constructor(source: string,
        cache_store_name: string,
        startUrls: string[],) {
        this.crawler = null!;
        this.source = source
        this.cacheStoreName = cache_store_name
        this.startUrls = startUrls
    }

    protected async downloadHtml(url: string) {
        try {
            const response = await fetch(url);
            if (!response.ok) { // Check if the request was successful
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const htmlContent = await response.text()
            // console.log(htmlContent)
            return htmlContent; 
        } catch (error) {
            console.error("Error fetching HTML:", error);
            return null;
        }
    }

    /**
     * This method for handle html page downloading and caching
     * if the site is crawled for the first time --> save to disk
     * if the site is crawled later --> load from disk
     */
    protected async handleHTML(url: string): Promise<string | Buffer<ArrayBufferLike>> {
        const hash = crypto.createHash('sha256').update(url).digest('hex')
        let htmlContent;
        let storedValue = await this.htmlStore.getValue(hash) as htmlObject;
        //  storedValue = (storedValue as {html: string | Buffer}).html
        if (storedValue == null){
            //Download html file from page
            htmlContent = await this.downloadHtml(url)
            // console.log(typeof htmlContent)
            try{
                if(htmlContent){
                    this.htmlStore.setValue(hash, {
                        html: htmlContent as string,
                        url: url as string
                    })
                }
            }
            catch (error: any){
                log.error(error.message)
            }
        } else {
            log.info('Skipping download. using cached html')
            htmlContent = storedValue.html
        }

        return htmlContent as string;
        
    };

    private async init(){
        this.htmlStore = await KeyValueStore.open(this.cacheStoreName)
    }


    abstract createCrawler(): BasicCrawler;

    /**
     * This method for running the crawler.
     * It's a wrapper of crawler.run() from CheerioCrawler
     */
    public async run(){
        await this.init();
        this.crawler = this.createCrawler();
        await this.crawler.run(this.startUrls)
    }

}
