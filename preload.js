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
      showDesktop(desktopWindow);

      desktopWindow.webContents.openDevTools();
      // 开发者工具
      // 监听子窗口隐藏事件
      ipcRenderer.on("hideDesktop", (e, data) => {
        desktopWindow.hide();
      });
    }
  );
  return desktopWindow;
}
// utools.setExpendHeight(0);

let desktopWindow = null;
if (!desktopWindow) {
  desktopWindow = createDesktopWindow();
}
// 监听插件进入事件
utools.onPluginEnter(({ code, type, payload, option }) => {
  // utools.setExpendHeight(0);

  if (!desktopWindow) {
    desktopWindow = createDesktopWindow();
  } else {
    showDesktop(desktopWindow);
  }
});

// 打开链接
window.openUrl = function (url) {
  utools.shellOpenExternal(url);
};

// 显示桌面
function showDesktop(desktopWindow) {
  if (!desktopWindow) {

    desktopWindow = createDesktopWindow();
  } else {
    // 隐藏主窗口
    utools.hideMainWindow();
    // utools.removeSubInput();
    // 通知子窗口显示, 播放动画
    ipcRenderer.sendTo(desktopWindow.webContents.id, "showDesktop");
    // 显示子窗口
    desktopWindow.show();
    // utools.simulateMouseClick();
  }
}
