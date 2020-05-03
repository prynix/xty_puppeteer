const request = require('request');
const _ = require('underscore')
const amqp = require('amqplib');
const application = require('../../core/application')

const topic = 'yxk';

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
            console.log(message)
        }
    });
}).catch(console.warn);