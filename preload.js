// preload.js
const { contextBridge, ipcRenderer } = require('electron');

function getNowPlaying() {
  const titleEl = document.querySelector('.title.ytmusic-player-bar');
  const artistEl = document.querySelector('.byline.ytmusic-player-bar');
  const albumArtEl = document
    .querySelector('ytmusic-player-bar img') || document.querySelector('img.ytmusic-player-bar');

  const title = titleEl?.textContent?.trim() || '';
  const artist = artistEl?.textContent?.trim() || '';
  const artwork = albumArtEl?.src || '';

  ipcRenderer.send('now-playing-update', { title, artist, artwork });
}

window.addEventListener('DOMContentLoaded', () => {
  // Poll every 2s – cheap enough
  setInterval(getNowPlaying, 2000);
  getNowPlaying();
});

// Optional: expose a debug API if you want to poke from devtools
contextBridge.exposeInMainWorld('ytmDebug', { getNowPlaying });