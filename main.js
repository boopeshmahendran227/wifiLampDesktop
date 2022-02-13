const { app, BrowserWindow } = require("electron");
const debug = require("debug")("wifilamp:server");
const http = require("http");
const expressApp = require("./app");

const port = 3000;
expressApp.set("port", 3000);

const server = http.createServer(expressApp);

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 676,
    autoHideMenuBar: true,
  });

  win.loadFile("index.html");
}

app.whenReady().then(() => {
  server.listen(3000);
  server.on("error", onError);
  server.on("listening", onListening);

  createWindow();
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
    default:
      throw error;
  }
}
