require('dotenv').config();
const OS = require('os');
const COAP = require('coap');
const DEVICE = COAP.createServer();
var observed = false,
	observe_response,
	timeoutObj;

const streamData = () => {
	timeoutObj = setInterval(function() {
		let ts = new Date();
		let payload = JSON.stringify({
			freeMemory: OS.freemem(),
			avgLoad: OS.loadavg()[1],
			timeStamp: ts,
		});
		console.log(payload);
		observe_response.write(payload + '\n');
	}, process.env.TIMEOUT);
};

DEVICE.on('request', function(req, res) {
	if (req.headers['Observe'] === 0) {
		if (!observed) {
			observe_response = res;
			observed = true;
			console.log('>>> observe start <<<');
			streamData();
		}
	} else {
		clearInterval(timeoutObj);
		console.log('>>> observe stop <<<');
		res.end('ok');
	}
});

DEVICE.listen(() => {
	console.log('coap server started on port 5683');
});
