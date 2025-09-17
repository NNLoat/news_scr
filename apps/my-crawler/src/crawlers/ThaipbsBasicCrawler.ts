import { BasicCrawler, Dataset, log } from "crawlee";
import { BaseCrawler } from "./BaseCrawler.js";
import * as cheerio from 'cheerio'
import { removeAfterSubstring } from '../utils.js';


export class ThaipbsBasicCrawler extends BaseCrawler{

    baseURL: string
    constructor(startUrls:string[], cache_store_name:string){
        super("Thai PBS", cache_store_name, startUrls)
        this.baseURL = 'https://www.thaipbs.or.th'
    }

    protected override async handleHTML(url: string): Promise<string | Buffer<ArrayBufferLike>> {
        return super.handleHTML(url)
    }

    override createCrawler(): BasicCrawler {
        const self = this
        const crawler = new BasicCrawler({
            maxRequestsPerMinute: 120,
            respectRobotsTxtFile: false,
            retryOnBlocked: true,
            sameDomainDelaySecs: 5,
            maxConcurrency: 10,
            maxRequestsPerCrawl: 3,
            async requestHandler({request, sendRequest, crawler}){
                log.info(`Processing ${request.url}`);
                let $: cheerio.CheerioAPI

                // Process archive page
                if (request.url.includes('/categories')){
                    // fetch archive page
                    const {body} = await sendRequest({
                        url: request.url,
                        method: request.method as any
                    })

                    // load archive page to cheerio instace
                    $ = cheerio.load(body)

                    // check for next page button of archive
                    const nav = $('div > section[data-section-name=pagination] > a[style=text-decoration:none]').attr('href')
                    // add new archive page to requestQueue
                    if(nav){
                        await crawler.addRequests([`${self.baseURL}${nav}`])
                    }

                    // extract all news articles from archive page and add to article_link
                    let article_link: string[] = []
                    $('div[class^=ContentCardVertical] > article > div > div > a[href*="/news/content/"]:nth-of-type(1)').each(
                        (ind, ele) => {
                            article_link.push(`${self.baseURL}${ele.attribs.href}`)
                        }
                    )

                    //add article_link to requestQueue
                    if(article_link){
                        await crawler.addRequests(article_link)
                    }
                } else { // handle news article page
                    const body = await self.handleHTML(request.url);
                    $ = cheerio.load(body)
                    
                    const title = $('main > header > div > div > h1').text().trim();
                    const dateTmp =  $('div[class^=NewsHeader] > time').attr('datetime')
                    // format date to string
                    const date = (dateTmp) ? (() => {
                        let tmp = new Date(dateTmp)
                        return [tmp.getDate(), tmp.getMonth(), tmp.getFullYear()].join('/')
                    })() : null
                    const genre = $('div[class^=NewsHeader] > a[href]').attr('title')
                    const contentTmp = $('div[id=item-description] > p').text().trim()
                    // remove related news text from the main content
                    const content  = (contentTmp) ? removeAfterSubstring(contentTmp,'อ่านข่าว') : null
                    if(content == null){
                        throw Error('Main news content is null. Maybe the selector is wrong')
                    }

                    await Dataset.pushData({
                        url: request.url,
                        title: title,
                        date,
                        genre,
                        content
                    })
                    
                }
            }
        })

        return crawler
    }

}