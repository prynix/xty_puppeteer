const puppeteer = require('puppeteer'); //引入puppeteer库.
const antiDetect = require('./server/core/antiDetect')
async function main(msg) {
    try{
        let browser = await puppeteer.launch({
            ignoreDefaultArgs: ["--enable-automation"],
            headless: false,
            slowMo: 200,
            defaultViewport:{
                width:1440,
                height:800
            }
        }); //用指定选项启动一个Chromium浏览器实例。
        const page = await browser.newPage(); //创建一页面.
        await antiDetect(page);
        await page.goto('https://gkcx.eol.cn/school/99/provinceline',{timeout: 30000}); //到指定页面的网址.
        await page.waitFor('#root > div > div > div > div > div > div > div.main.school_tab_wrap > div.school-content.school_content_1_4.clearfix > div.school_content_left_1_4 > div > div:nth-child(2) > div.content-top.content_top_1_4 > div > div:nth-child(1) > div > div');//等待下拉框出现
        await page.click('#root > div > div > div > div > div > div > div.main.school_tab_wrap > div.school-content.school_content_1_4.clearfix > div.school_content_left_1_4 > div > div:nth-child(2) > div.content-top.content_top_1_4 > div > div:nth-child(1) > div > div');//展开下拉框
        let pSelectId = await page.evaluate(() => {
            return document.querySelector('#root > div > div > div > div > div > div > div.main.school_tab_wrap > div.school-content.school_content_1_4.clearfix > div.school_content_left_1_4 > div > div:nth-child(2) > div.content-top.content_top_1_4 > div > div:nth-child(1) > div > div').getAttribute('aria-controls');
        })
        await page.waitFor((pSelectId)=> !document.getElementById(pSelectId),pSelectId);
        let pName = '内蒙古'
        await page.evaluate((pName,pSelectId) => {
            document.getElementById(pSelectId).querySelectorAll('ul li').forEach(item=>{
                if(item.innerText == pName){
                    item.click()
                }
            })
        },pName,pSelectId)
    }catch (e) {
        console.log(e)
    }

}

main()