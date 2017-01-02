'use strict';

const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://127.0.0.1');
const messages = require('./messages');

let state = {
  connected: false,
};

client.on('connect', () => {  
  console.log('connected');
  client.subscribe('box/#');

  client.publish('box/connected', 'true');
});


client.on('message', (topic, message) => {  
  switch (topic) {
    case 'box/connected':
      return messages.box.connected(message, state);
  }
  console.log('No handler for topic %s', topic);
});
