let log4js = require('log4js')
console.log(__dirname)
log4js.configure({
    appenders: { UI: { type: 'file', filename: __dirname +'/logs/crawler',
            alwaysIncludePattern: true,
            pattern: "yyyy-MM-dd.log",
            encoding: 'utf-8',
            maxLogSize: 11024 }},
    categories: { default: { appenders: ['UI'], level: 'info' } }
})

let logger = log4js.getLogger('UI')

logger.info('日志初始化成功')
module.exports = logger;
