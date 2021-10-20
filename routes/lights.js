var express = require("express");
var router = express.Router();
var net = require("net");

const SOCKET_TIMEOUT_DURATION = 7000;
const PORT = 80;

router.get("/status", function (req, res, next) {
  const ipAddress = req.query.ip;
  var redStatus, yellowStatus, greenStatus;
  var statusData = "";

  var client = new net.Socket();

  var timeout = setTimeout(() => {
    client.destroy();
    res.status(500).json({ error: "Socket timed out" });
  }, SOCKET_TIMEOUT_DURATION);

  console.log("connecting to ", ipAddress);
  client.connect(PORT, ipAddress, function () {
    console.log("Connected");
    client.write("STATUS");
  });

  client.on("data", function (data) {
    console.log("Received: " + data);
    statusData += data;
    if (data.includes("BLUE") || data.includes("GREEN")) {
      clearTimeout(timeout);

      redStatus = statusData[4];
      yellowStatus = statusData[14];
      greenStatus = statusData[23];
      console.log("red status is ", redStatus);
      console.log("yellow status is ", yellowStatus);
      console.log("green status is ", greenStatus);
      client.destroy();
      res.json({
        redStatus: redStatus,
        yellowStatus: yellowStatus,
        greenStatus: greenStatus,
      });
    }
  });

  client.on("close", function () {
    console.log("Connection closed");
  });
  client.on("error", function (err) {
    console.log(err);
  });
});

module.exports = router;
