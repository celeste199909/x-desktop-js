import { Desktop } from "./class/Desktop.js";
import { strContainsChinese, extractInitials } from "../js/utils.js";
const { pinyin } = pinyinPro;

$(document).ready(function () {
  // 删除本地排序信息
  // utools.dbStorage.removeItem("sortInfo");
  const deskLayout = getDeskLayout(); // 获取桌面布局信息
  // console.log("桌面布局信息:", deskLayout);
  const localSetting = getLocalSettings(); // 获取本地设置
  // console.log("本地设置:", localSetting);
  const localSortInfo = getLocalSortInfo(); // 获取本地图标排序信息
  console.log("本地图标排序信息:", localSortInfo);
  // 获取图标信息
  window.getDesktopIcons(function (rawIcons) {
    const handledIcons = handleDesktopIcons(rawIcons); // 处理图标信息
    // console.log("经过处理的图标:", handledIcons);
    const pagesData = resolvePagesData(deskLayout, localSortInfo, handledIcons); // 将图标数据和页面信息进行处理
    // console.log("页面图标数据:", pagesData);
    const desktopView = new Desktop(deskLayout, localSetting, pagesData); // 初始化桌面视图
    desktopView.init();
  });
});

// 获取本地设置
function getLocalSettings() {
  // 获取本地设置
  let settings = null;
  try {
    settings = utools.db.get("settings");
  } catch (error) {
    console.log("error:", error);
  }
  if (!settings) {
    // 如果没有设置，则设置默认值
    settings = {
      _id: "settings",
      theme: "auto",
    };
    const res = utools.db.put(settings);
    // settingdb_rev = res.rev;
    settings = res;
  }
  return settings;
}

// 处理图标信息 1 分类 2添加搜索关键字
function handleDesktopIcons(rawIcons) {
  //  分类
  const handledIcons = {}; // { rawName: {}, ...}

  rawIcons.forEach((icon) => {
    icon.rawName = icon.iconName;
    // 给 icon 添加 一个id
    icon.id = Math.random().toString(36).slice(-8);
    // 存放搜索关键字的数组
    icon.searchKeywords = [];
    const splitList = icon.iconName.split(".");
    // 获取文件后缀名
    const fileType = splitList[splitList.length - 1];
    // 去除文件后缀名
    icon.iconName = icon.iconName.replace(/\.[^/.]+$/, "");
    // 为图标添加搜索关键字
    if (strContainsChinese(icon.iconName)) {
      // 如果是中文
      // 1转换为拼音 2去除点 3并转换为小写： wei xin
      const searchingStr = pinyin(icon.iconName, { toneType: "none" })
        .replace(/\./g, "")
        .toLowerCase();
      // 去除空格，并放入索引数组 weixin
      icon.searchKeywords.push(searchingStr.replace(/\s/g, ""));
      // 用空格分割成数组，扁平化数组，并放入索引数组
      icon.searchKeywords.push(...searchingStr.split(" "));
      // 提取首字母 wx
      icon.searchKeywords.push(extractInitials(searchingStr));
      // searchKeywords = [weixin, wx]
      // console.log("icon.searchKeywords:", icon.searchKeywords);
    } else {
      // 如果是英文
      // 转成小写, 去除点
      const searchingStr = icon.iconName.replace(/\./g, "").toLowerCase();
      // 去除空格，并放入索引数组
      icon.searchKeywords.push(searchingStr.replace(/\s/g, ""));
      // 用空格分割成数组，扁平化数组，并放入索引数组
      icon.searchKeywords.push(...searchingStr.split(" "));
      // 提取首字母
      icon.searchKeywords.push(extractInitials(searchingStr));
      // console.log("icon.searchKeywords:", icon.searchKeywords);
    }

    // 设置图标的类型，分为应用、文件夹和文件，放入不同的数组中
    if (fileType === "lnk") {
      icon.type = "app";
      icon.suffix = fileType;
    } else if (splitList.length === 1) {
      icon.type = "folder";
      // 修改文件夹图标
      icon.iconImage = "../assets/folder-64.png";
    } else {
      icon.type = "file";
      icon.suffix = fileType;
    }
    handledIcons[icon.rawName] = icon;
    // console.log(icon);
  });
  return handledIcons;
}

// 获取本地页面和图标信息, 保存了图标的排序信息
function getLocalSortInfo() {
  // 获取本地页面和图标信息
  let sortInfo = null;
  try {
    sortInfo = utools.dbStorage.getItem("sortInfo");
  } catch (error) {
    console.log("error:", error);
  }
  if (!sortInfo) {
    return [];
  } else {
    return sortInfo;
  }
}

// 获取桌面布局信息
function getDeskLayout() {
  let deskLayout = {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
    paddingX: 0.1,
    paddingY: 0.08,
    cellLength: 140,
    row: 0,
    column: 0,
  };

  deskLayout.column = Math.floor(
    (deskLayout.width * (1 - deskLayout.paddingX * 2)) / deskLayout.cellLength
  );
  deskLayout.row = Math.floor(
    (deskLayout.height * (1 - deskLayout.paddingY * 2)) / deskLayout.cellLength
  );

  return deskLayout;
}

// 将图标数据和页面信息进行处理
function resolvePagesData(deskLayout, localSortInfo, handledIcons) {
  // 代表所有页面的数组，每个元素（数组）是一个页面，包含了页面的图标名字 rawName
  // localSortInfo [ ["rawName", "rawName"], ["rawName", "rawName"]]
  // {
  //   rawName:{
  //      rawName: "rawName", // 原始名称
  //      id: "id", // id
  //      iconName: "iconName", // 图标名称, 去除后缀
  //      iconImage: "iconImage", // 图标图片
  //      realPath: "realPath", // 图标真实路径
  //      searchKeywords: ["searchKeywords", "searchKeywords"], // 搜索关键字
  //      type: "type", // 图标类型
  //      suffix: "suffix" // 图标后缀
  //  },
  // ...
  // }
  let sortInfo = localSortInfo;
  const handledIconsKeys = Object.keys(handledIcons);

  // 如果本地没有页面信息, 自行计算
  if (sortInfo.length === 0) {
    // 计算页面数量
    const pageCount = Math.ceil(
      handledIconsKeys.length / (deskLayout.row * deskLayout.column)
    );
    // 获取 handledIcons 的key
    for (let i = 0; i < pageCount; i++) {
      let page = [];
      for (let j = 0; j < deskLayout.row * deskLayout.column; j++) {
        if (handledIconsKeys[j]) {
          page.push(
            handledIconsKeys[j + i * deskLayout.row * deskLayout.column]
          );
        }
      }
      sortInfo.push(page);
    }
    console.log("没有本地数据时, sortInfo:", sortInfo);
  }

  // 处理页面信息
  let iconsData = [];
  // 已删除的图标
  // let deletedIcons = [];
  // 新增的图标
  let newIcons = [];
  // 根据 loalPages 的信息，将图标信息分配到不同的页面中，并排序
  for (let i = 0; i < sortInfo.length; i++) {
    const pageIcons = [];
    sortInfo[i].forEach((rawName) => {
      if (handledIcons[rawName]) {
        // 如果图标信息中有该图标，则将图标信息添加到页面信息中
        pageIcons.push(handledIcons[rawName]);
        // 删除图标信息中的该图标
        delete handledIcons[rawName];
      }
      // 如果图标信息中没有该图标，则将该图标添加到已删除的图标中
      //  const deletedIcon = {
      //   rawName: rawName,
      //   iconName: rawName,
      //   iconImage: "../assets/deleted-96.png",
      //   id: Math.random().toString(36).slice(-8),
      //   searchKeywords: [],
      //   type: "deleted",
      //   suffix: "",
      //   realPath: "",
      // };
    });
    // 将页面信息添加到页面数据中
    iconsData.push(pageIcons);
  }
  // 删除的图标
  // console.log("删除的图标:", deletedIcons);
  // 将剩余的图标设为新图标
  // console.log("剩余的图标:", handledIcons);
  newIcons = Object.values(handledIcons);
  console.log("新增的图标:", newIcons);
  return {
    sortInfo: sortInfo,
    iconsData: iconsData,
    // deletedIcons: deletedIcons,
    newIcons: newIcons,
  };
}
