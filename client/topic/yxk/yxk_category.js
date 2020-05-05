const amqp = require('amqplib');
const application = require('../../core/application')
const puppeteer = require('puppeteer'); //引入puppeteer库.
const antiDetect = require('../../core/antiDetect')

const topic = 'yxk_category';
const next_topic = 'yxk_category_page';

// 连接rabbitmq 账户:密码@地址:端口
amqp.connect(application.amqp).then(function (conn) {
    // 创建会话队列
    return conn.createChannel().then(function (ch) {
        // 与名为 hello 的会话队列建立连接
        var ok = ch.assertQueue(topic, {durable: true});
        ok = ok.then(function () {
            ch.prefetch(1);
        });
        ok = ok.then(function () {
            // 成功连接
            ch.consume(topic, main, {noAck: false});
        });
        return ok;

        async function main(msg) {
            const message = JSON.parse(msg.content.toString());

            let browser = null;
            let name = message.name;
            let year = message.year;
            let pName = message.pName;
            let tName = message.tName;
            let bName = message.bName;
            console.log(name,pName,tName,year,bName)
            try {
                const provincelineUrl = `https://gkcx.eol.cn/school/${message.school_id}/provinceline`
                browser = await puppeteer.launch({
                    ignoreDefaultArgs: ["--enable-automation"],
                    args: ['--no-sandbox'],
                    headless: true,
                    slowMo:200,
                    defaultViewport: {
                        width: 1440,
                        height: 800
                    }
                });
                const page = await browser.newPage(); //创建一页面.
                await antiDetect(page);
                await page.goto(provincelineUrl, {timeout: 300000}); //到指定页面的网址.

                await page.waitFor('#root > div > div > div > div > div > div > div.main.school_tab_wrap > div.school-content.school_content_1_4.clearfix > div.school_content_left_1_4 > div > div:nth-child(2) > div.content-top.content_top_1_4 > div > div:nth-child(1) > div > div');//等待下拉框出现
                await page.click('#root > div > div > div > div > div > div > div.main.school_tab_wrap > div.school-content.school_content_1_4.clearfix > div.school_content_left_1_4 > div > div:nth-child(2) > div.content-top.content_top_1_4 > div > div:nth-child(1) > div > div');//展开下拉框
                let pSelectId = await page.evaluate(() => {
                    return document.querySelector('#root > div > div > div > div > div > div > div.main.school_tab_wrap > div.school-content.school_content_1_4.clearfix > div.school_content_left_1_4 > div > div:nth-child(2) > div.content-top.content_top_1_4 > div > div:nth-child(1) > div > div').getAttribute('aria-controls');
                })
                await page.waitFor((pSelectId)=> !document.getElementById(pSelectId),pSelectId);
                await page.evaluate((pName,pSelectId) => {
                    document.getElementById(pSelectId).querySelectorAll('ul li').forEach(item=>{
                        if(item.innerText == pName){
                            item.click()
                        }
                    })
                },pName,pSelectId)


                await page.waitFor('#root > div > div > div > div > div > div > div.main.school_tab_wrap > div.school-content.school_content_1_4.clearfix > div.school_content_left_1_4 > div > div:nth-child(2) > div.content-top.content_top_1_4 > div > div:nth-child(2) > div > div');//等待下拉框出现
                await page.click('#root > div > div > div > div > div > div > div.main.school_tab_wrap > div.school-content.school_content_1_4.clearfix > div.school_content_left_1_4 > div > div:nth-child(2) > div.content-top.content_top_1_4 > div > div:nth-child(2) > div > div');//展开下拉框
                let tSelectId = await page.evaluate(() => {
                    return document.querySelector('#root > div > div > div > div > div > div > div.main.school_tab_wrap > div.school-content.school_content_1_4.clearfix > div.school_content_left_1_4 > div > div:nth-child(2) > div.content-top.content_top_1_4 > div > div:nth-child(2) > div > div').getAttribute('aria-controls');
                })
                await page.waitFor((tSelectId)=> !document.getElementById(tSelectId),tSelectId);
                await page.evaluate((tName,tSelectId) => {
                    document.getElementById(tSelectId).querySelectorAll('ul li').forEach(item=>{
                        if(item.innerText == tName){
                            item.click()
                        }
                    })
                },tName,tSelectId)

                await page.waitFor('#select0 > div');//等待下拉框出现
                await page.click('#select0 > div');//展开下拉框
                let ySelectId = await page.evaluate(() => {
                    return document.querySelector('#select0 > div').getAttribute('aria-controls');
                })
                await page.waitFor((ySelectId)=> !document.getElementById(ySelectId),ySelectId);
                await page.evaluate((year,ySelectId) => {
                    document.getElementById(ySelectId).querySelectorAll('ul li').forEach(item=>{
                        if(item.innerText == year){
                            item.click()
                        }
                    })
                },year,ySelectId)

                await page.waitFor('#form2 > div > div > div > span > div > div');//等待下拉框出现
                await page.click('#form2 > div > div > div > span > div > div');//展开下拉框
                let bSelectId = await page.evaluate(() => {
                    return document.querySelector('#form2 > div > div > div > span > div > div').getAttribute('aria-controls');
                })
                await page.waitFor((bSelectId)=> !document.getElementById(bSelectId),bSelectId);
                await page.evaluate((bName,bSelectId) => {
                    document.getElementById(bSelectId).querySelectorAll('ul li').forEach(item=>{
                        if(item.innerText == bName){
                            item.click()
                        }
                    })
                },bName,bSelectId)

                await page.waitFor(10000);//等待10S

                let pages = await page.evaluate(() => {
                    let pages = []
                    document.querySelectorAll('#root > div > div > div > div > div > div > div.main.school_tab_wrap > div.school-content.school_content_1_4.clearfix > div.school_content_left_1_4 > div > div:nth-child(2) > div.province_score_line_table > div.table_pagination_box > div > div ul li').forEach(li=>{
                        if(li.getAttribute('title') != 'Previous Page' && li.getAttribute('title') != 'Next Page'){
                            pages.push(li.getAttribute('title'))
                        }
                    })
                    return pages
                })

                for(let i in pages){
                    const pageNo = pages[i]
                    let tempObj = Object.assign({
                        'pageNo':pageNo
                    }, message);
                    console.log(name,pName,tName,year,bName,pageNo)
                    await ch.sendToQueue(next_topic, Buffer.from(JSON.stringify(tempObj)));
                }
            } catch (e) {
                console.error(e)
            } finally {
                if (browser) {
                    await browser.close()
                }
                ch.ack(msg)
            }
        }
    });
}).catch(console.warn);