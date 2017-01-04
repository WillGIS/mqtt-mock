'use strict';

const defaultValues = {
  messages: [
    {
      id: 'message1',
      text: 'Hallabalou',
      deviceId: 'abc123',
      feature: 'fire',
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
      message.command === 'SEEN_MESSAGE' && message.messageId) {
    state.messages.forEach((msg, index) => {
      if (msg.id === message.messageId) {
        state.messages = JSON.parse(JSON.stringify(state.messages.splice(index, 1)));
      }
    });
  }

  sendStatus(client, boxTopic);
}

function addMessage(client, boxTopic, message) {
  state.messages.unshift(message);
  sendStatus(client, boxTopic);
}

function reset(client, boxTopic) {
  state = JSON.parse(JSON.stringify(defaultValues));
  sendStatus(client, boxTopic);
}

function sendStatus(client, boxTopic) {
  const topic = boxTopic+'/messages/status';
  client.publish(topic, JSON.stringify(state), options);
}

module.exports = {
  addMessage,
  changeStatus,
  reset,
};
