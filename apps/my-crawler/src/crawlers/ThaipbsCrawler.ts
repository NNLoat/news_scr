import { BaseCheerioCrawler } from './BaseCheerioCrawler.js';
import { CheerioCrawler, Dataset, log } from 'crawlee';
import { removeAfterSubstring } from '../utils.js';

export class ThaipbsCrawler extends BaseCheerioCrawler{
    constructor(starturl: string[]){
        super(starturl, 'Thai PBS')
    }

    
    override createCrawler(): CheerioCrawler {
        const crawler = new CheerioCrawler({
            maxRequestsPerCrawl: 3,
            async requestHandler({request, $, enqueueLinks}){
                log.info(`Processing ${request.url}`);

                // Find all article links on the current page
                // The articles are located within <a> tags inside <h3> tags
                await enqueueLinks({
                    selector: 'div[class^=ContentCardVertical] > article > div > div > a[href*="/news/content/"]:nth-of-type(1)',
                    label: 'DETAIL'
                });

                 // Handle the pagination by finding the 'Next' button or page links
                // The pagination links have a specific class. This will find the next page button
                await enqueueLinks({
                    selector: 'div > section[data-section-name=pagination] > a[style=text-decoration:none]',
                    label: 'LIST' // Label for the next list page
                });

                if(request.label == 'DETAIL'){
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
                    
                    console.log(`title: ${title}\n\nDate: ${date}`)

                    await Dataset.pushData({
                        url: request.url,
                        title: title,
                        date,
                        genre,
                        content
                    })
                }
                if(request.label == 'LIST'){
                    console.log(`NAVIGATION: ${request.url}`)
                }

            }
        })
        return crawler;
    }
}