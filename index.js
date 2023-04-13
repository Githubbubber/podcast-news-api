const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const { handle_response, get_all_news } = require('./lib/sources');
const app = express();

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
    }
);

app.get('/news', (req, res) => {
    const news_items = get_all_news();
    
    res.json({news_items});
});

app.get('/news/:news_item_id', async (req, res) => {
    const news_item_id = req.params.news_item_id;

    // const news_item_url = news_items.filter(source => source.source === news_item_id)[0].url;

    // if (!news_item_url) {
    //     res.status(404).send('News source not found');
    // }

    // res.status(200).send(news_item_url);

    // axios.get(news_source.url)
    //     .then(response => {
    //         const ans = handle_response(response, news_source);

    //         res.json({ans});
    //     });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    }
);
