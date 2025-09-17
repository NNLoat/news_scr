// Let's scrape something...
// import { CheerioCrawler, Dataset, log } from 'crawlee';
// import { TheStandardCrawler } from './crawlers/TheStandardCrawler.js';
// import { ThaipbsCrawler } from './crawlers/ThaipbsCrawler.js';



// async function main () {
//     // const link = ['https://thestandard.co/category/wealth/wealth-economic/']
//     const link = ['https://www.thaipbs.or.th/news/categories/economy/archive']
//     // const crawler = new TheStandardCrawler(link);
//     const crawler = new ThaipbsCrawler(link)
//     await crawler.run()
// }

// main()



// CheerioCrawler crawls the web using HTTP requests
// and parses HTML using the Cheerio library.

// const crawler = new CheerioCrawler({
//     // Use the requestHandler to process each of the crawled pages.
//     async requestHandler({ request, $, enqueueLinks, log }) {
//         const news_item_link = $('.news-item > .row > .col-sm-5 > .thumb > a[href]')
//         .map((i,el) => $(el).attr('href'))
//         .get()


//         const news_item_title = $('.news-title > a[href]')
//         .map((i,el) => $(el).text()).get()
//         news_item_title.forEach((item, index) => {
//             news_item_title[index] = news_item_title[index].replace(/[\t\n]/g, "")
//         })
//         console.log(news_item_title)
        
//         // .map((i, el) => $(el).attr())
//         // const title = $('title').text();
//         // log.info(`Title of ${request.loadedUrl} is '${title}'`);

//         // // Save results as JSON to ./storage/datasets/default
//         // await Dataset.pushData({ title, url: request.loadedUrl });

//         // // Extract links from the current page
//         // // and add them to the crawling queue.
//         // await enqueueLinks();
//     },

//     // Let's limit our crawls to make our tests shorter and safer.
//     maxRequestsPerCrawl: 5,
// });

// const crawler = new CheerioCrawler({
//     maxRequestsPerCrawl: 7,
//     respectRobotsTxtFile: true,
//     async requestHandler({request, $, enqueueLinks}){
//         log.info(`Processing ${request.url}`);

//         // Find all article links on the current page
//         // The articles are located within <a> tags inside <h3> tags
//         await enqueueLinks({
//             selector: 'h3.news-title a',
//             label: 'DETAIL'
//         });

//         // Handle the pagination by finding the 'Next' button or page links
//         // The pagination links have a specific class. This will find the next page button
//         await enqueueLinks({
//             selector: 'div.wp-pagenavi a.nextpostslink',
//             label: 'LIST' // Label for the next list page
//         });

//         // This part runs only on the article detail pages
//         if (request.label === 'DETAIL') {
//             const title = $('div.entry-title > h1.title').text().trim();
//             const author = $('div.meta-author > a').map((i, el) => $(el).text()).get().join(',')
//             const dateTmp = $('div.meta-date > span').text().trim().split('.')
//             let date
//             try{
//                 if (dateTmp.length == 3){
//                     date = [dateTmp[1],dateTmp[0],dateTmp[2]].join('/')
//                 }
//             }
//             catch(error){
//                 console.error(error)
//             }

//             const content = $('.entry-content p').text().trim();
//             // Get the full HTML content of the page
//             const htmlContent = $.html(); 
            
//             // Store the extracted data
//             await Dataset.pushData({
//                 url: request.url,
//                 title,
//                 author,
//                 date,
//                 content,
//                 html: htmlContent
//             });

//             log.info(`Scraped article: ${title}`);
//         }
//     }
// })

// // Add first URL to the queue and start the crawl.
// await crawler.run([link]);



import '@dotenvx/dotenvx/config'
import { TheStandardBasicCrawler } from './crawlers/TheStandardBasicCrawler.js';
import { TheStandardCrawler } from './crawlers/TheStandardCrawler.js';
import { KeyValueStore } from 'crawlee';
import crypto from 'crypto';
import * as cheerio from 'cheerio';
import { htmlObject } from './types/htmlObject.js';
import { ThaipbsBasicCrawler } from './crawlers/ThaipbsBasicCrawler.js';


// console.log(`${process.env.CACHE_STORE_NAME}`)

// console.log('Crawling finished!');

 async function  main(){
    const link = ['https://thestandard.co/category/wealth/wealth-economic/']
    const link2 = ['https://www.thaipbs.or.th/news/categories/economy/archive']
    const crawler = new TheStandardBasicCrawler(link, process.env.HTML_CACHE_STORE_NAME as string)
    const crawler2 = new ThaipbsBasicCrawler(link2, process.env.HTML_CACHE_STORE_NAME as string)
    await crawler.run()
    // await crawler2.run()

    // const url = 'https://thestandard.co/ai-bubble-warning-signs/'
    // const store = await KeyValueStore.open(process.env.HTML_CACHE_STORE_NAME)
    // const hash = crypto.createHash('sha256').update(url).digest('hex')
    // const value = await store.getValue(hash) as htmlObject
    // const $ = cheerio.load(value.html)
    // console.log($('.entry-content p').text())

}

await main()