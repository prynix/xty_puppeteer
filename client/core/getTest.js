const request  = require("request");

// 要访问的目标页面
const targetUrl = "http://localhost:5010/get";

function getProxyIp(){
    var targetOptions = {
        method: 'GET',
        url: targetUrl,
        timeout: 8000,
        encoding: null,
    };
    request(targetOptions, function (error, response, body) {
        console.log('req:',response.statusCode)
        console.log('body:',body.toString())
    })

}
