const BrowserPool = require("./utils/browserPool");
const timeUtil = require("./utils/timeUtil");
const config = require("./config");
const fs = require('fs');
const path = require('path');
const uuid = require('node-uuid');

/**
 * 参数说明：
 * url: 文章列表页面地址
 * article_num: 收集文章的数量
 * selector: css选择器
 * policy: 兼容策略
 */
module.exports = async function(url, article_num, selector, policy){

    // 获取browser并使用
    await BrowserPool.use(async browser=>{

        // 获取pagePool
        let pagePool = browser.pagePool;

        // 获取page并使用
        let list = await pagePool.use(async page=>{

            // 跳转到文章列表页面
            await page.goto(url,{timeout:0});
            await page.waitForSelector(selector.article_list);

            // 翻页到指定数量的文章，大部分网站通过页面滚动到底部自动翻页，这里模拟用户滚动页面
            let height = 0;
            while((await page.$$(selector.article_list)).length < article_num){
                await page.evaluate(()=>{
                    window.scrollBy(0,100);
                });
                height += 100;
                await page.waitFor(50);
            }

            // 滚动至网页底部，加载封面，因为大部分网站图片使用异步加载
            let scrollHeight = await page.evaluate(()=>{
                return document.body.scrollHeight;
            })
            for(; height<scrollHeight; height+=100){
              await page.evaluate(()=>{
                window.scrollBy(0,100);
              });
              await page.waitFor(50);
            }

            // 获取标题列表
            let title_list = await page.evaluate((article_num,selector)=>{
                let article_list = document.querySelectorAll(selector.title_list);
                let title_list = [];
                let i = 0;
                for(let article of article_list){
                    if(i++>=article_num){
                        break;
                    }
                    let title = article.innerText;
                    if(title_list.includes(title)){
                        title_list.push('');
                    } else{
                        title_list.push(article.innerText);
                    }
                }
                return title_list;
            },article_num,selector);

            // 获取封面列表
            let cover_pic_list = await page.evaluate((article_num,selector)=>{
                let cover_list = document.querySelectorAll(selector.cover_list);
                let cover_pic_list = [];
                let i = 0;
                for(let cover of cover_list){
                    if(i++ >= article_num){
                        break;
                    }
                    let cover_pic = '';
                    if(selector.cover_list.search(/^.*img$/)>=0){
                        cover_pic = cover.src;
                    }
                    cover_pic_list.push(cover_pic);
                }
                return cover_pic_list;
            },article_num,selector);

            // 获取文章链接
            let url_list = [];
            if(policy.get_url == 'SELECTOR'){ // 通过选择器
                url_list = await page.evaluate((article_num,selector)=>{
                    let article_list = document.querySelectorAll(selector.article_list);
                    let url_list = [];
                    let i = 1;
                    for(let article of article_list){
                        if(i++>article_num){
                            break;
                        }
                        url_list.push(article.href);
                    }
                    return url_list;
                },article_num,selector)
            } else { // 通过点击
                let article_list = await page.$$(selector.article_list);
                let i = 1;
                for(let article of article_list){
                    if(i++>article_num){
                        break;
                    }
                    let newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));//创建newPagePromise对象
                    await article.click();
                    await page.waitFor(1000);
                    let newPage = await newPagePromise;
                    url_list.push(newPage.url());
                    await newPage.close();
                }
            }

            // 装配列表
            let list = [];
            for(let i=0; i<article_num; i++){
                list.push({
                    title: title_list[i],
                    origin_url: url_list[i],
                    cover_pic: cover_pic_list[i]
                });
            }
            
            return list;
        })

        // 获取文章模板
        let buffer = fs.readFileSync('template.html');
        let template = buffer.toString();

        // 获取文章详情
        let tasks = [];
        for (let article of list){
            task = detail(pagePool,article,selector,policy,template);
            tasks.push(task);
        }
        await Promise.all(tasks);
    })

    async function detail(pagePool, article, selector, policy, template){

        // 获取page并使用
        article = await pagePool.use(async page=>{

            // 跳转详情页面
            await page.goto(article.origin_url,{timeout:0});

            // 滚动加载文章内容
            if(policy.get_content == 'SCROLL'){
                let scrollHeight = await page.evaluate(()=>{
                    return document.body.scrollHeight;
                })
                for(let height=0; height<scrollHeight; height+=50){
                await page.evaluate(()=>{
                    window.scrollBy(0,100);
                });
                await page.waitFor(100);
                }
            }
            
            // 等待内容加载完成
            let tasks = [];
            tasks.push(page.waitForSelector(selector.author,{timeout:30000}));
            tasks.push(page.waitForSelector(selector.content,{timeout:30000}));
            tasks.push(page.waitForSelector(selector.publish_time,{timeout:30000}));
            let loadResult = await Promise.all(tasks).catch(e=>{
                log.warn("页面无法加载："+article.origin_url);
                return null;
            });
            if(loadResult == null){
                return null;
            }

            // 根据css选择器获取文章信息
            var data = await page.evaluate(selector => {
                var data = {};
                data.author = document.querySelector(selector.author).innerText;
                data.content = document.querySelector(selector.content).innerHTML.replace(/<\/{0,1}strong>/g,'');
                data.publish_time = document.querySelector(selector.publish_time).innerText;
                data.contentText = document.querySelector(selector.content).innerText;
                data.word_count = data.contentText.length;
                return data;
            },selector).catch(e=>{
                console.error("内容获取失败："+article+"（"+e+"）");
                return null;
            });
            if(data == null){
                return null;
            }
            data.title = article.title;
            data.origin_url = article.origin_url;
            data.cover_pic = article.cover_pic;
            return data;
        })
        if(article==null){
            return null;
        }

        // 装配文章详情
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth()+1;
        month = (Array(2).join(0) + parseInt(month)).slice(-2);
        let day = date.getDate();
        day = (Array(2).join(0) + parseInt(day)).slice(-2);
        article.url = "/"+year+"/"+month+"/"+day+"/"+uuid.v1().replace(/-/g,"")+".html";
        article.publish_time = timeUtil.formatTime(article.publish_time);

        // 持久化1：生成html
        var filename = generateHtml(article,template);
        article.filename = filename;
        
    }
    
    // 组装html
    function generateHtml(article, template){
        let html = template
            .replace(/\$\{title\}/g,article.title)
            .replace(/\$\{origin_url\}/g,article.origin_url)
            .replace(/\$\{author\}/g,article.author)
            .replace(/\$\{content\}/g,article.content)
            .replace(/\$\{publish_time\}/g,article.publish_time);
        let filename = config.article_base_dir+article.url;
        mkdirsSync(path.dirname(filename));
        fs.writeFile(filename,html,(err) => {
            if(err){
                throw err;
            }
        });
        return filename;
    }

    // 递归创建目录 同步方法
    function mkdirsSync(dirname) {
        if (fs.existsSync(dirname)) {
            return true;
        } else {
            if (mkdirsSync(path.dirname(dirname))) {
                fs.mkdirSync(dirname);
                return true;
            }
        }
    }
}