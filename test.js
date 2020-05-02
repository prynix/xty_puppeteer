const puppeteer = require('puppeteer'); //引入puppeteer库.
const antiDetect = require('./antiDetect')
async function main(msg) {
    try{
        let browser = await puppeteer.launch({
            ignoreDefaultArgs: ["--enable-automation"],
            headless: false,
            defaultViewport:{
                width:1440,
                height:800
            }
        }); //用指定选项启动一个Chromium浏览器实例。
        const page = await browser.newPage(); //创建一页面.
        await antiDetect(page);
        await page.goto('http://guangzhou.customs.gov.cn/guangzhou_customs/381558/381572/381573/index.html',{timeout: 30000}); //到指定页面的网址.
    }catch (e) {
        console.log(e)
    }

}

main()