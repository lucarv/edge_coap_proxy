'use strict';
const COAP = require('coap');
const COAP_SERVER = COAP.createServer();
COAP_SERVER.listen(5683);

var Transport = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').ModuleClient;
var Message = require('azure-iot-device').Message;
var this_client;
var devices = [];

const observeDevice = (observe) => {
  var options = {
    hostname: observe.device.ip_address,
    port: 5683,
    method: 'GET',
    pathname: '/',
    observe: true
  };
  if (observe.state) {
    console.log(`start observing ${observe.device.ip}`);
    options.observe = true;
  } else {
    console.log(`stop observing ${observe.device.ip}`);
    options.observe = false;
  }

  try {
    var coap_req = COAP.request(options);
  }
  catch (err) {
    console.log(err);
  }

  coap_req.on('response', function (coap_res) {
    coap_res.on('data', function (payload) {
      let device = devices.find(device => device.ip === coap_res.rsinfo.address);
      let msg = payload.toString('utf8')
      if (msg === 'ok') {
        console.log(`observation stopped on ${device.id}`);
      } else {
        let jmsg = JSON.parse(msg);
        jmsg.deviceId = device.id;
        this_client.sendOutputEvent('coap_post', new Message(JSON.stringify(jmsg)), printResultFor('Sending received message'));
      }
    });
  });

  coap_req.end();
};

Client.fromEnvironment(Transport, function (err, client) {
  if (err) {
    console.log('fail to start')
    throw err;
  } else {
    console.log('start')

    this_client = client;
    client.on('error', function (err) {
      console.log('failed to start client')
      throw err;
    });

    // connect to the Edge instance
    client.open(function (err) {
      if (err) {
        console.log('failed to connect client to edge hub')
        throw err;
      } else {
        console.log('IoT Hub module client initialized');
        this_client = client;

        // Act on input messages to the module.
        client.on('inputMessage', function (inputName, msg) {
          pipeMessage(client, inputName, msg);
        });

        client.getTwin(function (err, twin) {
          if (err) {
            console.error('Error getting twin: ' + err.message);
          } else {
            twin.on('properties.desired', function (delta) {
              if (delta.hasOwnProperty('observe')) {
                console.log('Twin update received: ' + JSON.stringify(delta));
                devices.push(delta.observe.device);
                observeDevice(delta.observe);
              }
            });
          }
        });
      }
    });
  }
});


// This function just pipes the messages without any change.
function pipeMessage(client, inputName, msg) {
  client.complete(msg, printResultFor('Receiving message'));

  if (inputName === 'input1') {
    var message = msg.getBytes().toString('utf8');
    if (message) {
      var outputMsg = new Message(message);
      client.sendOutputEvent('output1', outputMsg, printResultFor('Sending received message'));
    }
  }
}

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) {
      console.log(op + ' error: ' + err.toString());
    }
    if (res) {
      console.log(op + ' status: ' + res.constructor.name);
    }
  };
}