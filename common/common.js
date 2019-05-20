'use strict';

var date = require('date-and-time');

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

function getCurrentTime(formate) {
    return date.format(new Date(), formate);
}

module.exports = {
    addMessage,
    getCurrentTime
};
