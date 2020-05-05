const util = require('util');
const request = require('request');
const _ = require('underscore')
const amqp = require('amqplib');
const getPromise = util.promisify(request.get);
const application = require('../../core/application')
const puppeteer = require('puppeteer'); //引入puppeteer库.

const topic = 'yxk';
const next_topic = 'yxk_category'
const province = {
    11: "北京",
    12: "天津",
    13: "河北",
    14: "山西",
    15: "内蒙古",
    21: "辽宁",
    22: "吉林",
    23: "黑龙江",
    31: "上海",
    32: "江苏",
    33: "浙江",
    34: "安徽",
    35: "福建",
    36: "江西",
    37: "山东",
    41: "河南",
    42: "湖北",
    43: "湖南",
    44: "广东",
    45: "广西",
    46: "海南",
    50: "重庆",
    51: "四川",
    52: "贵州",
    53: "云南",
    54: "西藏",
    61: "陕西",
    62: "甘肃",
    63: "青海",
    64: "宁夏",
    65: "新疆",
    71: "香港",
    81: "澳门",
    82: "台湾",
    99: "其它",
    100: "不分省",
    0: "其它"
};
const kelei = {
    93: "科类22",
    92: "字段3",
    91: "字段2",
    90: "字段",
    88: "无批次",
    87: "特殊类批",
    86: "本科提前批C段",
    85: "免费师范生批",
    84: "自主招生批",
    83: "专项计划本科二批（贫困专项、南疆单列、对口援疆计划本科二批次）",
    82: "专项计划本科一批（贫困专项、南疆单列、对口援疆计划本科一批次）",
    81: "高校专项批",
    79: "地方专项批",
    76: "提前专项批",
    74: "国家专项批",
    71: "地方农村专项计划本科批",
    70: "本科零批",
    69: "本科综合评价批",
    66: "本科乙批",
    65: "本科甲批",
    64: "地方专项计划本科二批",
    63: "地方专项计划本科一批",
    62: "国家专项计划本科二批",
    61: "国家专项计划本科一批",
    60: "精准脱贫专项计划（专科）",
    59: "精准脱贫专项计划（本科）",
    58: "本科第二批预科B",
    57: "本科第二批预科A",
    56: "本科第一批预科",
    55: "艺术本科第一批专项",
    54: "本科二批C段",
    53: "本科第一批专项",
    52: "本科一批B段",
    51: "本科一批A段",
    50: "单设本科批次",
    49: "专科批B段",
    48: "专科批A段",
    47: "本科批B段",
    46: "本科批A段",
    45: "本科二批B段",
    44: "本科二批A段",
    43: "专项批",
    42: "本科提前批自主招生",
    41: "本科提前一批",
    40: "本科提前二批",
    39: "提前批专项计划",
    38: "普通类平行录取段",
    37: "本科提前批B段",
    36: "本科提前批A段",
    35: "新增批次",
    34: "蒙授艺术",
    33: "蒙授理科",
    32: "蒙授文科",
    31: "蒙授体育",
    30: "民语言艺术类",
    29: "民语言理科",
    28: "民语言文科",
    27: "民语言体育类",
    26: "艺术理",
    25: "艺术文",
    24: "体育理",
    23: "体育文",
    20: "专科二批",
    19: "专科一批",
    18: "平行录取三段",
    17: "平行录取二段",
    16: "平行录取一段",
    15: "普通类提前批",
    14: "本科批",
    13: "地方专项计划本科批",
    12: "国家专项计划本科批",
    11: "专科提前批",
    10: "专科批",
    9: "本科三批",
    8: "本科二批",
    7: "本科一批",
    6: "本科提前批",
    5: "体育类",
    4: "艺术类",
    3: "综合",
    2: "文科",
    1: "理科"
}

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
            let pages = [];
            try {
                const provincelineUrl = `https://gkcx.eol.cn/school/${message.school_id}/provinceline`
                browser = await puppeteer.launch({
                    ignoreDefaultArgs: ["--enable-automation"],
                    args: ['--no-sandbox'],
                    headless: true,
                    defaultViewport: {
                        width: 1440,
                        height: 800
                    }
                });
                const page = await browser.newPage(); //创建一页面.
                await page.goto(provincelineUrl, {timeout: 300000}); //到指定页面的网址.
                pages = await page.evaluate(() => {
                    let pages = []
                    document.querySelectorAll('#root > div > div > div > div > div > div > div.main.school_tab_wrap > div.school-content.school_content_1_4.clearfix > div.school_content_left_1_4 > div > div:nth-child(2) > div.province_score_line_table > div.table_pagination_box > div > div ul li').forEach(li=>{
                        if(li.getAttribute('title') != 'Previous Page' && li.getAttribute('title') != 'Next Page'){
                            pages.push(li.getAttribute('title'))
                        }
                    })
                    return pages
                })
            } catch (e) {
                console.error(e)
            } finally {
                if (browser) {
                    await browser.close()
                }
            }

            try {
                const specialPlanUrl = `https://static-data.eol.cn/www/2.0/school/${message.school_id}/dic/specialplan.json`
                const specialplan = await getPromise(specialPlanUrl, {});
                for (let i in JSON.parse(specialplan.body).data.data) {
                    const item = JSON.parse(specialplan.body).data.data[i]
                    const year = item.year;
                    for (let j in item.province) {
                        const temp = item.province[j]
                        const pName = province[temp.pid]
                        for (let k in temp.type) {
                            const type = temp.type[k]
                            const tName = kelei[type]
                            for (let l in temp.batch) {
                                const batch = temp.batch[l]
                                const bName = kelei[batch]
                                for(let m in pages){
                                    const page = pages[m]

                                    let tempObj = Object.assign({
                                        'page':page,
                                        'year':year,
                                        'pName':pName,
                                        'tName':tName,
                                        'bName':bName,
                                    }, message);
                                    await ch.sendToQueue(next_topic, Buffer.from(JSON.stringify(tempObj)));
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                console.error(e)
            } finally {
                console.log(`${message.name}--${message.school_id}--category 爬取完成`)
                ch.ack(msg)
            }

        }
    });
}).catch(console.warn);