'use strict';
const messages = require('./messages');

const defaultValues = {
  activities: [],
  sensors: [
    {
      id: 'abc123',
      name: 'Front door',
      roomName: 'Entre',
      roomId: 'room1',
      batteryLevel: 65,
      alarmActive: false,
      online: true,
      silenced: false,
    }, {
      id: 'abc124',
      name: 'Livingroom window',
      roomName: 'Livingroom',
      roomId: 'room2',
      batteryLevel: 32,
      alarmActive: false,
      online: true,
      silenced: false,
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
    state.sensors.forEach((device) => {
      device.silenced = true;
    });

    updateLog({
      activity: message.command,
      text: 'confrimed by ' + message.username,
      title: 'Situation under control',
      reportedBy: message.username,
    })
    
    sendStatus(client, boxTopic);
  }
}

function triggerAlarm(client, boxTopic, id) {
  state.sensors.forEach((device) => {
    if (device.id.toLowerCase() === id.toLowerCase()) {
      updateLog({
        activity: 'MOTION_DETECED',
        text: 'Detected in ' + device.roomName + ' - ' + device.name,
        title: 'Motion detected!',
      });
      device.alarmActive = true;
    }
  });

  sendStatus(client, boxTopic);
}

function triggerLowBattery(client, boxTopic, id) {
  state.sensors.forEach((device) => {
    if (device.id.toLowerCase() === id.toLowerCase()) {
      device.batteryLevel = 10;

      const text = 'The motion detector in '+ device.roomName + ' (' + device.name + ') is running low on battery';
      updateLog({
        activity: 'LOW_BATTERY',
        text,
        title: 'Battery running low',
      })
        
      messages.addMessage(client, boxTopic, {
        id: 'message-'+Math.random(),
        text,
        deviceId: device.id,
        feature: 'burglar',
      });
    }
  });

  sendStatus(client, boxTopic);
}

function reset(client, boxTopic) {
  state = JSON.parse(JSON.stringify(defaultValues));
  sendStatus(client, boxTopic);
}

function burglarHasLeft(client, boxTopic) {
  state.sensors.forEach((device) => {
    device.alarmActive = false;
    device.silenced = false;
  });

  updateLog({
    activity: 'BURGLAR_HAS_LEFT',
    text: 'The burglar has left. Situation under control',
    title: 'Burglar has left',
  });

  sendStatus(client, boxTopic);
}

function sendStatus(client, boxTopic) {
  const topic = boxTopic+'/burglar/status';
  client.publish(topic, JSON.stringify(state), options);
}

function updateLog(event) {
  event.date = new Date().toISOString();
  state.activities.unshift(event);
  state.activities = state.activities.splice(0, 5);
}

module.exports = {
  sendStatus,
  triggerAlarm,
  triggerLowBattery,
  changeStatus,
  reset,
  burglarHasLeft,
};
