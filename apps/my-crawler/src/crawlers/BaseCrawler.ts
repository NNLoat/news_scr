import { BasicCrawler, KeyValueStore, log, Request } from 'crawlee';
import crypto from 'crypto';
import { htmlObject } from '../types/htmlObject.js';


export abstract class BaseCrawler{
    crawler: BasicCrawler
    source: string
    cacheStoreName: string
    startUrls: any
    htmlStore!: KeyValueStore;
    force_recrawl_flag: boolean;
    requestInput: Request[]

    constructor(source: string,
        cache_store_name: string,
        startUrls: string[],
        force_recrawl_flag: boolean ) {
        this.crawler = null!;
        this.requestInput = null!;
        this.source = source
        this.cacheStoreName = cache_store_name
        this.startUrls = startUrls
        this.force_recrawl_flag = force_recrawl_flag;
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
     * This method is for clean up html content (like removing unicode) before save it for cache
     */

    protected cleanUpHtmlContent(htmlContent: string): string{
        // remove those unusual line separator, zero-width space char, etc.
        const to_be_remove_token = [/\u2028/g, /\u200B/g]
        let modifiedContent = htmlContent
        to_be_remove_token.forEach((x) =>{
            modifiedContent = modifiedContent.replace(x, "")
        })
        return modifiedContent
    }

    /**
     * This method to force crawler to recrawl the url by adjusting the unique key of the request
     */
    protected process_request(): Request[] {
        let output: Request[] = this.startUrls.map(function (x: string) {
            return new Request({
                url: x,
                uniqueKey: `the-standard-archive-page-${Date.now()}`
            })
        })
        return output;

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
                    htmlContent = this.cleanUpHtmlContent(htmlContent)
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
        console.log(`recrawl flag: ${this.force_recrawl_flag}`)
        if (this.force_recrawl_flag == true){
            this.requestInput = this.process_request();
        }
        else{
            this.requestInput = this.startUrls
        }
        console.log('open key-value store')
        this.htmlStore = await KeyValueStore.open(this.cacheStoreName)
    }


    abstract createCrawler(): BasicCrawler;

    /**
     * This method for running the crawler.
     * It's a wrapper of crawler.run() from CheerioCrawler
     */
    public async run(){
        await this.init();
        console.log('finished init')
        this.crawler = this.createCrawler();
        await this.crawler.run(this.requestInput)
    }

}
