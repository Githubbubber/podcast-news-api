const cheerio = require('cheerio');
const axios = require('axios');

const title = require('title');
const capitalize_title = title;

/**
 * Aggregator of news articles from the following sources:
 * The New York Times, Mashable, Podcast Movement, Podnews,
 * Podcast Business Journal, The BBC, The Guardian, Entertainment Weekly, Hot Pod, The Feed, and Inside Podcasting
 * 
 * All date strings converted to ISO 8859-1
 * for sorting purposes. Once the articles are sorted 
 * by ISO value, these articles will be merged with
 * the non-date news items sprinkled in between the array.
 */

const max_item_count = 5;

/**
 * I'd rather work with ISO 8859-1 than the date strings
 * 
 * @param {String} date 
 * 
 * @returns {Number} Date string converted to ISO 8859-1
 */
const get_converted_date = (date) => {
    const date_obj = new Date(date);
    const date_string = date_obj.toISOString();
    const parsed_date_string = Date.parse(date_string);

    return parsed_date_string;
};

/**
 * Podcast Movement news items
 * 
 * @returns {Promise} Resolves with an array of news items if successful, or rejects with an error message
 */
const get_pod_mvmt_news_items = () => {
    return new Promise((resolve, reject) => {
        const pod_mvmt = {
            name: "Podcast Movement",
            url: "https://podcastmovement.com/category/resources/society-culture-advocacy/",
            base: "",
            search_el_container: "div.post-item-header",
            search_el_link: 'h2.post-item-title a',
            search_el_date: "div div time[itemprop='datePublished']",
        };

        axios.get(pod_mvmt.url)
        .then((response) => {
            const pod_mvmt_items_array = [];
            const html = response.data;
            const $ = cheerio.load(html);
        
            let received_els = $(pod_mvmt.search_el_container, html);
            received_els = received_els.slice(0, max_item_count);
            
            received_els.each(function() {
                const link_el = $(this).find(pod_mvmt.search_el_link);
                const url = pod_mvmt.base + link_el.attr('href');
                const date = $(this).find(pod_mvmt.search_el_date).text();
                const date_to_sort = get_converted_date(date);
                const title = link_el.text().trim();
                title = capitalize_title(title);
                const source = pod_mvmt.name;
                
                pod_mvmt_items_array.push({
                    title,
                    date,
                    date_to_sort,
                    url,
                    source
                });
            });
    
            resolve(pod_mvmt_items_array);
        })
        .catch((err) => {
            console.error(`Error? ${err}`);

            reject("Error: No response from API");
        });
    });
};

/**
 * NY Times news items
 * 
 * @returns {Promise} Resolves with an array of news items if successful, or rejects with an error message
 */
const get_nytimes_news_items = () => {
    return new Promise((resolve, reject) => {
        const nytimes = {
            name: "The New York Times",
            url: "https://www.nytimes.com/search?query=podcast+news",
            base: "https://www.nytimes.com",
            search_el_container: 'li[data-testid="search-bodega-result"] div div div',
            search_el_link: "a",
            search_el_title: "h4",
            search_el_date: 'span',
        };

        axios.get(nytimes.url)
        .then((response) => {
            const nytimes_items_array = [];
            const html = response.data;
            const $ = cheerio.load(html);

            let received_els = $(nytimes.search_el_container, html);
            received_els = received_els.slice(0, max_item_count + 5);

            received_els.each(function() {
                const link_el = $(this).find(nytimes.search_el_link);
                const url = nytimes.base + link_el.attr('href');
                let date = link_el.find(nytimes.search_el_date);
                date = date.text().trim();

                if (date.includes("|")) {
                    date = date.split("|")[1];
                    date = date.split(", P")[0];
                    const date_to_sort = get_converted_date(date);
                    let title = link_el.find(nytimes.search_el_title).text();
                    title = capitalize_title(title.trim());
                    const source = nytimes.name;

                    nytimes_items_array.push({
                        title,
                        date,
                        date_to_sort,
                        url,
                        source
                    });
                }
            });

            resolve(nytimes_items_array);
        })
        .catch((err) => {
            console.error(`Error? ${err}`);

            reject("Error: No response from API");
        });
    });
;}

/**
 * Mashable news items
 * 
 * @returns {Promise} Resolves with an array of news items if successful, or rejects with an error message
 */
const get_mashable_news_items = () => {
    return new Promise((resolve, reject) => {
        const mashable = {
            name: "Mashable",
            url: "https://mashable.com/category/podcasts",
            base: "https://mashable.com",
            search_el_container: "main section section div div.w-full div div",
            search_el_link: 'a[data-ga-item="title"]:first-child',
            search_el_date: "div:nth-child(3) time",
        };

        axios.get(mashable.url)
        .then((response) => {
            const mashable_items_array = [];
            const html = response.data;
            const $ = cheerio.load(html);

            let received_els = $(mashable.search_el_container, html);
            received_els = received_els.slice(0, max_item_count);

            received_els.each(function() {
                const link_el = $(this).find(mashable.search_el_link);
                const url = mashable.base + link_el.attr('href');
                let title = link_el.text().trim();
                title = capitalize_title(title);
                const source = mashable.name;
                const date = $(this).find(mashable.search_el_date).text().trim();

                if (date !== "") {
                    const date_to_sort = get_converted_date(date);

                    mashable_items_array.push({
                        title,
                        date,
                        date_to_sort,
                        url,
                        source,
                    });
                }
            });

            resolve(mashable_items_array);
        })
        .catch((err) => {
            console.error(`Error? ${err}`);

            reject("Error: No response from API");
        });
    });
};

/**
 * Podnews news items
 * 
 * TODO: Find a way to pull in the date string that sits right
 * before the link element. 
 * $(this).attr('href').previousSibling for the date didn't work
 * 
 * @returns {Promise} Resolves with an array of news items if successful, or rejects with an error message
 */
const get_podnews_news_items = () => {
    return new Promise((resolve, reject) => {
        const podnews = {
            name: "Podnews",
            url: "https://podnews.net/archive",
            base: "https://podnews.net",
            search_el: "main article a",
        };

        axios.get(podnews.url)
        .then((response) => {
            const podnews_items_array = [];
            const html = response.data;
            const $ = cheerio.load(html);

            let received_els = $(podnews.search_el, html);
            received_els = received_els.slice(0, max_item_count);

            received_els.each(function() {
                const url = podnews.base + $(this).attr('href');
                let title = $(this).text().trim();
                title = capitalize_title(title);
                const source = podnews.name;

                podnews_items_array.push({
                    title,
                    url,
                    source,
                });
            });

            resolve(podnews_items_array);
        })
        .catch((err) => {
            console.error(`Error? ${err}`);

            reject("Error: No response from API");
        });
    });
};

/**
 * Podcast Business Journal news items
 * 
 * @returns {Promise} Resolves with an array of news items if successful, or rejects with an error message
 */
const get_podbsjrnl_news_items = () => {
    return new Promise((resolve, reject) => {
        const pod_bsn_jrnl = {
            name: "Podcast Business Journal",
            url: "https://podcastbusinessjournal.com/category/news/",
            base: "",
            search_el: "div.item-details",
            search_el_link: "h3 a",
            search_el_date: "div span time",
        };

        axios.get(pod_bsn_jrnl.url)
        .then((response) => {
            let podbsjrnl_items_array = [];
            const html = response.data;
            const $ = cheerio.load(html);

            let received_els = $(pod_bsn_jrnl.search_el, html);
            received_els = received_els.slice(0, max_item_count);

            received_els.each(function() {
                const link_el = $(this).find(pod_bsn_jrnl.search_el_link);
                const url = pod_bsn_jrnl.base + link_el.attr('href');
                let title = link_el.text().trim();
                title = capitalize_title(title.trim());
                let date = $(this).find(pod_bsn_jrnl.search_el_date);
                date = date.text().trim();
                const date_to_sort = get_converted_date(date);
                const source = pod_bsn_jrnl.name;

                podbsjrnl_items_array.push({
                    date,
                    date_to_sort,
                    title,
                    url,
                    source,
                });
            });

            resolve(podbsjrnl_items_array);
        })
        .catch((err) => {
            console.error(`Error? ${err}`);

            reject("Error: No response from API");
        });
    });
};

/**
 * BBC news items
 * 
 * @returns {Promise} Resolves with an array of news items if successful, or rejects with an error message
 */
const get_the_bbc_news_items = () => {
    return new Promise((resolve, reject) => {
        const bbc = {
            name: "The BBC",
            url: "https://www.bbc.com/news/topics/c34ny53zk4et",
            base: "https://www.bbc.com",
            search_el_container: 'ul[class*="SimpleGrid"] li:not(class)',
            search_el_sub_cont: 'div div div div',
            search_el_link: "div a", 
            search_el_title: "span p span",
            search_el_date: "div li div:nth-child(2) span span span:nth-child(2)",
        };

        axios.get(bbc.url)
        .then((response) => {
            let bbc_items_array = [];
            const html = response.data;
            const $ = cheerio.load(html);

            let received_els = $(bbc.search_el_container, html);
            received_els = received_els.slice(0, max_item_count);

            for (let i = 0; i < received_els.length; i++) {
                if (received_els[i].children[0].children[0].name !== undefined) {
                    const sub_container = received_els[i].children[0].children[0].children[0].children[0];

                    const link_el = sub_container.children[0].children[0];

                    const url = bbc.base + link_el.attribs.href; 

                    let date = sub_container.children[1].children[0].children[0].children[1].children[0].children[1].children[0].children[0].children[0].children[0].data;
                    date = date.trim().split(" ");
                    date = date[1] + " " + date[0] + ", " + new Date().getFullYear();
                    const date_to_sort = get_converted_date(date);

                    let title = link_el.children[0].children[0].children[0].children[0].data.trim();
                    title = capitalize_title(title.trim());

                    const source = bbc.name;

                    bbc_items_array.push({
                        title,
                        date,
                        date_to_sort,
                        url,
                        source
                    });
                }
            }

            resolve(bbc_items_array);
        })
        .catch((err) => {
            console.error(`Error? ${err}`);
        });
    });
};

/**
 * The Guardian news items 
 * _nd in name means no date
 * 
 * @returns {Promise} Resolves with an array of news items if successful, or rejects with an error message
 */
const get_guardian_news_items_nd = () => {
    return new Promise((resolve, reject) => {
        const guardian = {
            name: "The Guardian",
            url: "https://www.google.co.uk/search?as_q=podcast+industry&as_epq=&as_oq=&as_eq=&as_nlo=&as_nhi=&lr=&cr=&as_qdr=all&as_sitesearch=www.theguardian.com&as_occt=any&safe=images&as_filetype=&tbs=",
            base: "",
            search_el: 'div#rso div',
            search_el_link: 'div div div div div a',
            search_el_title: "h3",
        };

        axios.get(guardian.url)
        .then((response) => {
            const guardian_items_array = [];
            const html = response.data;
            const $ = cheerio.load(html);

            let received_els = $(guardian.search_el, html);
            received_els = received_els.slice(0, max_item_count);

            received_els.each(function() {
                const link_el = $(this).find(guardian.search_el_link);
                console.log(link_el);
        
                return;
                const url = guardian.base + link_el.attr('href');
                const source = guardian.name;
                let title = link_el.find(guardian.search_el_title).text()
                title = capitalize_title(title.trim());

                guardian_items_array.push({
                    title,
                    url,
                    source
                });
            });

            // console.log(guardian_items_array);
                return;
            resolve(guardian_items_array);
        })
        .catch((err) => {
            console.error(`Error? ${err}`);

            reject("Error: No response from API");
        });
    });
};

/**
 * Entertainment Weekly news items 
 * _nd in name means no dates
 * 
 * @returns {Promise} Resolves with an array of news items if successful, or rejects with an error message
 */
const get_ent_weekly_news_items_nd = () => {
    return new Promise((resolve, reject) => {
        const entertainment_weekly = {
            name: "Entertainment Weekly",
            url: "https://ew.com/search/?q=podcast+news",
            base: "",
            search_el_title: "div.searchResult__content a.searchResult__titleLink.elementFont__subheadLink span", // have to strip away any ems
            search_el_url: "div.searchResult__content a.searchResult__titleLink.elementFont__subheadLink"
        };

        axios.get(entertainment_weekly.url)
        .then((response) => {
            const entertainment_weekly_items_array = [];
            const html = response.data;
            const $ = cheerio.load(html);

            let received_els = $(entertainment_weekly.search_el_container, html);
            received_els = received_els.slice(0, max_item_count);

            received_els.each(function() {
                const url = entertainment_weekly.base + $(this).find(entertainment_weekly.search_el_url).attr('href');
                let title = "";
                title = capitalize_title(title.trim());
                let title_segments = $(this).find(entertainment_weekly.search_el_title);
                const source = entertainment_weekly.name;

                for (const segment of title_segments) {
                    title += segment.text();
                }

                entertainment_weekly_items_array.push({
                    url,
                    title,
                    source,
                });
            });

            resolve(entertainment_weekly_items_array);
        })
        .catch((err) => {
            console.error(`Error? ${err}`);

            reject("Error: No response from API");
        });
    });
};

/**
 * Hot Pod news items
 * 
 * @returns {Promise} Resolves with an array of news items if successful, or rejects with an error message
 */
const NEW_hot_pod_news_items = () => {
    return new Promise((resolve, reject) => {
        const hot_pod = {
            name: "Hot Pod",
            url: "https://hotpodnews.com/",
            base: "",
            search_el: "div#cont",
            search_el_link: "div#cont di",
            search_el_title: "h3",
        };

        axios.get(hot_pod.url)
        .then((response) => {
            const hot_pod_items_array = [];
            const html = response.data;
            const $ = cheerio.load(html);

            let received_els = $(hot_pod.search_el, html);
            received_els = received_els.slice(0, max_item_count);

            received_els.each(function() {
                const link_el = $(this).find(hot_pod.search_el_link);
                const url = hot_pod.base + link_el.attr('href');
                const source = hot_pod.name;
                let title = link_el.find(hot_pod.search_el_title).text();
                title = capitalize_title(title.trim());

                hot_pod_items_array.push({
                    title,
                    url,
                    source
                });
            });

            resolve(hot_pod_items_array);
        })
        .catch((err) => {
            console.error(`Error? ${err}`);

            reject("Error: No response from API");
        });
    });
};

/**
 * The Feed news items
 * 
 * @returns {Promise} Resolves with an array of news items if successful, or rejects with an error message
 */
const NEW_the_feed_news_items = () => {
    return new Promise((resolve, reject) => {
        const the_feed = {
            name: "The Feed",
            url: "https://thefeed.libsyn.com/",
            base: "",
            search_el: "div#content",
            search_el_link: "div#content",
            search_el_title: "h3",
        };

        axios.get(the_feed.url)
        .then((response) => {
            const the_feed_items_array = [];
            const html = response.data;
            const $ = cheerio.load(html);

            let received_els = $(the_feed.search_el, html);
            received_els = received_els.slice(0, max_item_count);

            received_els.each(function() {
                const link_el = $(this).find(the_feed.search_el_link);
                const url = the_feed.base + link_el.attr('href');
                const source = the_feed.name;
                let title = link_el.find(the_feed.search_el_title).text();
                title = capitalize_title(title.trim());

                the_feed_items_array.push({
                    title,
                    url,
                    source
                });
            });

            resolve(the_feed_items_array);
        })
        .catch((err) => {
            console.error(`Error? ${err}`);

            reject("Error: No response from API");
        });
    });
};

/**
 * Inside Podcasting news items
 * 
 * @returns {Promise} Resolves with an array of news items if successful, or rejects with an error message
 */
const NEW_inside_podcasting_news_items = () => {
    return new Promise((resolve, reject) => {
        const inside_podcasting = {
            name: "Inside Podcasting",
            url: "https://inside.com/podcasting",
            base: "",
            search_el: "div#content",
            search_el_link: "div#content",
            search_el_title: "h3",
        };
        
        axios.get(inside_podcasting.url)
        .then((response) => {
            const inside_podcasting_items_array = [];
            const html = response.data;
            const $ = cheerio.load(html);

            let received_els = $(inside_podcasting.search_el, html);
            received_els = received_els.slice(0, max_item_count);

            received_els.each(function() {
                const link_el = $(this).find(inside_podcasting.search_el_link);
                const url = inside_podcasting.base + link_el.attr('href');
                const source = inside_podcasting.name;
                let title = link_el.find(inside_podcasting.search_el_title).text();
                title = capitalize_title(title.trim());

                inside_podcasting_items_array.push({
                    title,
                    url,
                    source
                });
            });

            resolve(inside_podcasting_items_array);
        })
        .catch((err) => {
            console.error(`Error? ${err}`);

            reject("Error: No response from API");
        });
    });
};

/* Handle Sorting of News Articles */

/**
 * Using merge sort to sort news items by ISO date values.
 * Recursive function where after base case is fulfilled 
 * and values are returned, will go through 
 * conquermerge_news_items for final array.
 * 
 * @returns {Array} Array of objects containing news items
 */
const divide_news_items = (unsorted_news_items_arr) => {
    let n = arr.length;

    if (n < 2) {
        return arr;
    }

    let arr1 = [], arr2 = [];
    let h2 = n / 2;
    let halvsies = Math.floor(h2);

    arr1 = arr.slice(0, halvsies);
    arr2 = arr.slice(halvsies, n);

    arr1 = divide_news_items(arr1);
    arr2 = divide_news_items(arr2);

    if (arr1 && arr2 && arr1.length === 1 && arr2.length === 1) {
        arr1.sort((a, b) => {
            return b.date - a.date;
        });

        arr2.sort((a, b) => {
            return b.date - a.date;
        });
    }

    return conquermerge_news_items(arr1, arr2);
};

/**
 * @param {Array} arr1 
 * @param {Array} arr2 
 * 
 * @returns {Array} Array of sorted news items
 */
const conquermerge_news_items = (arr1, arr2) => {
    let merged_arr = [];

    while (arr1 && arr2 && arr1.length && arr2.length) {
        if (arr1[0].date_to_sort > arr2[0].date_to_sort) {
            merged_arr.push(arr1.shift());
        } else {
            merged_arr.push(arr2.shift());
        }
    }

    merged_arr = merged_arr.concat(arr1.slice().concat(arr2.slice()));

    return merged_arr;
};

const add_nd_news_items = (merged_arr) => {
    const guardian = get_guardian_news_items_nd();
    const entertainment_weekly = get_ent_weekly_news_items_nd();
    let temp_holder = [];
    let even_key = 0;

    while (even_key < 51) {
        temp_holder.push(guardian[even_key]);
        temp_holder.push(merged_arr.slice(even_key, even_key + 5));

        temp_holder.push(entertainment_weekly[even_key]);
        temp_holder.push(merged_arr.slice(even_key + 5, even_key + 10));

        even_key += 5;
    }

    return temp_holder;
};

const get_all_news_items = () => {
    let collected_arr = [];
    // let collected_nd_arr = [];

    // get_nytimes_news_items()
    // .then((nyt_response) => {
    //     collected_arr.push(nyt_response);
    // })
    // .then(get_pod_mvmt_news_items)
    // .then((pod_mvmt_response) => {
    //     collected_arr.push(pod_mvmt_response);
    // })
    //.then(get_mashable_news_items)
    // .then((mashable_response) => {
    //     collected_arr.push(mashable_response);
    // })
    // .then(get_podnews_news_items)
    // .then((podnews_response) => {
    //     collected_arr.push(podnews_response);
    // })
    get_podbsjrnl_news_items()//.then(get_podbsjrnl_news_items)
    // .then((podbsjrnl_response) => {
    //     collected_arr.push(podbsjrnl_response);
    // })
    // .then(get_the_bbc_news_items)
    // .then((the_bbc_response) => {
    //     collected_arr.push(the_bbc_response);
    // })
    .then(() => {
        console.log(collected_arr);
        // collected_arr = divide_news_items(collected_arr);
    })
    // .then(get_ent_weekly_news_items_nd)
    // .then((ent_weekly_response) => {
    //     collected_nd_arr.push(ent_weekly_response);
    // })
    // .then(get_guardian_news_items_nd)
    // .then((guardian_response) => {
    //     collected_nd_arr.push(guardian_response);
    // })
    // .then(NEW_hot_pod_news_items)
    // .then((hot_pod_response) => {
    //     collected_arr.push(hot_pod_response);
    // })
    // .then(NEW_the_feed_news_items)
    // .then((the_feed_response) => {
    //     collected_arr.push(the_feed_response);
    // })
    // .then(NEW_inside_podcasting_news_items)
    // .then((inside_podcasting_response) => {
    //     collected_arr.push(inside_podcasting_response);
    // })
    .then(() => {
        // collected_arr = add_nd_news_items(collected_nd_arr);
        
        // console.log(collected_arr);
    })
    .catch((err) => {
        console.error(`Error? ${err}`);
    });
};
get_all_news_items();
module.exports = get_all_news_items;
