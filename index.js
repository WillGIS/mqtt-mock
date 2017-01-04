'use strict';

const mqtt = require('mqtt');
const broker = process.env.BROKER || '127.0.0.1';
const client = mqtt.connect('mqtt://'+broker);

const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

const fire = require('./topics/fire');
const boxTopic = 'tingco-home/a4b39b8d-1043-4933-b3bb-f193c44d226c';

client.on('connect', () => {  
  console.log('connected');
  client.subscribe(boxTopic+'/#');

  client.publish(boxTopic+'/box/connected', 'true');

  fire.sendStatus(client, boxTopic);
});

client.on('message', (topic, buffer) => {
  console.log('topic: ' + topic);
  const message = JSON.parse(buffer.toString());
  switch (topic) {
    case boxTopic+'/box/connected':
   	  return console.log(message);

    case boxTopic+'/fire/status':
      return console.log(message);

    case boxTopic+'/fire/commands':
   	  return fire.changeStatus(client, boxTopic, message);
  }
});

app.get('/fire/alarm/:name', function (req, res) {
  fire.triggerAlarm(client, boxTopic, req.params.name);
  res.send('Fire alarm triggered for '+req.params.name);

});

app.get('/fire/low-battery/:name', function (req, res) {
  fire.triggerLowBattery(client, boxTopic, req.params.name);
  res.send('low battery triggered for '+req.params.name);
});

app.listen(port, function () {
  console.log('The app listening on port ' + port);
});
