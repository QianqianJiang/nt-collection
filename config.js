module.exports = {
    puppeteer: {
        headless: false, // 是否启用无头模式页面
        //executablePath: '/usr/bin/chromium-browser',
        //args:['--no-sandbox'],
        ignoreHTTPSErrors: true,
        timeout: 0
    },
    browserPool: {
        min:1,
        max:5,
        idleTimeoutMillis:3600000
    },
    pagePool: {
        min:1,
        max:10,
        idleTimeoutMillis:300000
    },
    article_base_dir: '/home/pptruser/article/'
}