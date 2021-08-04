const fs = require('fs');
const path = require("path");

let page = 1;

// 模仿动态获取数据
function getList(pageObj) {
  let list = [];
  for (let i = 0; i < pageObj.pageIndex; i++) {
    list.push({
      name: `文档${i}`,
      value: `文档${i} * ${pageObj.pageIndex}`
    })
  }
  return new Promise((resolve, reject) => {
    resolve(list)
  })
}

// 创建文件夹
function mkdir(page) {
  const paths = path.join(__dirname, '../asset/txt/' + `${page}页`);
  return new Promise((resolve, reject) => {
    var isExist = fs.existsSync(paths);
    if (isExist) {
      resolve(paths)
      return;
    }
    fs.mkdir(paths, err => {
      if (err) {
        console.log(err);
      } else {
        resolve(paths)
      }
    })
  })
}

async function saveTxt(page) {
  const plist = [];
  const path = await mkdir(page);
  const list = await getList({
    pageSize: 10,
    pageIndex: page
  });
  list.forEach(item => {
    const p = new Promise((resolve, reject) => {
      fs.writeFile(`${path}/${item.name}`, `我的内容是${item.value}`, err => {
        if (err) {
          reject(err)
        } else {
          resolve(item.value)
        }
      })
    })
    plist.push(p);
  });
  Promise.all(plist).then(res => {
    if (page < 10) {
      page++;
    } else {
      return
    }
    console.log(res);
    saveTxt(page)
  })
}

saveTxt(1)