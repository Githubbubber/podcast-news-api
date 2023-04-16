const express = require('express');

const { handle_one_source_response, news_items } = require('./lib/sources');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.status(200).json(news_items);
});

app.get('/:news_item_id', async (req, res) => {
    const news_item_id = req.params.news_item_id;
    const news_url = news_items.filter(newspaper => newspaper[0].source === news_item_id);

    res.status(200).json({ content: news_url });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
