'use strict';

/*
 * 测硫仪单条数据发送模拟
 */
const mqtt = require('mqtt');
let date = require('date-and-time');

const broker = process.env.BROKER || '60.30.105.251';
const client = mqtt.connect('mqtt://' + broker);

const express = require('express');
const app = express();
const port = process.env.PORT || 1883;

const fire = require('../topics/fire');
// celiuyi topic
const cly_upload = 'ssu';
const cly_download = 'ssu1';

const comm = require('../common/common');

// 客户端链接成功后订阅topic
client.on('connect', () => {
    console.log('connected');
    comm.addMessage();
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
