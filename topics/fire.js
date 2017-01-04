'use strict';

const messages = require('./topics/messages');

const defaultValues = {
  sensors: [
    {
      id: 'abc123',
      name: 'Kitchen',
      batteryLevel: 65,
      alarmActive: false,
      online: true,
      createdAt: '2016-07-16T19:20:30+01:00',
    }, {
      id: 'abc124',
      name: 'Bedroom',
      batteryLevel: 32,
      alarmActive: false,
      online: true,
      createdAt: '2016-12-04T11:10:43+01:00',
    }, {
      id: 'abc125',
      name: 'Livingroom',
      batteryLevel: 98,
      alarmActive: false,
      online: true,
      createdAt: '2016-04-21T09:24:31+01:00',
    },
  ],
};

let state = JSON.parse(JSON.stringify(defaultValues));

const options = {
  qos: 0,
  retain: true,
};

function changeStatus(client, boxTopic, message) {
  if (!!message.command &&
      message.command === 'SITUATION_UNDER_CONTROL') {
    state.alarms.forEach((device) => {
      device.alarmActive = false;
    });
  }

  sendStatus(client, boxTopic);
}

function triggerAlarm(client, boxTopic, name) {
  state.alarms.forEach((device) => {
    if (device.name.toLowerCase() === name.toLowerCase()) {
      device.alarmActive = true;
    }
  });

  sendStatus(client, boxTopic);
}

function triggerLowBattery(client, boxTopic, name) {
  state.alarms.forEach((device) => {
    if (device.name.toLowerCase() === name.toLowerCase()) {
      foundDevice = device;
      device.batteryLevel = 10;

      messages.addMessage(client, boxTopic, {
          id: 'message-'+Math.random(),
          text: 'Smoke detector in '+ name + 'is running low on battery.',
          deviceId: device.id,
          feature: 'fire',
        });
    }
  });

  sendStatus(client, boxTopic);
}

function reset(client, boxTopic) {
  state = JSON.parse(JSON.stringify(defaultValues));
  sendStatus(client, boxTopic);
}

function sendStatus(client, boxTopic) {
  const topic = boxTopic+'/fire/status';
  client.publish(topic, JSON.stringify(state), options);
}

module.exports = {
  sendStatus,
  triggerAlarm,
  triggerLowBattery,
  changeStatus,
  reset,
};
