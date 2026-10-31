// Shared mutable application state (main window & game process references).
// Values are assigned in desktop/main.js and read by IPC handler modules.
export const appState = {
  mainWindow: null,
  gameProcess: null,
};
