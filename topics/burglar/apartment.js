'use strict';

const utils = require('./utils');

const defaultState = {
  state: 'DISARMED',
  configuration: 'FULL',
  secondsToNextState: null,
  sensors: [
    {
      deviceId: 'abc123',
      deviceName: 'Entrance',
      roomName: 'Hallway',
      deviceType: 'DOOR_SENSOR',
      configurations: ['SHELL', 'FULL'],
      roomId: 'room1',
      batteryLevel: 65,
      online: true,
      delayed: true,
      triggered: false,
      enabled: true,
    }, {
      deviceId: 'abc124',
      deviceName: 'Livingroom motion',
      roomName: 'Livingroom',
      deviceType: 'MOTION_SENSOR',
      configurations: ['FULL'],
      roomId: 'room2',
      batteryLevel: 82,
      online: true,
      delayed: false,
      triggered: false,
      enabled: true,
    }, {
      deviceId: 'abc125',
      deviceName: 'Bedroom motion',
      roomName: 'Bedroom',
      deviceType: 'MOTION_SENSOR',
      configurations: ['FULL'],
      roomId: 'room3',
      batteryLevel: 71,
      online: true,
      delayed: false,
      triggered: false,
      enabled: true,
    }, 
  ],
  activities: [
    {
      id: 'asdfasdf-12323423-asdfasdf',
      activity: 'DISARMED',
      reportedBy: 'johan.broqvist.test@tingco.com',
      title: 'Your home alarm was disarmed',
      text: 'johan.broqvist.test@tingco.com disarmed your home alarm.',
      date: new Date().toISOString(),
    }
  ],
};

function flow1(client, boxTopic, state) {
  if (state.state === 'ARMED') {
    state.inAFlow = true;
    console.log('The burglar has started! Apartment Flow 1 is playing!');
    return new Promise((resolve, reject) => {
      return utils.getSensor('Entrance', state)
      .then((sensor) => {
        return utils.triggerSensor(client, boxTopic, sensor, 0, state);
      }).then(() => {
        console.log('-----------------------------------------------');
        console.log('The door sensor is triggered');
        console.log('-----------------------------------------------');
        return utils.getSensor('Livingroom motion', state);
      }).then((sensor) => {
        return utils.triggerSensor(client, boxTopic, sensor, 13, state);
      }).then(() => {
        console.log('-----------------------------------------------');
        console.log('Motion sensor in livingroom is triggered');
        console.log('-----------------------------------------------');
        return utils.getSensor('Bedroom motion', state);
      }).then((sensor) => {
        return utils.triggerSensor(client, boxTopic, sensor, 63, state);
      }).then(() => {
        console.log('-----------------------------------------------');
        console.log('Motion sensor in Bedroom is triggered');
        console.log('-----------------------------------------------');

        console.log('-----------------------------------------------');
        console.log('No more events in this flow so after this the thief probably left...');
        console.log('-----------------------------------------------');
      }).catch(error => {
        console.log(error);
        console.log('-----------------------------------------------');
        console.warn('The breakin stopped for some reason. Probably the alarm got disarmed');
        console.log('-----------------------------------------------');
      });
    });
  }
}

module.exports = {
  defaultState,
  flow1,
};