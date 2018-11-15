# What is this?
An app that can be used to create an azure iot edge module that acts as a coap proxy.  
It allows a coap device to be observed and subsequently sending telemetry to the proxy module.  

## Instructions

1. Clone this repo and create a docker image using the included Dockerfile. 
2. Upload the image to an image repository (you can use docker hub or create a private repo in Azure) Provision an edge device by following this [tutorial](https://docs.microsoft.com/en-us/azure/iot-edge/quickstart-linux)
3. In the section _Deploy a module_, enter the details for this module (ignore item 7)
4. Edit the Container Creation Options. COAP's default port is 5863, and you need to expose it in your host. Enter the string   
**"{\"HostConfig\":{\"PortBindings\":{\"5863/udp\":[{\"HostPort\":\"5863\"}]}}}"**  
to expose the COAP Port
5. Start your COAP device (the FW needs to implement the OBSERVE funcion).  
If you don't have a coap device, a simulated device is available in this repo under the folder simulated_device. Note the IP address of the device.
6. In the Azure Portal, modify the device desired properties, enter:  
{"observe: {"device": {"ip": THE IP ADDRESS OF YOUR DEVICE, "id": CHOOSE A DEVICE ID}, "state": true}}
7. The device telemetry is sent to IoT Hub


  
