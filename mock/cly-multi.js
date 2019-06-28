'use strict';

/*
 * 测硫仪多设备 多topc数据发送模拟
 */
const mqtt = require('mqtt');
const common = require('../common/common');
const cloneDeep = require('clone-deep');
const broker = process.env.BROKER || '60.30.105.251';
const port = process.env.PORT || 11883;
const username = 'mos';
const password = 'mos';
const device_count = process.env.DEVICE_COUNT || 2;

// celiuyi topic
const cly_topic_prefix = '/cly/up/';
const cly_topic_prefix2 = '/cly/down/';

const cly_upload_sufix = '';
const cly_download_sufix = '';

// 模拟数据
var cly_data = ['#UPLOAD,3,1,75,001,95.20000,青岛欧森测试,12345678,12345678,青岛港,柴油,0#,青岛',
    '#UPLOAD,3,2,75,欧森海事技术服务有限公司,1,青岛欧森,1,标准样品,xxx,',
    '#UPLOAD,3,3,56,2019/06/27 16:01,青岛欧森海事技术服务有限公司e'
];

let deviceArray = [];
var deviceTopics = [];
for (var i = 0; i < device_count; i++) {
    deviceArray.unshift(i);
}
console.log(deviceArray);

// 注意nodjs 异步机制, 参见https://blog.csdn.net/fangjian1204/article/details/50585073
/*
    #SERVER,1,001
    #SERVER,2,001,3
    #UPLOAD,3,1,75,001,95.20000,青岛欧森测试,12345678,12345678,青岛港,柴油,0#,青, 
    #UPLOAD,3,2,75,欧森海事技术服务有限公司,1,青岛欧森,1,标准样品,xxx,201 , 
    #UPLOAD,3,3,56,2019/05/07 16:01,青岛欧森海事技术服务有限公司
*/

deviceArray.forEach(function (idx) {
    var client_up = mqtt.connect('mqtt://' + broker, {
        'clientId': 'sunic_cly_' + Math.random().toString(16).substr(2, 8),
        'username': username,
        'password': password,
        'deviceId': idx,
        'port': port
    });
    // 客户端链接成功后订阅topic
    client_up.on('connect', () => {
        console.log(client_up.options.clientId + ' connected');
        var topic_up = cly_topic_prefix + client_up.options.deviceId + cly_upload_sufix;
        var topic_down = cly_topic_prefix2 + client_up.options.deviceId + cly_download_sufix;
        client_up.subscribe(topic_down);
        // 链接成功后发送上线数据指令
        console.log('client_up.options.deviceId:' + client_up.options.deviceId)
        client_up.publish(topic_up, '#SERVER,1,' + client_up.options.deviceId);
    });
    // 客户端链接接收数据后处理
    client_up.on('message', (topic, buffer) => {
        console.log(common.getCurrentTime('YYYY-MM-DD HH:mm:ss.SSS') + '>>' + topic + ';' + buffer.toString());

        var resp = buffer.toString();
        var data_len = cly_data.length;
        if (resp.startsWith('#SERVER,1,')) {
            var _topicUp = topic.replace('down', 'up');
            client_up.publish(_topicUp, cly_data[0].replace("青岛欧森测试", _topicUp + "青岛欧森测试"));
            console.log(0 + cly_data[0].replace("青岛欧森测试", _topicUp + "青岛欧森测试"));
        }
        else if (resp.startsWith('#SERVER,2,')) {
            var _topicUp = topic.replace('down', 'up');
            var _pkgIdx = parseInt(resp.substr(resp.lastIndexOf(',') + 1));
            // 发送剩余数据包
            if (_pkgIdx < data_len) client_up.publish(_topicUp, cly_data[_pkgIdx]);
        } else {
            console.log('buffer > ' + buffer);
            console.log('unkown response');
        }
    });

    // var client_down = mqtt.connect('mqtt://' + broker, {
    //     'clientId': 'sunic_cly_' + Math.random().toString(16).substr(2, 8),
    //     'deviceId': idx
    // });
    // client_down.on('connect', () => {
    //     console.log(client_down.options.clientId + ' connected');
    //     var topic_down = cly_topic_prefix + client_down.options.deviceId + cly_download_sufix;
    //     client_down.subscribe(topic_down);
    //     deviceTopics.push(topic_down);
    // });

    // // 客户端链接接收数据后处理
    // client_down.on('message', (topic, buffer) => {
    //     var resp = buffer.toString();
    //     console.log(common.getCurrentTime('YYYY-MM-DD HH:mm:ss.SSS') + '>>' + topic + ';' + resp);

    //     var cly_data = ['#UPLOAD,3,1,75,001,95.20000,青岛欧森测试,12345678,12345678,青岛港,柴油,0#,青,',
    //         '#UPLOAD,3,2,75,欧森海事技术服务有限公司,1,青岛欧森,1,标准样品,xxx,201,',
    //         '#UPLOAD,3,3,56,2019/05/07 16:01,青岛欧森海事技术服务有限公司'
    //     ];
    //     var data_len = cly_data.length;
    //     if (resp.startsWith('#SERVER,1,')) {
    //         var _topicUp = topic.replace('down', 'up');
    //         client_down.publish(_topicUp, cly_data[0]);
    //     }
    //     // else if (resp.startsWith('#UPLOAD,')) {
    //     // } 
    //     else if (resp.startsWith('#SERVER,2,')) {
    //         var _topicUp = topic.replace('down', 'up');
    //         var _pkgIdx = parse.Int(resp.substr(resp.lastIndexOf(',') + 1));
    //         // 发送剩余数据包
    //         if (_pkgIdx < data_len) client_down.publish(_topicUp, cly_data[_pkgIdx + 1]);
    //     } else {
    //         client_down.on('message', (topic, buffer) => {
    //             console.log('buffer > ' + buffer);
    //             console.log('unkown response');
    //         });
    //     }
    // });
});
// // 错误！！！ 异步问题
// for (var i = 0; i < device_count; i++) {
    // deviceArray.unshift('00' + i);
    // // deviceArray.push('00' + i);

    // var client_up = mqtt.connect('mqtt://' + broker, {
    //     'clientId': 'sunic_cly_' + Math.random().toString(16).substr(2, 8),
    //     'deviceId': deviceArray.pop()
    // });
    // // var client_down = mqtt.connect('mqtt://' + broker, {
    // //     'clientId': 'sunic_cly_' + Math.random().toString(16).substr(2, 8),
    // //     'deviceId': deviceArray.shift()
    // // });

    // // 客户端链接成功后订阅topic
    // client_up.on('connect', () => {
    //     console.log(client_up.options.clientId + ' connected');
    //     var topic_up = cly_topic_prefix + client_up.options.deviceId + cly_upload_sufix;
    //     console.log('ccc' + topic_up)
    //     client_up.subscribe(topic_up);
    //     client_up.publish(topic_up, 'up_cly-msg' + client_up.options.deviceId);
    //     deviceTopics.push(topic_up);
    // });
    // // 客户端链接接收数据后处理
    // client_up.on('message', (topic, buffer) => {
    //     console.log('topic: ' + topic);
    //     console.log('topic: ' + common.getCurrentTime('YYYY-MM-DD HH:mm:ss.SSS') + '>>' + buffer.toString());
    // })

    // client_down.on('connect', () => {
    //     console.log(client_down.options.clientId + ' connected');
    //     var topic_down = cly_topic_prefix + client_down.options.deviceId + cly_download_sufix;
    //     console.log(topic_down);
    //     client_down.subscribe(topic_down);
    //     client_down.publish(topic_down, 'down_cly-msg' + client_down.options.deviceId);
    //     deviceTopics.push(topic_down);
    // });
    // // 客户端链接接收数据后处理
    // client_down.on('message', (topic, buffer) => {
    //     console.log('topic: ' + topic);
    //     console.log('topic: ' + common.getCurrentTime('YYYY-MM-DD HH:mm:ss.SSS') + '>>' + buffer.toString());
    // });
// }

