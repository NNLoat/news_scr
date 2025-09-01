import { BasicCrawler, log, Dataset } from "crawlee";
import { BaseCrawler } from "./BaseCrawler.js";
import * as cheerio from 'cheerio';



export class TheStandardBasicCrawler extends BaseCrawler {
    constructor(startUrls: string[], cache_store_name: string) {
        super("The Standard", cache_store_name, startUrls)

    }
    protected override async  handleHTML(url: string): Promise<string | Buffer<ArrayBufferLike>> {
        return super.handleHTML(url)
    }
    override createCrawler(): BasicCrawler {

        const self = this
        const crawler = new BasicCrawler({
            maxRequestsPerCrawl: 4,
            respectRobotsTxtFile: true,
            maxConcurrency:10,
            async requestHandler({ request, sendRequest, crawler }) {
                log.info(`Processing ${request.url}`);
                // STEP 1: Download the page content first
                // const { body } = await sendRequest({
                //     url: request.url,
                //     method: request.method as any,
                //     body: request.payload,
                //     headers: request.headers,
                // })
                let $: cheerio.CheerioAPI
                // Process archive page
                if (request.url.includes('/category/')) {
                    const { body } = await sendRequest({
                        url: request.url,
                        method: request.method as any,
                        body: request.payload,
                        headers: request.headers,
                    })
                    $ = cheerio.load(body)
                    const nav = $('div.wp-pagenavi > a.nextpostslink').attr('href')
                    // TODO: need to check if it is a valid link
                    if (nav) {
                        await crawler.addRequests([nav])
                    }
                    let article_link: string[] = []
                    $('div.newsbox-archive > div.news-item > div.row > div > div > h3.news-title > a').each((ind, ele) =>{
                        article_link.push(ele.attribs.href)
                    })
                    // console.log(`${article_link?.length} ${article_link}`)
                    if (article_link){
                        await crawler.addRequests(article_link)
                    }
                }
                else{
                    const body = await self.handleHTML(request.url);
                    $ = cheerio.load(body)
                    const title = $('div.entry-title > h1.title').text().trim();
                    const author = $('div.meta-author > a').map((i, el) => $(el).text()).get().join(',')
                    const dateTmp = $('div.meta-date > span').text().trim().split('.')
                    let date
                    try {
                        if (dateTmp.length == 3) {
                            date = [dateTmp[1], dateTmp[0], dateTmp[2]].join('/')
                        }
                    }
                    catch (error) {
                        console.error(error)
                    }

                    const genre = $('span.category > a[href*=https://thestandard.co/category/]').text().trim()

                    const content = $('.entry-content p').text().trim();

                    await Dataset.pushData({
                        url: request.url,
                        title,
                        author,
                        date,
                        genre,
                        content,
                    });
                }
            }

        })

        return crawler
    }
}