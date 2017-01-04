'use strict';

let status = {
  alarmActive: false,
  alarms: [
    {
      id: 'abc123',
      name: 'Kitchen',
      batteryLevel: 6,
      alarmActive: false,
      createdAt: '2016-07-16T19:20:30+01:00',
    }, {
      id: 'abc124',
      name: 'Bedroom',
      batteryLevel: 3,
      alarmActive: false,
      createdAt: '2016-12-04T11:10:43+01:00',
    }, {
      id: 'abc125',
      name: 'Livingroom',
      batteryLevel: 9,
      alarmActive: false,
      createdAt: '2016-04-21T09:24:31+01:00',
    },
  ],
};

const options = {
  qos: 0,
  retain: true,
};

function changeStatus(client, boxTopic, message) {
  if (!!message.command &&
      message.command === 'SITUATION_UNDER_CONTROL') {
    console.log('jepp, situation is under control');
    status.alarmActive = false,
    status.alarms.forEach((device) => {
      device.alarmActive = false;
    });
  }

  sendStatus(client, boxTopic);
}

function triggerAlarm(client, boxTopic, name) {
  status.alarms.forEach((device) => {
    if (device.name.toLowerCase() === name.toLowerCase()) {
      device.alarmActive = true;
    }
  });
  status.alarmActive = true;

  sendStatus(client, boxTopic);
}

function triggerLowBattery(client, boxTopic, name) {
  status.alarms.forEach((device) => {
    if (device.name.toLowerCase() === name.toLowerCase()) {
      device.batteryLevel = 1;
    }
  });

  sendStatus(client, boxTopic);
}

function sendStatus(client, boxTopic) {
  const topic = boxTopic+'/fire/status';
  console.log(topic);

  client.publish(topic, JSON.stringify(status),
      options, () => {
    console.log('Fire status has been sent.');
  });
};

module.exports = {
	sendStatus,
  triggerAlarm,
  triggerLowBattery,
  changeStatus,
};
