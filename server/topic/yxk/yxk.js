const request = require('request');
const async = require('async');
const _ = require('underscore')
const amqp = require('amqplib');
const apiUrl = 'https://api.eol.cn/gkcx/api';
const application = require('../../core/application')

const topic =  'yxk';
const qs = {
    access_token: '',
    admissions: '',
    central: '',
    department: '',
    dual_class: '',
    f211: '',
    f985: '',
    is_dual_class: '',
    keyword: '',
    page: 1,
    province_id: '',
    request_type: 1,
    school_type: '',
    signsafe: '',
    size: 20,
    sort: 'view_total',
    type: '',
    uri: 'apigkcx/api/school/hotlists'
}

const main = function(){
    async.waterfall([
        function(callback) {//获取页数
            let param = Object.assign({}, qs);
            param.page = 1
            request({
                timeout: 5000,    // 设置超时
                method: 'GET',    //请求方式
                url: apiUrl, //url
                json: true,
                qs: param

            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    const pageArr = [];
                    for(let i=1;i<=Math.ceil(body.data.numFound/param.size);i++){
                        pageArr.push(i)
                    }
                    callback(null,pageArr)
                }else{
                    callback(error)
                }
            });
        },
        function(pageArr, callback) {//获取每一页数据
            async.mapLimit(pageArr,2, function(page, cb) {
                let param = Object.assign({}, qs);
                param.page = page
                request({
                    timeout: 5000,    // 设置超时
                    method: 'GET',    //请求方式
                    url: apiUrl, //url
                    json: true,
                    qs: param

                }, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        cb(null,body.data.item)
                    }else{
                        cb(error)
                    }
                });
            }, function(err, results) {
                callback(null,_.flatten(results))
            });
        }
    ], function (err, result) {
            amqp.connect(application.amqp).then(function (conn) {
                return conn.createChannel().then(function (ch) {
                    let ok = ch.assertQueue(topic, {durable: true});
                    return ok.then(function (_qok) {
                        result.forEach(item =>{
                            ch.sendToQueue(topic, Buffer.from(JSON.stringify(item)));
                            console.log(`${item.name}-${item.school_id} 数据插入消息中心成功 `)
                        })
                        return ch.close();
                    });
                }).finally(function () {
                    conn.close();
                });
            }).catch(e => {
                throw e
            });
    });
}

main()