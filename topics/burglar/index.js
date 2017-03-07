'use strict';

const utils = require('./utils');
const apartment = require('./apartment');
const messages = require('./../messages');

const defaultValues = apartment.defaultState;

let state = JSON.parse(JSON.stringify(defaultValues));
state.inAFlow = false;

function command(client, boxTopic, message) {
  switch(message.command) {
    case 'ARM': 
      return arm(client, boxTopic, message);
    case 'DISARM':
      return disarm(client, boxTopic, message);
  }
}

function apartmentFlow1(client, boxTopic) {
  apartment.flow1(client, boxTopic, state);
}

function triggerLowBattery(client, boxTopic, id) {
  state.sensors.forEach((device) => {
    if (device.deviceId.toLowerCase() === id.toLowerCase()) {
      device.batteryLevel = 10;

      const text = 'The motion detector in '+ device.roomName + ' (' + device.deviceName + ') is running low on battery';
      utils.updateLog({
        activity: 'LOW_BATTERY',
        text,
        title: 'Battery running low',
      }, state);
        
      messages.addMessage(client, boxTopic, {
        id: 'message-'+Math.random(),
        text,
        deviceId: device.deviceId,
        feature: 'burglar',
      });
    }
  });

  utils.sendStatus(client, boxTopic, state);
}

function reset(client, boxTopic) {
  state = JSON.parse(JSON.stringify(defaultValues));
  utils.sendStatus(client, boxTopic, state);
}

function arm(client, boxTopic, message) {
  state.inAFlow = false;
  state.state = 'ARMED';
  state.configuration = !!message.configuration ? message.configuration : 'FULL',
  state.secondsToNextState = null,

  utils.updateLog({
    activity: 'ARMED',
    text: 'Armed by ' + message.username,
    title: 'Burglar alarm armed',
    reportedBy: message.username,
  }, state);

  utils.sendStatus(client, boxTopic, state);
}

function disarm(client, boxTopic, message) {
  /**
   * Start by cancelling ongoing flow
   **/
  if (!!state.inAFlow) {
    state.inAFlow = false;
  }

  state.state = 'DISARMED';
  state.secondsToNextState = null;
  utils.updateLog({
    activity: 'DISARMED',
    text: 'Disarmed by ' + message.username,
    title: 'Burglar alarm disarmed',
    reportedBy: message.username,
  }, state);

  utils.sendStatus(client, boxTopic, state);
}

function sendStatus(client, boxTopic) {
  utils.sendStatus(client, boxTopic, state, true);
}

module.exports = {
  triggerLowBattery,
  reset,
  arm,
  disarm,
  apartmentFlow1,
  command,
  sendStatus,
};
