import { CheerioCrawler, RequestQueue, log  } from 'crawlee';
import { CrawlerDB, hashUrl } from '../db/CrawlerDB.js'; // Ensure correct path

export abstract class BaseCheerioCrawler {
    startUrls: string[];
    source: String;
    crawler: CheerioCrawler;
    protected db: CrawlerDB; // Made protected for child access if needed
    constructor(startUrls: string[], source: String, db:CrawlerDB) {
        this.startUrls = startUrls;
        this.source = source
        this.crawler = null!
        this.db = db; // Inject the CrawlerDB instance
    }

    /**
     * Saves the raw HTML content of a page to the SQLite database.
     * This method is primarily used for caching.
     * @param url The URL of the page.
     * @param htmlContent The raw HTML body of the page.
     * @returns True if the HTML was saved successfully, false otherwise.
     */
    protected save_html(url: string, htmlContent: string): boolean {
        log.info(`Saving HTML for ${url} to DB.`);
        return this.db.saveArticle({
            url: url,
            html_content: htmlContent,
        });
    }

    /**
     * Parses the HTML content (from cache) and updates the article record in the database.
     * @param url The URL of the article.
     * @param parsedData The extracted data (title, content, date, author, genre).
     * @returns True if the parsed data was saved successfully, false otherwise.
     */
    protected savePage(
        url: string,
        parsedData: {
            title?: string;
            content?: string;
            date_article?: string;
            author?: string;
            date_crawled?:string
            genre?: string; // Add genre here as it's common for news
        }
    ): boolean {
        const htmlContent = this.db.getHtmlContent(url);
        if (!htmlContent) {
            log.error(`HTML content not found in DB for parsing URL: ${url}`);
            return false;
        }

        log.info(`Updating parsed data for ${url} in DB.`);
        return this.db.saveArticle({
            url: url,
            html_content: htmlContent, // Re-include HTML content for update
            ...parsedData,
        });
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