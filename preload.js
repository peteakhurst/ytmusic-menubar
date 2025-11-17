const { contextBridge, ipcRenderer } = require("electron");

function getNowPlaying() {
  const titleEl = document.querySelector("ytmusic-player-bar yt-formatted-string.title");
  const artistEl = document.querySelector("ytmusic-player-bar yt-formatted-string.byline");
  const albumArtEl = document.querySelector("ytmusic-player-bar img");

  const title = titleEl?.textContent?.trim() || "";
  const artist = artistEl?.textContent?.trim() || "";
  const artwork = albumArtEl?.src || "";

  // ---- RELIABLE isPlaying DETECTION ----
  let isPlaying = false;

  try {
    // YouTube Music uses an HTMLMediaElement (video or audio)
    const mediaEl =
      document.querySelector("video") ||
      document.querySelector("audio");

    if (mediaEl) {
      // HTMLMediaElement.paused is the canonical source of truth
      isPlaying = !mediaEl.paused;
    } else {
      // Fallback: check play/pause button title/aria-label
      const pauseBtn =
        document.querySelector('tp-yt-paper-icon-button[title="Pause"]') ||
        document.querySelector('button[title="Pause"]') ||
        document.querySelector('[aria-label*="Pause"]');

      const playBtn =
        document.querySelector('tp-yt-paper-icon-button[title="Play"]') ||
        document.querySelector('button[title="Play"]') ||
        document.querySelector('[aria-label*="Play"]');

      if (pauseBtn) isPlaying = true;
      else if (playBtn) isPlaying = false;
    }
  } catch (e) {
    console.log("Error detecting isPlaying:", e);
  }

  // Debug: you can comment this out later
  console.log("Now playing payload =>", { title, artist, isPlaying });

  ipcRenderer.send("now-playing-update", {
    title,
    artist,
    artwork,
    isPlaying
  });
}

window.addEventListener("DOMContentLoaded", () => {
  console.log("PRELOAD RUNNING");
  setInterval(getNowPlaying, 1500);
  getNowPlaying();
});

contextBridge.exposeInMainWorld("ytmDebug", { getNowPlaying });