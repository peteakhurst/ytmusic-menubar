# 🎵 YouTube Music Menubar
A clean, minimal macOS menu-bar YouTube Music player with scrolling “Now Playing” info.

YouTube Music Menubar runs a lightweight hidden web player (`music.youtube.com`) and displays the currently playing **Song – Artist – Album** directly in your menu bar. The app stays out of the Dock, can launch automatically on login, and gives you a simple toggle to show/hide the full player window.

---

## ✨ Features

- 🎶 **Now Playing in the menu bar**  
  Shows *Song Title – Artist – Album* with optional marquee scrolling.

- 🖥️ **Hidden YouTube Music web player**  
  A hidden Electron window loads `music.youtube.com` and feeds metadata to the menu bar.

- 🍏 **True macOS menu-bar app**  
  - No Dock icon  
  - Optional auto-launch on login  
  - Text-only tray item (no icon needed)  
  - “Show / Hide Player” toggle

- ⏸️ **Smart scrolling logic**  
  - Scrolls while a song is *playing*  
  - Freezes automatically when *paused*

- 🔧 **Local & simple**  
  No API keys, no browser extensions, no account linking.

---

## 📦 Installation

Clone the repo and install dependencies:

```bash
npm install

Build the macOS .app:
```bash
npm run dist

Your packaged app will appear here:
```bash
dist/mac/YouTube Music Menubar.app

Move it into:
```bash
/Applications

## 🚀 Auto-Launch on Login
The app automatically adds itself to: 
```bash
System Settings → General → Login Items → Open at Login

## 🧩 Usage
	•	Click the menu-bar text → show/hide the player window
	•	Tray menu:
	•	Current track info (read-only)
	•	Show/Hide Player
	•	Quit App

Playback works through the hidden YouTube Music window.

## 🛠 Development
```bash 
npm start
```bash 
npm run dist

## 🗂 Project Structure
```bahsh
/
├── main.js            # Electron main process (tray, marquee, hidden player)
├── preload.js         # Scrapes YT Music DOM and sends updates via IPC
├── build/icon.icns    # App icon (macOS)
├── package.json
└── dist/              # Build output (ignored in git)

## 🙌 Credits

### Built with:
	•	Electron
	•	YouTube Music Web Player
	•	macOS status bar APIs

Designed for a simple, elegant YT Music experience on macOS.
