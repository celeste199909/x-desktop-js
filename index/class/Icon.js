export class Icon {
  constructor(icon, desktop) {
    this.id = icon.id;
    this.rawName = icon.rawName;
    this.iconName = icon.iconName;
    this.iconImage = icon.iconImage;
    this.realPath = icon.realPath;
    this.searchKeywords = icon.searchKeywords;
    this.type = icon.type;
    this.suffix = icon.suffix;
    this.isNew = icon.isNew;

    this.desktop = desktop;
    this._searchTarget = false;
    this._selectedTarget = false;
  }

  get searchTarget() {
    return this._searchTarget;
  }

  /**
   * @param {boolean} value
   */
  set searchTarget(value) {
    this._searchTarget = value;
    if (value) {
      // 添加类名 设为搜索目标
      $(`#${this.id}`).addClass("search-target");
      $(`#${this.id}`).removeClass("not-search-target");
    } else {
      // 移除类名 取消搜索目标
      $(`#${this.id}`).removeClass("search-target");
      $(`#${this.id}`).addClass("not-search-target");
    }
  }

  get selectedTarget() {
    return this._selectedTarget;
  }

  /**
   * @param {boolean} value
   */
  set selectedTarget(value) {
    this._selectedTarget = value;
    // console.log("this._selectedTarget:", this._selectedTarget);
    if (value) {
      console.log("设置新选中目标");
      // 添加类名 设为选中目标
      $(`#${this.id}`).addClass("selected-target");
    } else {
      // 移除类名 取消选中目标
      $(`#${this.id}`).removeClass("selected-target");
    }
  }

  // 渲染图标
  getIconElement(state) {
    // 单个icon的容器
    const iconElement = $("<div></div>").addClass("icon");
    // 设置id
    iconElement.attr("id", this.id.toString());
    if(this.isNew){
      iconElement.addClass("new-icon");
    }
    // 单个icon的点击事件
    iconElement.on("click", (e) => {
      // 如果是编辑模式
      if (this.desktop.onEditMode) {
        console.log("处于编辑模式");
        return;
      }
      // 如果已被删除
      if(this.type === "deleted"){
        return;
      }
      // 如果是新的图标
      if(this.isNew){
        this.isNew = false;
        iconElement.removeClass("new-icon");
        return;
      }

      // 阻止事件冒泡
      e.stopPropagation();

      utools.shellOpenPath(this.realPath);
      window.hideDesk();
    });
    // 把搜索索引的第一个关键字作为类名
    iconElement.addClass(this.searchKeywords[0]);
    // 单个icon的图片
    const iconImageElement = $("<img>").addClass("icon-image");
    // 禁止拖动图片
    iconImageElement.attr("draggable", false);
    iconImageElement.attr("src", this.iconImage);
    // 单个icon的名称
    const iconNameElement = $("<span></span>").addClass("icon-name");
    iconNameElement.text(this.iconName.split(".")[0]);

    iconElement.append(iconImageElement);
    iconElement.append(iconNameElement);
    return iconElement;
  }
}
