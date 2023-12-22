// 开发者可以暴露自定义 API 供后加载脚本使用
// preload.js 中使用 nodejs
const { globalShortcut } = require("electron");

const { ipcRenderer } = require("electron");

function createDeskWindow() {
  const ubWindow = utools.createBrowserWindow(
    "./index/index.html",
    {
      show: false,
      title: "desktop",
      webPreferences: {
        // devTools: true,
        preload: "./index/preload.js",
      },
      // menuBarVisible: false,
      frame: false,
      transparent: true,
      backgroundColor: "#00000000",
      alwaysOnTop: false,
      resizable: false,
    },
    () => {
      utools.hideMainWindow();
      // 显示
      ubWindow.show();
      // 置顶
      ubWindow.setAlwaysOnTop(true);
      // 窗口全屏
      ubWindow.setFullScreen(true);
      // 开发者工具
      ubWindow.webContents.openDevTools();
      // 向子窗口传递数据
      ubWindow.webContents.send("init", ubWindow.webContents.id);
      // 神秘代码 大坑
      for (var i = 1; i <= 5; i++) {
        setTimeout(
          () => ipcRenderer.sendTo(ubWindow.webContents.id, "init"),
          i * 200
        );
      }
      // 监听子窗口隐藏事件
      ipcRenderer.on("hide", (e, data) => {
        ubWindow.hide();
      });
     
    }
  );
  return ubWindow;
}
createDeskWindow();

// app.on('will-quit', () => {
//   // 注销快捷键
//   globalShortcut.unregister('Shift+X')

//   // 注销所有快捷键
//   globalShortcut.unregisterAll()
// })
