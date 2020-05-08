const http = require("http");  // 引入内置http模块
const url  = require("url");


// 要访问的目标页面
const targetUrl = "http://dev.kdlapi.com/testproxy";
// const targetUrl = "/testproxy";
const urlParsed   = url.parse(targetUrl);

// 代理ip,由快代理提供
// const proxyIp = "localhost";  // 代理服务器ip
// const proxyPort = "5010"; // 代理服务器host
const proxyIp = "dev.kdlapi.com"; // 代理服务器host
const proxyPort = "80"; // 代理服务器host

// http代理验证信息
// const options = {
//     host    : proxyIp,
//     port    : proxyPort,
//     path    : targetUrl,
//     method  : "GET",
//     // headers : {
//     //     "Host": urlParsed.hostname,
//     // }
// };
//
// http.request(options,  (res) => {
//     console.log("got response: " + res.statusCode);
//     // 输出返回内容(使用了gzip压缩)
//     if (res.headers['content-encoding'] && res.headers['content-encoding'].indexOf('gzip') != -1) {
//         let zlib = require('zlib');
//         let unzip = zlib.createGunzip();
//         res.pipe(unzip).pipe(process.stdout);
//     } else {
//         // 输出返回内容(未使用gzip压缩)
//         res.pipe(process.stdout);
//     }
// }).on("error", (err) => {
//         console.log(err);
//     })
//     .end()




var targetOptions = {
    method: 'GET',
    url: targetUrl,
    timeout: 8000,
    encoding: null,
};
targetOptions.proxy = 'http://localhost:5010'; //代理服务器
request(targetOptions, function (error, req, body) {
    console.log('error:',error)
    console.log('req:',req)
    console.log('body:',body)
})
