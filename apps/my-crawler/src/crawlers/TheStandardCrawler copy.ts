import { BaseCheerioCrawler } from './BaseCheerioCrawler.js';
import { CheerioCrawler, Dataset, log } from 'crawlee';


export class TheStandardCrawler extends BaseCheerioCrawler {
    constructor(startUrls: string[]) {
        // Call the parent constructor with the start URLs and an optional maxRequests limit.
        super(startUrls, 'The Standard');
    }

    override createCrawler() {
        const crawler = new CheerioCrawler(({
            maxRequestsPerCrawl: 7,
            respectRobotsTxtFile: true,
            async requestHandler({ request, $, enqueueLinks }) {
                log.info(`Processing ${request.url}`);

                // Find all article links on the current page
                // The articles are located within <a> tags inside <h3> tags
                await enqueueLinks({
                    selector: 'h3.news-title a',
                    label: 'DETAIL'
                });

                // Handle the pagination by finding the 'Next' button or page links
                // The pagination links have a specific class. This will find the next page button
                await enqueueLinks({
                    selector: 'div.wp-pagenavi a.nextpostslink',
                    label: 'LIST' // Label for the next list page
                });

                // This part runs only on the article detail pages
                if (request.label === 'DETAIL') {
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
                    // Get the full HTML content of the page
                    const htmlContent = $.html();

                    // Store the extracted data
                    await Dataset.pushData({
                        url: request.url,
                        title,
                        author,
                        date,
                        genre,
                        content,
                        html: htmlContent
                    });

                    log.info(`Scraped article: ${title}`);
                }
            }
        }))

        return crawler
    }
}