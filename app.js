const BeaconScanner = require('node-beacon-scanner');
const scanner = new BeaconScanner();
const mqtt = require('mqtt')
const fs = require('fs');
const { error } = require('console');
require('dotenv').config()

const ca = fs.readFileSync(process.env.CA, 'utf8');
const cert = fs.readFileSync(process.env.CERT, 'utf8');
const key = fs.readFileSync(process.env.KEY, 'utf8');
const endpoint = process.env.ENDPOINT
const topic = "sdk/test/js";

const deviceList = [
  "f2ab73195979",                 
  "6055f9716c62"
]

const client = mqtt.connect(
  {
    host: endpoint,
    protocol: "mqtt",
    clientId: "sdk-nodejs-v2",
    clean: true,
    key: key,
    cert: cert,
    ca: ca,
    reconnectPeriod: 0,
    debug:true,
  }
);

client.on('connect', function () {
    console.log("Connected!")
})

scanner.onadvertisement = (ad) => {
    const msg = {
        id: ad["id"],
        rssi: ad["rssi"],
        uuid: ad["iBeacon"]["uuid"],
        txPower: ad["iBeacon"]["txPower"]
    }
    const json = JSON.stringify(msg, null, '   ');
    if (deviceList.includes(ad["id"])){
    console.log('iBeacon is found!')
    if (client){
        client.publish(topic, json, { qos: 0, retain: false }, (error) => {
            if (error){
                console.log(error)
            }
        })
    }
  }
  console.log(json)
};

// Start scanning
scanner.startScan().then(() => {
    console.log('Started to scan.')  ;
}).catch((error) => {
    console.error(error);
});