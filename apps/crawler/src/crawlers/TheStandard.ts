// crawler fro thestandard website

import { CheerioCrawler, Dataset } from 'crawlee';
import type { SiteConfig } from './BaseCrawler.js';
import { BaseCrawler } from './BaseCrawler.js';

export class TheStandard extends BaseCrawler{
    public readonly config: SiteConfig = {
        label: "The Standard",
        entryUrls: ['https://thestandard.co/wealth/']
    };
    async launch() {
        const crawler = new CheerioCrawler({
            async requestHandler({ request, response, body, contentType, $ }){
                const data = []
                // extract from page
                $('newsbox-archive').each((index, el) => {
                    console.log(JSON.stringify({
                        item: $(el)
                    }))
                })
            }
        })
    }
}