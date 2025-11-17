const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  ipcMain,
  nativeImage
} = require("electron");
const path = require("path");

let mainWindow;
let tray;
let nowPlayingTitle = "Nothing playing";

// marquee state
let marqueeBase = "";
let marqueeIndex = 0;
let marqueeTimer = null;

function ensureAutoLaunch() {
  if (process.platform !== "darwin") return; // you're on mac, but good to be safe

  const settings = app.getLoginItemSettings();
  if (!settings.openAtLogin) {
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: true // start hidden; tray will still be there
    });
  }
}

function createWindow() {
  // This window is the *real* YouTube Music player
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    show: true, // show on first launch so you can log in and control it
    title: "YouTube Music",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL("https://music.youtube.com/");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createTray() {
  // Text-only tray item: empty image, we only use setTitle()
  const emptyImage = nativeImage.createEmpty();
  tray = new Tray(emptyImage);
  tray.setToolTip("YouTube Music");

  const buildMenu = () =>
    Menu.buildFromTemplate([
      {
        label: nowPlayingTitle || "Nothing playing",
        enabled: false
      },
      { type: "separator" },
      {
        label: "Show / Hide Player",
        click: toggleWindow
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => app.quit()
      }
    ]);

  tray.setContextMenu(buildMenu());
  tray._buildMenu = buildMenu;

  // Click on tray to show/hide the player window
  tray.on("click", toggleWindow);

  // Start marquee with initial text
  startMarquee(nowPlayingTitle);
}

function toggleWindow() {
  if (!mainWindow) {
    createWindow();
    return;
  }
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
  }
}

// ---- Marquee logic ----

function stopMarquee(text) {
  if (marqueeTimer) {
    clearInterval(marqueeTimer);
    marqueeTimer = null;
  }

  // show static text (truncate to fit tray width)
  const maxChars = 16;
  const display = text.slice(0, maxChars);

  tray.setTitle(display);
}

function startMarquee(text) {
  marqueeBase = (text || "Nothing playing").toString().trim();
  marqueeIndex = 0;

  if (!tray) return;

  if (marqueeTimer) {
    clearInterval(marqueeTimer);
    marqueeTimer = null;
  }

  // Draw once immediately
  stepMarquee();

  // Update every 800ms → calmer + less jitter
  marqueeTimer = setInterval(stepMarquee, 800);
}

function stepMarquee() {
  if (!tray) return;

  const maxChars = 16;   // visible width
  const stepSize = 3;    // how many chars to jump per tick
  const gap = "   ";     // gap between repeats

  const base = marqueeBase.length ? marqueeBase : "Nothing playing";
  const full = base + gap + base + gap;

  if (!full.length) {
    tray.setTitle("");
    return;
  }

  if (marqueeIndex >= full.length) {
    marqueeIndex = 0;
  }

  const end = marqueeIndex + maxChars;
  let display;

  if (end <= full.length) {
    display = full.slice(marqueeIndex, end);
  } else {
    // wrap around
    const firstPart = full.slice(marqueeIndex);
    const secondPart = full.slice(0, end - full.length);
    display = firstPart + secondPart;
  }

  tray.setTitle(display);

  marqueeIndex += stepSize;
  if (marqueeIndex >= full.length) {
    marqueeIndex = 0;
  }
}

// ---- IPC: song updates from preload.js ----

ipcMain.on("now-playing-update", (_event, data) => {
  const { title, artist, isPlaying } = data;
  // on your setup, artist is actually "ARTIST – ALBUM"

  let artistName = "";
  let albumName = "";

  if (artist && artist.length) {
    const parts = artist.split(/\s[–-]\s/);

    artistName = (parts[0] || "").trim();
    albumName = (parts[1] || "").trim();
  }

  const songTitle = (title || "").trim();

  // SONGTITLE – ARTIST – ALBUM
  let composed = songTitle;
  if (artistName) composed += ` – ${artistName}`;
  if (albumName) composed += ` – ${albumName}`;
  if (!composed) composed = "Nothing playing";

  nowPlayingTitle = composed;

  if (tray) {
    tray.setToolTip(nowPlayingTitle);

    // update the first menu item text
    if (typeof tray._buildMenu === "function") {
      tray.setContextMenu(tray._buildMenu());
    }

    if (typeof isPlaying === "boolean") {
      if (!isPlaying) {
        stopMarquee(nowPlayingTitle);   // static title when paused/stopped
      } else {
        startMarquee(nowPlayingTitle);  // scrolling title when playing
      }
    } else {
      // Fallback: if we don't know, assume playing so it still scrolls
      startMarquee(nowPlayingTitle);
    }
  }
});

// ---- App lifecycle ----

app.whenReady().then(() => {

  // Hide from the Dock on macOS
  if (process.platform === "darwin" && app.dock) {
    app.dock.hide();
  }

  createWindow(); // web YT Music player
  createTray();   // tray with scrolling text

  app.on("activate", () => {
    if (!mainWindow) {
      createWindow();
    }
  });
});

// keep app alive so tray stays
app.on("window-all-closed", (event) => {
  event.preventDefault();
});