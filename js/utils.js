// utils.js

// 函数用于检测字符串是中文还是英文
function strContainsChinese(str) {
  // 检查字符串中是否有中文字符
  const containsChinese = /[\u4e00-\u9fff]/.test(str);
  return containsChinese;
}

// 函数用于提取字符串中的首字母
function extractInitials(str) {
  // 使用正则表达式将字符串拆分为单词数组
  const words = str.split(/[\s-_]+/);
  // 提取每个单词的首字母并拼接成字符串
  const initials = words.map(word => word.charAt(0)).join('');
  return initials;
}

// 深拷贝
const deepCopy = (obj, visited = new WeakMap()) => {
  // 如果是基本类型或者已经被访问过的对象，则直接返回
  if (typeof obj !== 'object' || obj === null || visited.has(obj)) {
    return obj;
  }

  // 避免循环引用
  if (visited.has(obj)) {
    return visited.get(obj);
  }

  // 处理对象或数组
  const newObj = Array.isArray(obj) ? [] : {};

  // 将当前对象放入已访问过的列表
  visited.set(obj, newObj);

  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = deepCopy(obj[key], visited); // 递归复制嵌套对象
    }
  }

  return newObj;
};


// 导出函数，以便其他文件可以引入并使用
export { strContainsChinese, extractInitials, deepCopy };
