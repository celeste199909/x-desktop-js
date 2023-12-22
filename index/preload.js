// import "./style.css";
const { readdir, realpathSync } = require("fs");
const { ipcRenderer,  } = require("electron");

// 获取桌面图标信息
window.getDesktopIcons = function (callback) {
  const desktopIcons = [];

  const desktopPath = utools.getPath("desktop");

  readdir(desktopPath, (err, files) => {


    if (err) {
      console.error("Error reading directory:", err);
      callback(desktopIcons); // 在出错时返回空的 desktopIcons 数组
      return;
    }

    files.forEach((file) => {
      // console.log("file:", file);

      // 或者快捷方式的真正路径
      const realPath = realpathSync(desktopPath + "/" + file);

      desktopIcons.push({
        iconName: file,
        iconImage: utools.getFileIcon(realPath),
        realPath: realPath,
      });
    });

    callback(desktopIcons); // 返回 desktopIcons 数组
  });
};
let winId = ""
// 关闭窗口
window.hideDesk = function () {
  ipcRenderer.sendTo(winId, "hide");
};

// 保存窗口id
ipcRenderer.on('init', (event, data) => {
    winId = event.senderId;
})
