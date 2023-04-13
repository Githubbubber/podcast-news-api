const cheerio = require('cheerio');
const axios = require('axios');

const news_sources = [
    {
        name: "pod_mvmt",
        url: "https://podcastmovement.com/category/resources/society-culture-advocacy/",
        base: "https://podcastmovement.com/resources/society-culture-advocacy/",
        search_el: "h2.post-item-title a",
    }, 
    {
        name: "mashable",
        url: "https://mashable.com/category/podcasts",
        base: "https://mashable.com",
        search_el: "a[data-ga-item='title']",
    },
    {
        name: "podnews",
        url: "https://podnews.net/archive",
        base: "https://podnews.net",
        search_el: "main article a",
    }
];
const max_source_count = 5;

const handle_response = (response, source) => {
    const items = [];
    const html = response.data;
    const $ = cheerio.load(html);
    let received_els = $(source.search_el, html);

    received_els = received_els.slice(0, max_source_count);

    received_els.each(function() {
        let title = $(this).text();
        let url = $(this).attr('href');

        if (url.indexOf("http") === -1) {
            url = source.base + $(this).attr('href');
        }

        items.push({
            title,
            url: url,
            source: source.name
        });
    });

    return items;
};

const get_all_news = () => {
    let news_items = [];

    news_sources.forEach(async source => {
        let response = await axios.get(source.url);
        
        news_items.push(handle_response(response, source));

        console.log("S??ources:");
        console.log(news_items);
    });

    return news_items;
};

get_all_news();

module.exports = {
    handle_response,
    get_all_news
};
