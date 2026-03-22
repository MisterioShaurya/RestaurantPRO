const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const isDev = process.env.NODE_ENV === "development";

let nextServer = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    center: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
  } else {
    // Start Next.js server in production
    const nextBin = path.join(__dirname, "node_modules", ".bin", "next");
    nextServer = spawn("node", [nextBin, "start", "-p", "3000"], {
      cwd: __dirname,
      stdio: "inherit",
      shell: true,
    });

    // Wait for server to start
    setTimeout(() => {
      win.loadURL("http://localhost:3000");
    }, 3000);
  }

  win.on("closed", () => {
    if (nextServer) {
      nextServer.kill();
    }
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (nextServer) {
    nextServer.kill();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});