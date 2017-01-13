'use strict';

const mqtt = require('mqtt');
const broker = process.env.BROKER || '127.0.0.1';
const client = mqtt.connect('mqtt://'+broker);

const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

const fire = require('./topics/fire');
const messages = require('./topics/messages');
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

    case boxTopic+'/messages/status':
      return console.log(message);

    case boxTopic+'/fire/commands':
   	  return fire.changeStatus(client, boxTopic, message);

   	case boxTopic+'/messages/commands':
   	  return messages.changeStatus(client, boxTopic, message);
  }
});

app.get('/fire/alarm/:id', function (req, res) {
  fire.triggerAlarm(client, boxTopic, req.params.id);
  res.send('Fire alarm triggered for '+req.params.id);
});

app.get('/fire/low-battery/:id', function (req, res) {
  fire.triggerLowBattery(client, boxTopic, req.params.id);
  res.send('Low battery triggered for '+req.params.id);
});

app.get('/fire/reset', function (req, res) {
  fire.reset(client, boxTopic);
  res.send('The fire alarm state has been set to default.');
});

app.get('/fire/smoke-cleared', function (req, res) {
  fire.smokeCleared(client, boxTopic);
  res.send('Smoke cleared is now triggered.');
});

app.listen(port, function () {
  console.log('The app listening on port ' + port);
});
