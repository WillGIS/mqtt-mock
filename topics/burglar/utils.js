'use strict';

const ONE_SECOND = 1000;
const ALARM_DELAY = 40000;

function sendStatus(client, boxTopic, state, retain) {
  const topic = boxTopic+'/burglar/status';
  client.publish(topic, JSON.stringify(state), { retain, qos: 1 });
}

function updateLog(event, state) {
  event.date = new Date().toISOString();
  state.activities.unshift(event);
  state.activities = state.activities.splice(0, 5);
}

function getSensor(deviceName, state) {
  return new Promise((resolve, reject) => {
    resolve(state.sensors.filter(sensor => {
      return sensor.deviceName === deviceName;
    })[0]);
  });
}

function deviceIncludedInCurrentConfiguration(device, state) {
  return device.configurations.filter((configuration) => {
      return configuration === state.configuration;
    }).length > 0;
}


function addSensorActivity(client, boxTopic, sensor, state) {
  function getTitle(type) {
    switch (type) {
    case 'WINDOW_SENSOR':
      return 'Window opened';
    case 'DOOR_SENSOR':
      return 'Door opened';
    default:
      return 'Motion detected';
    }
  }

  updateLog({
      activity: 'TRIGGERED',
      text: getTitle(sensor.deviceType),
      title: 'Detected in ' + sensor.roomName,
      reportedBy: 'Tingco Box',
    }, state);
}

function triggerSensor(client, boxTopic, sensor, delayInSeconds, state) {
  return new Promise((resolve, reject) => {
  // Delay the promise resolving

    setTimeout(() => {
      if (!!state.inAFlow) {
        console.log('-----------------------------------------------');
        console.warn('SENSOR THAT SHOULD BE TRIGGERED:');
        console.warn(sensor);
        console.log('-----------------------------------------------');
        if (deviceIncludedInCurrentConfiguration(sensor, state) && sensor.enabled) {

          /**
           * If sensor is included in the chosen configuration and it is enabled,
           * it should always be set to triggered.
           **/
          sensor.triggered = true;
          addSensorActivity(client, boxTopic, sensor, state);

          /**
          * If this is the first sensor that is triggered and the device
          * should not directly set off the alarm
          **/
          if (state.state !== 'ALARM_TRIGGERED' &&
              state.state !== 'DELAYED_ALARM_TRIGGERED' && sensor.delayed) {
            let interval;
            let passedMilliSeconds = 0;
            interval = setInterval(() => {
              if (!!state.inAFlow) {
                /**
                 * Start with increasing the counter
                 **/
                passedMilliSeconds += ONE_SECOND;

                if (state.state !== 'ALARM_TRIGGERED' && passedMilliSeconds < ALARM_DELAY) {
                  /**
                   * calculate the countdown to send out
                   **/
                  state.secondsToNextState = (ALARM_DELAY - passedMilliSeconds) / ONE_SECOND;
                  if (state.state !== 'ALARM_TRIGGERED' && state.state !== 'DELAYED_ALARM_TRIGGERED') {
                    state.state = 'DELAYED_ALARM_TRIGGERED';
                    state.secondsToNextState = null;
                  }

                  sendStatus(client, boxTopic, state, false);

                } else {
                  /**
                   * The time is up. Time to let the alarm go off for real!
                   **/
                  state.secondsToNextState = null;
                  state.state = 'ALARM_TRIGGERED';

                  sendStatus(client, boxTopic, state, true);
                  clearInterval(interval);
                }
              } else {
                clearInterval(interval);
                reject();
              }
            }, ONE_SECOND);
          } else {
            state.state = 'ALARM_TRIGGERED';
            sendStatus(client, boxTopic, state, true);
          }
        }
        resolve();
      } else {
        reject();
      }
    }, delayInSeconds * ONE_SECOND);
  });
}

module.exports = {
	getSensor,
  triggerSensor,
  updateLog,
  sendStatus,
}