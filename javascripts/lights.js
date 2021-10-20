console.log("javascript started");
const lights = [{ ip: "192.168.1.50", name: "L0" }];

const REQUEST_INTERVAL = 5000;

let currentReqMap = {};
let lightStatusMap = {};

function init() {
  lights.forEach((l) => {
    lightStatusMap[l.name] = {
      redStatus: "0",
      yellowStatus: "0",
      greenStatus: "0",
    };
  });

  // Start polling lights for status and update light status map
  lights.forEach((l) => {
    pollStatus(l);
  });

  // UI render loop
  renderUI();
  setInterval(() => {
    renderUI();
  }, 2000);
}

const redTable = document.getElementById("redTable");
const yellowTable = document.getElementById("yellowTable");

function renderUI() {
  const redLights = Object.keys(lightStatusMap).filter(
    (name) => lightStatusMap[name].redStatus === "1"
  );
  const yellowLights = Object.keys(lightStatusMap).filter(
    (name) => lightStatusMap[name].yellowStatus === "1"
  );

  renderTableUI(redLights, redTable);
  renderTableUI(yellowLights, yellowTable);
}

function getNumColumns(l) {
  if (l <= 4) {
    return l;
  }
  return 5;
}

function renderTableUI(lights, element) {
  const columnCount = getNumColumns(lights.length);
  const rowCount = Math.ceil(lights.length / columnCount);

  // clear element
  let index = 0;
  let content = "";

  for (let i = 0; i < rowCount; ++i) {
    content += "<tr>";
    for (let j = 0; j < columnCount; ++j) {
      if (index < lights.length) {
        content += `<td>${lights[index]}</td>`;
      } else {
        content += "<td></td>";
      }
      index++;
    }
    content += "</tr>";
  }

  element.innerHTML = content;
}

function pollStatus(l) {
  const ip = l.ip;
  const name = l.name;

  setInterval(function () {
    if (currentReqMap[name]) {
      return;
    }

    fetch(`http://localhost:3000/lights/status?ip=${ip}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("socket timedout");
        }
        return res.json();
      })
      .then((res) => {
        lightStatusMap[name] = res;
      })
      .finally(() => {
        currentReqMap[name] = 0;
      });

    currentReqMap[name] = 1;
  }, REQUEST_INTERVAL);
}

init();
