'use strict';

const defaultValues = {
    messages: [],
};

let state = JSON.parse(JSON.stringify(defaultValues));

const options = {
    qos: 0,
    retain: true,
};

function addMessage(client, boxTopic, message) {
    console.log('exports-addMessage');
}

module.exports = {
    addMessage
};
