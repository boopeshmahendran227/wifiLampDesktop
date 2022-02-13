const REQUEST_INTERVAL = 200;

let lightStatusMap = {};

function init() {
  pollStatus();

  // UI render loop
  renderUI();
  setInterval(() => {
    renderUI();
  }, 100);
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

function renderTableUI(lights, element) {
  const rowCount = 2;
  const columnCount = Math.max(3, Math.ceil(lights.length / rowCount));

  // clear element
  let index = 0;
  let content = "";

  const maxLength = lights.reduce((a, b) => Math.max(a, b.length), 0);

  for (let i = 0; i < rowCount; ++i) {
    content += "<tr>";
    for (let j = 0; j < columnCount; ++j) {
      if (index < lights.length) {
        content += `<td><tt>${lights[index].toString().padStart(' ', maxLength)}</tt></td>`;
      } else {
        content += `<td><tt style='opacity: 0'>${"1".repeat(
          maxLength
        )}</tt></td>`;
      }
      index++;
    }
    content += "</tr>";
  }

  element.innerHTML = content;
}

function pollStatus() {
  setInterval(function () {
    fetch(`http://localhost:3000/lights/status`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("socket timedout");
        }
        return res.json();
      })
      .then((res) => {
        lightStatusMap = res;
      });
  }, REQUEST_INTERVAL);
}

var dateTime = document.getElementById("dateTime");

setInterval(() => {
  dateTime.innerHTML = formatAMPM();
}, 1000);


function formatAMPM() {
  var date = new Date();
  return date.getDate().toString().padStart(2, '0') + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + "<br/>" + date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0') + ':' + date.getSeconds().toString().padStart(2, '0');
}

init();
