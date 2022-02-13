var express = require("express");
var router = express.Router();
var net = require("net");
const modbus = require("jsmodbus");

const SOCKET_TIMEOUT_DURATION = 4000;
const PORT = 80;

const lights = [
  { ip: "10.13.25.40", name: "L1" },
  { ip: "10.13.25.41", name: "R1" },
  { ip: "10.13.25.42", name: "L2" },
  { ip: "10.13.25.43", name: "R2" },
  { ip: "10.13.25.44", name: "L3" },
  { ip: "10.13.25.45", name: "R3" },
  { ip: "10.13.25.46", name: "L4" },
  { ip: "10.13.25.47", name: "R4" },
  { ip: "10.13.25.48", name: "L5" },
  { ip: "10.13.25.49", name: "R5" },
  { ip: "10.13.25.50", name: "L6" },
  { ip: "10.13.25.51", name: "R6" },
  { ip: "10.13.25.52", name: "L7" },
  { ip: "10.13.25.53", name: "R7" },
  { ip: "10.13.25.54", name: "L8" },
  { ip: "10.13.25.55", name: "R8" },
  { ip: "10.13.25.56", name: "L9" },
  { ip: "10.13.25.57", name: "R9" },
  { ip: "10.13.25.58", name: "L10" },
  { ip: "10.13.25.59", name: "R10" },
  { ip: "10.13.25.60", name: "L11" },
  { ip: "10.13.25.61", name: "R11" },
  { ip: "10.13.25.62", name: "L12" },
  { ip: "10.13.25.63", name: "R12" },
  { ip: "10.13.25.64", name: "L13" },
  { ip: "10.13.25.65", name: "R13" },
  { ip: "10.13.25.66", name: "L14" },
  { ip: "10.13.25.67", name: "R14" },
  { ip: "10.13.25.68", name: "L15" },
  { ip: "10.13.25.69", name: "R15" },
  { ip: "10.13.25.70", name: "L16" },
  { ip: "10.13.25.71", name: "R16" },
  { ip: "10.13.25.72", name: "R16" },
  { ip: "10.13.25.73", name: "R16" },
  { ip: "10.13.25.74", name: "R16" },
  { ip: "10.13.25.75", name: "R15" },
  { ip: "10.13.25.76", name: "K1" },
  { ip: "10.13.25.77", name: "K2" },
  { ip: "10.13.25.78", name: "K3" },
  { ip: "10.13.25.79", name: "K4" },
  { ip: "10.13.25.80", name: "K5" },
  { ip: "10.13.25.81", name: "K6" },
  { ip: "10.13.25.82", name: "K7" },
  { ip: "10.13.25.83", name: "K8" },
  { ip: "10.13.25.84", name: "K9" },
  { ip: "10.13.25.85", name: "K10" },
  { ip: "10.13.25.86", name: "K11" },
  { ip: "10.13.25.87", name: "K12" },
  { ip: "10.13.25.88", name: "K13" },
  { ip: "10.13.25.89", name: "K14" },
  { ip: "10.13.25.90", name: "K15" },
  { ip: "10.13.25.91", name: "K16" },
  { ip: "10.13.25.92", name: "K17" },
  { ip: "10.13.25.93", name: "K18" },
  { ip: "10.13.25.94", name: "K19" },
  //{ ip: "10.13.25.95", name: "K20" },
  { ip: "10.13.25.96", name: "FL1", seperatePlc: true, },
  { ip: "10.13.25.97", name: "FL2", seperatePlc: true, },
  { ip: "10.13.25.98", name: "FL3", seperatePlc: true, },
  { ip: "10.13.25.99", name: "FL4", seperatePlc: true, },
  { ip: "10.13.25.100", name: "FL5", seperatePlc: true, },
  { ip: "10.13.25.101", name: "FL6", seperatePlc: true, },
  { ip: "10.13.25.102", name: "FL7", seperatePlc: true, },
  { ip: "192.168.43.31", name: "K20" },
];

const currentReqMap = {};
const statusMap = {};
const lightsMap = {};

lights.forEach((l) => {
  statusMap[l.name] = {
    redStatus: "0",
    yellowStatus: "0",
    greenStatus: "0",
  };

  lightsMap[l.name] = l;
});

const sound = require('sound-play')
const path = require("path");
const redSoundFilePath = path.join(__dirname, "Alert2.mp3");
const yellowSoundFilePath = path.join(__dirname, "Alert5.mp3");


let isRedSoundPlaying = false;
let isYellowSoundPlaying = false;

async function startRedSound() {
  isRedSoundPlaying = true;
  await sound.play(redSoundFilePath);
  isRedSoundPlaying = false;
}

async function startYellowSound() {
  isYellowSoundPlaying = true;
  await sound.play(yellowSoundFilePath);
  isYellowSoundPlaying = false;
}

lights.forEach(i => pollStatus(i));

function pollStatus(i) {
  setInterval(() => getStatus(i), 1000);
}

const pcbIp = "10.13.25.103";
const pcbIp2 = "10.13.25.95";

const socketMap = {};

createPcbSocket(pcbIp);
createPcbSocket(pcbIp2);

function startPcbsocket(ip, isRed, turnOnPlc) {
  if (turnOnPlc) {
    const socket = new net.Socket()
    const options = {
      'host': '10.13.25.105',
      'port': '80'
    }
    const client = new modbus.client.TCP(socket)
    socket.on('connect', function () {
      client.writeHoldingRegister(1, isRed)
        .then(function (resp) {
          socket.end()
        }).catch(function () {
          socket.end()
        })
    })
    socket.on('error', () => {})
    socket.connect(options);
  }
  if (!socketMap[ip]) return;
  socketMap[ip].write(isRed ? "R:1\r" : "R:0\r");
}

function createPcbSocket(ip) {
  const p = new net.Socket();

  p.connect(PORT, ip, function () {
    socketMap[ip] = p;
  });

  p.on("error", function (err) {
    p.destroy();
    socketMap[ip] = null;
    createPcbSocket(ip);
  });
}

function initPcbPolling() {
  setInterval(() => {
    let isRed = false;
    let isAnyRed = false;
    let isAnyYellow = false;
    for (const name in statusMap) {
      if (statusMap[name].redStatus === "1" && !lightsMap[name].seperatePlc) {
        isRed = true;
        break;
      }
    }

    for (const name in statusMap) {
      if (statusMap[name].redStatus === "1") {
        isAnyRed = true;
      }
      if (statusMap[name].yellowStatus === "1") {
        isAnyYellow = true;
      }
    }

    if (isAnyRed) {
      if (!isRedSoundPlaying) {
        startRedSound();
      }
    }
    else if (isAnyYellow && !isYellowSoundPlaying) {
      startYellowSound();
    }

    startPcbsocket(pcbIp, isRed, true);
  }, 500);
}

function initPcbPolling2() {
  setInterval(() => {
    let isRed = false;
    for (const name in statusMap) {
      if (statusMap[name].redStatus === "1" && lightsMap[name].seperatePlc) {
        isRed = true;
        break;
      }
    }

    startPcbsocket(pcbIp2, isRed, false);
  }, 500);
}

initPcbPolling();
initPcbPolling2();

function getStatus(i) {
  const ipAddress = i.ip;
  const name = i.name;

  if (currentReqMap[ipAddress]) return;

  currentReqMap[ipAddress] = 1;

  var redStatus, yellowStatus, greenStatus;
  var statusData = "";

  var client = new net.Socket();
  
  var timeout = setTimeout(() => {
    client.destroy();
    statusMap[name] = {
      redStatus: "0",
      yellowStatus: "0",
      greenStatus: "0",
    };
  }, SOCKET_TIMEOUT_DURATION);


  client.connect(PORT, ipAddress, function () {
    client.write("STATUS\r");
  });

  client.on("data", function (data) {
    statusData += data;

    if (data.includes("BLUE") || data.includes("GREEN")) {
      clearTimeout(timeout);

      redStatus = statusData[4];
      yellowStatus = statusData[14];
      greenStatus = statusData[23];

      client.destroy();
      statusMap[name] = {
        redStatus: redStatus,
        yellowStatus: yellowStatus,
        greenStatus: greenStatus,
      };
      currentReqMap[ipAddress] = 0;
    }
  });

  client.on("close", function () {
    currentReqMap[ipAddress] = 0;
  });
  client.on("error", function (err) {
    currentReqMap[ipAddress] = 0;
    // console.log(err);
  });
}

router.get("/status", function (req, res, next) {
  res.json(statusMap);
});

module.exports = router;
