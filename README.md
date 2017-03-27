# node-mqtt-mock
This a simple MQTT client for mocking the behaviour of the Tingco Box.

The client will subscribe to and publish topics that starts with `user/device/00000000-0000-0000-0000-000000000007`.


## Get started
1. Clone this repository
2. run `npm install`
3. If you want to configure the address to the MQTT broker set the environment variable `BROKER` to the address you want to use. It will default to `127.0.0.1`.
4. If you want to configure which port the client will use, set the environment variable `PORT` to the port you want to use. It will default to `5000`.
5. run `npm start`


### Trigger a fire alarm
Open your web browser and go to `localhost:5000/fire/alarm/{id}` where `{id}` is the name of the device you want to go off.

### Set battery to low
Open your web browser and go to `localhost:5000/fire/low-battery/{id}` where `{id}` is the name of the device you want to go off.

### Set smoke cleared
Open your web browser and go to `localhost:5000/fire/smoke-cleared`.

### Reset the fire topic to default values
Open your web browser and go to `localhost:5000/fire/reset`.

### Sending situation under control
If you are running mosquitto on your machine, you can try to publish a 'situation under control' message by running the following in your terminal:
`mosquitto_pub -h 127.0.0.1 -t user/device/00000000-0000-0000-0000-000000000007/fire/command -m '{ "command": "SITUATION_UNDER_CONTROL" }'`

### Sending seen message
If you are running mosquitto on your machine, you can try to publish a 'seen message' message by running the following in your terminal:
`mosquitto_pub -h 127.0.0.1 -t user/device/00000000-0000-0000-0000-000000000007/messages/command -m '{ "command": "SEEN_MESSAGE", "messageId": "message1" }'`