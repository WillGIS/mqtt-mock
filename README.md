# node-mqtt-mock
This a simple MQTT client for mocking the behaviour of the Tingco Box.



## Get started
1. Clone this repository
2. run `npm install`
3. If you want to configure the address to the MQTT broker set the environment variable `BROKER` to the address you want to use. It will default to `127.0.0.1`.
4. If you want to configure which port the client will use, set the environment variable `PORT` to the port you want to use. It will default to `5000`.
5. run `npm start`


### Trigger a fire alarm
Open your web browser and go to `localhost:5000/fire/alarm/{name}` where `{name}` is the name of the device you want to go off.

### Set battery to low
Open your web browser and go to `localhost:5000/fire/low-battery/{name}` where `{name}` is the name of the device you want to go off.

### Reset the fire topic to default values
Open your web browser and go to `localhost:5000/fire/reset`.
