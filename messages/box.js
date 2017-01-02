'use strict';

function connected(message, state) {
  if (message.toString() === 'true') {
    state.connected = true;
    console.log('box is connected');
  }
};

module.exports = {
	connected
};
