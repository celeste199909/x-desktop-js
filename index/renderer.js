// 定义处理图标信息的回调函数
function sortDesktopIcons(desktopIcons) {

  const sortedIcons = {
    apps: [],
    folders: [],
    files: []
  }

  desktopIcons.forEach((icon) => {
    
    const splitList = icon.iconName.split(".")
    const fileType = splitList[splitList.length - 1]
    console.log("splitList:", splitList);
    console.log("fileType:", fileType);

    if(fileType === "lnk") {
      icon.type = "shortcut"
      sortedIcons.apps.push(icon)
    }else if(splitList.length === 1) {
      icon.type = "folder"
      icon.iconImage = "../assets/folder-64.png"
      sortedIcons.folders.push(icon)
    }else {
      icon.type = "file"
      sortedIcons.files.push(icon)

    }
  });

  // console.log("sortedIcons:", sortedIcons);
  return sortedIcons;

}

//  渲染桌面图标信息
function renderDesktopIcons(desktopIcons) {
  // console.log("Desktop Icons:", desktopIcons);
  // 全部icon的容器
  const iconsWrapper = $("<div></div>").addClass("icons-wrapper");

  for (let key in desktopIcons) {
    console.log(key, desktopIcons[key]);
    desktopIcons[key].forEach((icon) => {
      // 单个icon的容器
      const iconElement = $("<div></div>").addClass("icon");
      iconElement.click(function () {
        utools.shellOpenPath(icon.realPath);
        window.hideDesk()
      });
      // 单个icon的图片
      const iconImage = $("<img>").addClass("icon-image");
      iconImage.attr("src", icon.iconImage)
      // 单个icon的名称
      const iconName = $("<span></span>").addClass("icon-name");
      iconName.text(icon.iconName.split(".")[0])

      $(iconElement).append(iconImage);
      $(iconElement).append(iconName);
      $(iconsWrapper).append(iconElement);
    });
  }

  // desktopIcons.forEach((icon) => {
  //   // 单个icon的容器
  //   const iconElement = $("<div></div>").addClass("icon");
  //   iconElement.click(function () {
  //     utools.shellOpenPath(icon.realPath);
  //     window.hideDesk()
  //   });
  //   // 单个icon的图片
  //   const iconImage = $("<img>").addClass("icon-image");
  //   iconImage.attr("src", icon.iconImage)
  //   // 单个icon的名称
  //   const iconName = $("<span></span>").addClass("icon-name");
  //   iconName.text(icon.iconName.split(".")[0])

  //   $(iconElement).append(iconImage);
  //   $(iconElement).append(iconName);
  //   $(iconsWrapper).append(iconElement);

  // });

  $("#app").append(iconsWrapper);
}

// 调用 getDesktopIcons，并传入回调函数作为参数
window.getDesktopIcons(function (desktopIcons) {
  // ; // 处理获取到的桌面图标信息
  renderDesktopIcons(sortDesktopIcons(desktopIcons)); // 处理获取到的桌面图标信息
});

// 渲染操作按钮
function renderOperationButtons() {

  const closeButton = $("<img>").addClass("button close-button");
  closeButton.attr("src", "../assets/close-96.png");
  closeButton.click(function () {
    window.hideDesk();
  });

  const settingButton = $("<img>").addClass("button setting-button");
  settingButton.attr("src", "../assets/setting-96.png");
  settingButton.click(function () {
    utools.showMainWindow();
    window.hideDesk();
  });

  $("#app").append(closeButton);
  $("#app").append(settingButton);
}

// 使用jquery监听#app元素，当键盘按下x键时 关闭窗口
$(document).keydown(function (e) {
  if (e.keyCode === 88) {
    window.hideDesk();
  }
});

