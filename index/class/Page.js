import { Icon } from "./Icon.js";
import { Alert } from "../../components/Alert.js";

export class Page {
  constructor(options, handledIcons, desktop) {
    // 选项
    this.pageIndex = options.pageIndex;
    this.capacity = options.capacity;
    this.options = options;
    // 布局
    this.layout = desktop.layout;
    this.desktop = desktop;
    // 图标
    this.handledIcons = handledIcons;
    this.icons = [];
    // 编辑模式
    // this._onEditMode = false;
    this.sortable = null;
    // 移动时的timer
    this.moveEventTrigger = false;
  }

  // 初始化
  init() {
    // 渲染页面
    this.renderPage();
    // 设置拖动
    this.initSortable();
    // 元素事件监听
    this.pageElementListener();
  }

  // 渲染页面
  renderPage() {
    const pageElement = $("<div></div>")
      .addClass("page")
      .attr("id", `page-${this.pageIndex + 1}`)
      .appendTo("#pages");

    // 设置页面padding-bottom
    pageElement.css({
      "padding-bottom": `${this.layout.paddingY * this.layout.height * 1.2}px`,
    });
    const appsWrapper = $("<div></div>")
      .addClass("apps-wrapper")
      .attr("id", `apps-wrapper-${this.pageIndex + 1}`)
      .appendTo(pageElement);
    // // 设置grid布局
    appsWrapper.css({
      width: `${this.layout.column * this.layout.cellLength}px`,
      height: `${this.layout.row * this.layout.cellLength}px`,
      "grid-template-columns": `repeat(${this.layout.column}, ${this.layout.cellLength}px)`,
      "grid-template-rows": `repeat(${this.layout.row}, ${this.layout.cellLength}px)`,
      // 间隔
      gap: `${this.layout.cellLength * 0.1}px`,
    });

    // 渲染图标
    this.handledIcons.forEach((icon) => {
      const iconInstance = new Icon(icon, this.desktop);
      appsWrapper.append(iconInstance.getIconElement());
      this.icons.push(iconInstance);
    });
  }

  // 设置拖动
  initSortable() {
    const self = this;
    const desktop = this.desktop;
    const appsWrapperElement = document.querySelector(
      `#apps-wrapper-${this.pageIndex + 1}`
    );
    // 设为 sortable
    const sortable = Sortable.create(appsWrapperElement, {
      group: "page",
      animation: 150,
      //停靠位置的自定义样式
      ghostClass: "sortable-ghost",
      //选中元素的自定义样式
      chosenClass: "sortable-chosen",
      //拖拽时的自定义样式
      dragClass: "sortable-drag",
      onEnd: (evt) => {
        console.log("evt:", evt);

        // 获取拖动的图标
        const icon = this.icons[evt.oldIndex];
        // 重新排列图标数组
        this.icons.splice(evt.oldIndex, 1);
        this.icons.splice(evt.newIndex, 0, icon);
        // 重新渲染页面
      },
      // 移动时如果超出 apps-wrapper ，页面切换
      onStart: function (evt) {
        console.log(evt);
        var index = evt.oldIndex;
      },
      onMove: function (evt) {
        // 如果图标容量已满，图标回到原位
        if (evt.to.children.length >= self.capacity && evt.to !== evt.from) {
          // 如果不是同一个容器
          new Alert("桌面剩余空间不足");
          return false;
        }
        // 如果去往的是left-area 或者 right-area，图标回到原位
        if (
          evt.to.id === "left-area"
        ) {

          // 如果已经触发过一次，不再触发
          if (this.moveEventTrigger) {
            return false;
          }

          this.moveEventTrigger = true;
          this.moveTimer = setTimeout(() => {
            this.moveEventTrigger = false;
          }, 1000);
          console.log("去往的是left-area 或者 right-area");
          desktop.moveToPage(desktop.currentPageIndex - 1);
          return false;
        }
        // 如果去往的是right-area，图标回到原位
        if (
          evt.to.id === "right-area"
        ) {
          console.log("去往的是right-area");
          // 如果已经触发过一次，不再触发
          if (this.moveEventTrigger) {
            return false;
          }

          this.moveEventTrigger = true;
          this.moveTimer = setTimeout(() => {
            this.moveEventTrigger = false;
          }, 1000);
          console.log("去往的是left-area 或者 right-area");
          desktop.moveToPage(desktop.currentPageIndex + 1);
          return false;
        }
        console.log("evt:", evt);
        console.log("被拖拽的对象所在区域 {left, top, right, bottom}", evt.draggedRect);
        console.log("鼠标的位置",evt.clientY);
      },
    });
    console.log("sortable", sortable);
    this.sortable = sortable;
    // 初始禁用
    // sortable.option("disabled", true);
  }

  //   元素事件监听
  // 在编辑模式下,点击桌面时,退出编辑模式
  pageElementListener() {
    // 点击桌面时,退出编辑模式
    $(".page").on("click", (e) => {
      // 阻止事件冒泡
      e.stopPropagation();
      // 获取页面id
      const pageId = e.currentTarget.id;
      console.log("pageId:", pageId);
      // 获取页面索引
      const pageIndex = parseInt(pageId.split("-")[1]) - 1;
      if (this.desktop.onEditMode) {
        this.desktop.moveToPage(pageIndex);
      }
    });
  }
}
