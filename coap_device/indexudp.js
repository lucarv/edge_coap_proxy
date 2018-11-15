const dgram = require('dgram'),
  packet = require('coap-packet'),
  parse = packet.parse,
  generate = packet.generate,
  payload = Buffer.from('Hello Muthas'),
  options = [{ name: 'obeserve', value: Buffer.from('0')}, { name: 'Uri-Path', value: Buffer.from('hello') }],

  message = generate({ payload: payload, options: options}),
  port = 5683,
  client = dgram.createSocket("udp4"),
  server = dgram.createSocket("udp4")

server.bind(port, function () {
  client.send(message, 0, message.length, 5683, "51.144.253.157", function (err, bytes) {
    client.close()
  })
})

server.on('message', function (data) {
  console.log(parse(data).payload.toString())
  server.close()
})