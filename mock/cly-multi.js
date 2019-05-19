'use strict';

/*
 * 测硫仪多设备 多topc数据发送模拟
 */
const mqtt = require('mqtt');
const date = require('date-and-time');

const broker = process.env.BROKER || '60.30.105.251';
const device_count = process.env.DEVICE_COUNT || '60.30.105.251';
const client = mqtt.connect('mqtt://' + broker);

const fire = require('../topics/fire');
const messages = require('../topics/messages');

// celiuyi topic
const cly_upload = 'ssu';
const cly_download = 'ssu1';

// 客户端链接成功后订阅topic
client.on('connect', () => {
    console.log('connected');

client.subscribe(cly_upload);
client.publish(cly_upload, 'cly-msg');
fire.sendStatus(client, cly_upload);
});

function getCurrentTime(formate){
    return date.format(new Date(), formate);
}

// 客户端链接接收数据后处理
client.on('message', (topic, buffer) => {
    console.log('topic: ' + topic);
console.log('topic: ' + getCurrentTime('YYYY-MM-DD HH:mm:ss.SSS') + '>>' + buffer.toString());
})
;
