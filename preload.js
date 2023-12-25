// 开发者可以暴露自定义 API 供后加载脚本使用
// preload.js 中使用 nodejs
const { ipcRenderer } = require("electron");

function createDesktopWindow() {
  desktopWindow = utools.createBrowserWindow(
    "./index/index.html",
    {
      show: false,
      title: "desktop",
      webPreferences: {
        // devTools: true,
        preload: "./index/preload.js",
      },
      frame: false,
      transparent: true,
      backgroundColor: "#00000000",
      alwaysOnTop: true,
      resizable: false,
      movable: false,
      fullscreen: true,
      focusable: true,
      skipTaskbar: true,
    },
    function () {
      ipcRenderer.sendTo(
        desktopWindow.webContents.id,
        "init",
        desktopWindow.webContents.id
      );
      utools.hideMainWindow();
      ipcRenderer.sendTo(desktopWindow.webContents.id, "showDesktop");
      desktopWindow.show();
   
      // desktopWindow.webContents.openDevTools();
      // 开发者工具
      // 监听子窗口隐藏事件
      ipcRenderer.on("hideDesktop", (e, data) => {
        desktopWindow.hide();
        // utools.outPlugin()
        // desktopWindow.minimize();
      });
      desktopWindow.on('show', () => {
        // 在窗口关闭时执行一些操作
        desktopWindow.focus()
    });
      // 监听子窗口关闭事件
      // ipcRenderer.on("close", (e, data) => {
      //   desktopWindow.close();
      // });
    }
  );
  return desktopWindow;
}

let desktopWindow = null;
if (!desktopWindow) {
  desktopWindow = createDesktopWindow();
}

utools.onPluginEnter(({ code, type, payload, option }) => {
  if (!desktopWindow) {
    desktopWindow = createDesktopWindow();
  } else {
    utools.hideMainWindow();
    ipcRenderer.sendTo(desktopWindow.webContents.id, "showDesktop");
    desktopWindow.show();

  }
});
