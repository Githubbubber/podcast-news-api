const express = require('express');

const { get_all_news_items } = require('./lib/sources');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    const getStuff = localStorage.getItem("news");

    const items = getStuff !== "undefined" ? 
    getStuff : get_all_news_items();

    res.status(200).json({
        see: items
    });
});

app.get('/:news_item_id', async (req, res) => {
    res.status(200).json({ content: "news_url" });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
