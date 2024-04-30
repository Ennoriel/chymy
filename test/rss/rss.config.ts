import { ProcessConfigArray, Scrap } from 'src';

function pageToPath(page: string) {
    return page.replace(/( |\.|\/|\\|:|\?|&)/g, '-').replace(/-+/g, '-');
}

const config = [
    {
        name: 'preprocess',
        from: 'preprocess',
        method: "parseXml"
    },
    {
        name: '.',
        from: 'attribute',
        rules: [
            {
                method: 'default',
                selector: "default"
            }
        ]
    },
    {
        name: '.',
        from: 'object',
        rules: [
            {
                method: 'project',
                selector: (item) => ({
                    type: item?.["."]?.rss ? "rss" : item?.["."]?.feed ? "atom" : undefined,
                    title: item?.["."]?.rss?.channel?.title,
                    link: item?.["."]?.rss?.channel?.link,
                    image: item?.["."]?.rss?.channel?.image?.url,
                })
            }
        ]
    },
] satisfies ProcessConfigArray;

export const scrapRule = {
    name: 'rss',

    from: {
        type: 'read-file',
        xtype: 'array',
        pages: [
            'https://www.actu-environnement.com/flux/rss/environnement/',
            'https://www.greenit.fr/feed/',
            'https://www.humanite.fr/sections/environnement/feed',
            'https://www.linfodurable.fr/rss.xml',
            'https://www.la-croix.com/RSS/UNIVERS_WENV',
            'https://www.lefigaro.fr/rss/figaro_sciences.xml',
            'https://www.lemonde.fr/planete/rss_full.xml',
            'https://www.lemonde.fr/climat/rss_full.xml',
            'https://www.lemonde.fr/afrique-climat-et-environnement/rss_full.xml',
            'https://www.liberation.fr/arc/outboundfeeds/rss-all/category/environnement/?outputType=xml',
            'https://www.socialter.fr/rss'
        ].map(url => `./test/rss/download/${pageToPath(url)}.html`),
        format: 'html'
    },

    process: {
        type: 'scrap',
        fromIndex: 0,
        toIndex: 0,
        config
    }
} satisfies Scrap;
