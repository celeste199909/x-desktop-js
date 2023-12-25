const { pinyin } = pinyinPro;
import { StrContainsChinese, extractInitials } from "../js/utils.js";

$(document).ready(function () {
  let handledIcons = [];
  // utools.db.remove("settings")
  let settings = null;
  // console.log(111);
  applySettings();
  // 开始写 jQuery 代码...
  // 获取图标并渲染，并传入回调函数作为参数top
  window.getDesktopIcons(function (desktopIcons) {
    // 处理获取到的桌面图标信息
    // console.log("desktopIcons:", desktopIcons);
    handledIcons = handleDesktopIcons(desktopIcons);
    // console.log("desktopIcons:", handledIcons);
    renderDesktopIcons(handledIcons);
    // 使用键盘快速搜索图标
    searchDesktopIcons(handledIcons);
  });
  // 监听子窗口隐藏事件 按下esc ctrl键隐藏窗口
  hideDeskListener();

  // 设置 1 切换主题
  switchTheme();
  // 设置 2 调整背景透明度
  // setBgTransparency();

  // 设置 1 切换主题
  function switchTheme() {
    $("#light-theme").click(function () {
      console.log("light-theme clicked");
      // 保存设置
      settings.theme = "light";
      utools.db.put(settings);

      $("#theme-style").attr("href", "theme/theme-light.css");
    });

    $("#dark-theme").click(function () {
      console.log("dark-theme clicked");
      // 保存设置
      settings.theme = "dark";
      utools.db.put(settings);
      $("#theme-style").attr("href", "theme/theme-dark.css");
    });
  }
  // 设置 2 调整背景透明度
  // function setBgTransparency() {
  //   // 获取css变量
  //   // 获取根元素上的 CSS 变量
  //   // let rootStyles = getComputedStyle(document.documentElement);
  //   // 获取定义在 :root 上的 CSS 变量值
  //   // let bgTransparency = rootStyles.getPropertyValue("--bg-transparency");
  //   // 把变量值设置到滑块上
  //   // $("#bg-transparency-slider").val(Number(bgTransparency));

  //   $("#bg-transparency-slider").on("input", function () {
  //     const transparencyValue = $(this).val(); // 获取滑块值（0-1之间）
  //     console.log(transparencyValue);
  //     $(":root").attr("style", "--bg-transparency:" + transparencyValue); // 设置背景透明度变量
  //     // 保存设置
  //     settings.bgTransparency = Number(transparencyValue);
  //     console.log(settings);
  //     utools.db.put(settings);
  //   });
  // }
  // 监听子窗口隐藏事件 按下esc ctrl键隐藏窗口
  function hideDeskListener() {
    // 监听esc Ctrl 键按下事件
    $(document).keydown(function (event) {
      // 监听 Ctrl 键按下事件
      if (event.ctrlKey || event.which === 17 || event.which === 27) {
        console.log("Ctrl key is pressed");
        window.hideDesk();
        // window.closeDesk();
      }
    });

    // 监听点击空白处隐藏窗口
    // $(document).click(function (event) {
    //   console.log("event.target:", event.target);
    //   console.log("event.target.id:", event.target.id);
    //   console.log("event.target.className:", event.target.className);
    //   console.log("event.target.classList:", event.target.classList);
    //   if (
    //     event.target.id === "app"
    //   ) {
    //     console.log("click on the desktop");
    //     window.hideDesk();
    //   } else {
    //     console.log("click on other place");
    //     // window.hideDesk();
    //   }
    // });
  }
  // 处理图标信息 1 分类 2添加搜索关键字
  function handleDesktopIcons(desktopIcons) {
    // 分类
    const handledIcons = {
      apps: [],
      folders: [],
      files: [],
    };

    desktopIcons.forEach((icon) => {
      // 存放搜索关键字的数组
      icon.searchingList = [];
      const splitList = icon.iconName.split(".");
      // 获取文件后缀名
      const fileType = splitList[splitList.length - 1];
      // 去除文件后缀名
      icon.iconName = icon.iconName.replace(/\.[^/.]+$/, "");
      // 为图标添加搜索关键字
      if (StrContainsChinese(icon.iconName)) {
        // 如果是中文
        // 1转换为拼音 2去除点 3并转换为小写： wei xin
        const searchingStr = pinyin(icon.iconName, { toneType: "none" })
          .replace(/\./g, "")
          .toLowerCase();
        // 去除空格，并放入索引数组 weixin
        icon.searchingList.push(searchingStr.replace(/\s/g, ""));
        // 用空格分割成数组，扁平化数组，并放入索引数组
        icon.searchingList.push(...searchingStr.split(" "));
        // 提取首字母 wx
        icon.searchingList.push(extractInitials(searchingStr));
        // searchingList = [weixin, wx]
        // console.log("icon.searchingList:", icon.searchingList);
      } else {
        // 如果是英文
        // 转成小写, 去除点
        const searchingStr = icon.iconName.replace(/\./g, "").toLowerCase();
        // 去除空格，并放入索引数组
        icon.searchingList.push(searchingStr.replace(/\s/g, ""));
        // 用空格分割成数组，扁平化数组，并放入索引数组
        icon.searchingList.push(...searchingStr.split(" "));
        // 提取首字母
        icon.searchingList.push(extractInitials(searchingStr));
        // console.log("icon.searchingList:", icon.searchingList);
      }

      // 设置图标的类型，分为应用、文件夹和文件，放入不同的数组中
      if (fileType === "lnk") {
        icon.type = "shortcut";
        icon.suffix = fileType;
        handledIcons.apps.push(icon);
      } else if (splitList.length === 1) {
        icon.type = "folder";
        // 修改文件夹图标
        icon.iconImage = "../assets/folder-64.png";
        handledIcons.folders.push(icon);
      } else {
        icon.type = "file";
        icon.suffix = fileType;
        handledIcons.files.push(icon);
      }
    });
    console.log("handledIcons:", handledIcons);
    return handledIcons;
  }
  // 渲染桌面图标信息
  function renderDesktopIcons(desktopIcons) {
    // console.log("Desktop Icons:", desktopIcons);
    // 全部icon的容器
    const iconsWrapper = $("<div></div>").addClass("icons-wrapper");

    for (let key in desktopIcons) {
      // console.log(key, desktopIcons[key]);
      desktopIcons[key].forEach((icon) => {
        // 单个icon的容器
        const iconElement = $("<div></div>").addClass("icon");
        iconElement.click(function () {
          utools.shellOpenPath(icon.realPath);
          window.hideDesk();
        });
        // 把搜索索引的第一个关键字作为类名
        iconElement.addClass(icon.searchingList[0]);
        // 单个icon的图片
        const iconImage = $("<img>").addClass("icon-image");
        iconImage.attr("src", icon.iconImage);
        // 单个icon的名称
        const iconName = $("<span></span>").addClass("icon-name");
        iconName.text(icon.iconName.split(".")[0]);

        $(iconElement).append(iconImage);
        $(iconElement).append(iconName);
        $(iconsWrapper).append(iconElement);
      });
    }

    $("#app").append(iconsWrapper);
  }
  // 使用键盘快速搜索图标
  function searchDesktopIcons(desktopIcons) {
    // 快速搜索
    let inputText = "";
    let typingTimer;
    let keyIndicateElement = $("#keypress-indicate");

    $(document).on("keydown", function (event) {
      // 如果按下的是退格键，并且没有输入内容，则清除所有的search-target 和 search-target-first
      if (event.keyCode === 8 && !inputText) {
        $(".icon").removeClass("search-target");
        $(".icon").removeClass("non-search-target");
        $(".search-target-first").removeClass("search-target-first");
        return;
      }
      // 检查按下的键是否为字母、数字或退格键
      if (
        (event.keyCode >= 48 && event.keyCode <= 57) || // 数字 0-9
        (event.keyCode >= 65 && event.keyCode <= 90) || // 大写字母 A-Z
        (event.keyCode >= 97 && event.keyCode <= 122) || // 小写字母 a-z
        event.keyCode === 8 // 退格键
      ) {
        // console.log(desktopIcons);

        clearTimeout(typingTimer); // 清除之前的定时器

        // 如果是退格键，并且有输入内容，则删除最后一个字符
        if (event.keyCode === 8 && inputText.length > 0) {
          inputText = inputText.slice(0, -1);
          updateSearchTarget(desktopIcons, inputText);
          if (!inputText) {
            $("#keypress-indicate").hide();
            return;
          }
        } else if (event.keyCode !== 8) {
          // 将按下的键添加到inputText变量中
          inputText += event.key;
          updateSearchTarget(desktopIcons, inputText);
        }

        // 显示输入内容，使用淡入动画效果
        keyIndicateElement.text(inputText).stop(true, true).fadeIn();

        // 设置定时器，在三秒后清空inputText并隐藏key-indicate元素，使用淡出动画效果
        typingTimer = setTimeout(function () {
          inputText = "";
          // $(".icon").removeClass("search-target");
          // $(".search-target-first").removeClass("search-target-first");
          keyIndicateElement.stop(true, true).fadeOut();
        }, 3000);
      }
    });
  }
  // 根据输入的文本匹配并更新数组中的对象
  function updateSearchTarget(desktopIcons, inputText) {
    console.log("inputText:", inputText);
    // 清除监听事件
    $(document).off("keyup");
    // 清除所有的search-target-first
    $(".search-target-first").removeClass("search-target-first");
    // 清除所有的search-target
    if (!inputText) {
      $(".icon").removeClass("search-target");
      $(".icon").removeClass("non-search-target");
      return;
    }
    // console.log("inputText:", inputText);
    // console.log("inputText.toLowerCase():", inputText.toLowerCase());
    for (let key in desktopIcons) {
      desktopIcons[key].forEach((icon) => {
        // 重写匹配逻辑，如果搜索关键字中的任意一个单词匹配成功，则匹配成功
        let match = false;
        // console.log("icon.searchingList:", icon.searchingList);
        icon.searchingList.forEach((searchingStr) => {
          if (searchingStr.includes(inputText.toLowerCase())) {
            match = true;
            return;
          }
        });
        // 更新视图
        if (match) {
          icon.searchTarget = true; // 匹配成功
          $(`.${icon.searchingList[0]}`).addClass("search-target");
          $(`.${icon.searchingList[0]}`).removeClass("non-search-target");
        } else {
          icon.searchTarget = false; // 未匹配成功
          $(`.${icon.searchingList[0]}`).removeClass("search-target");
          $(`.${icon.searchingList[0]}`).addClass("non-search-target");
        }
      });
    }
    // 选中第一个匹配成功的图标
    $(`.search-target`).first().addClass("search-target-first");
    // 并添加键盘监听事件，当按下空格时打开该图标
    $(document).keyup(function (event) {
      if (event.keyCode === 32) {
        console.log("space key is pressed");
        $(`.search-target-first`).click();
      }
    });
    // console.log("desktopIcons:", desktopIcons);
  }
  // 获取并应用设置
  function applySettings() {
    // console.log("applySettings setting:", settings);
    // 获取设置
    try {
      settings = utools.db.get("settings");
    } catch (error) {
      console.log("error:", error);
    }
    if (!settings) {
      // console.log("settings is null：", settings);
      settings = {
        _id: "settings",
        theme: "dark",
      };
      res = utools.db.put(settings);
      settingdb_rev = res.rev;
      // console.log("settingdb_rev:", setting);
    }
    // console.log("applySettings setting:", settings);

    // // 设置主题
    if (settings.theme === "light") {
      $("#theme-style").attr("href", "theme/theme-light.css");
    } else if (settings.theme === "dark") {
      $("#theme-style").attr("href", "theme/theme-dark.css");
    }
    // 设置背景透明度
    // console.log("settings.bgTransparency:", settings);
    // $(":root").attr("style", "--bg-transparency:" + Number(settings.bgTransparency));
    // $("#bg-transparency-slider").val(Number(settings.bgTransparency));
  }
});
