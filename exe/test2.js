let cheerio = require('cheerio'); //分析dom
const superagent = require('superagent'); //请求接口
const path = require("path");
const fs = require("fs")
const async = require("async")
var request = require("request");


// 获取列表
function getList() {
  return new Promise((resolve, reject) => {
    superagent.get('https://www.meituri.com').end((err, res) => {
      if (err) {
        console.log(err);
      } else {
        const list = [];
        let $ = cheerio.load(res.text);
        $(".hezi ul li").each((index, ele) => {
          const url = $(ele).find("a").attr("href");
          const showUrl = $(ele).find("a").find('img').attr('src');
          const name = $(ele).find("p").eq(1).find("a").text();
          let info = {
            name,
            showUrl,
            url //详情的链接
          }
          list.push(info)
          resolve(list)
        })
      }
    })
  })
}

// 获取分页
async function getPage(info, page, getPath) {
  if (!info || !info.showUrl) {
    return false;
  }
  let urlArr = info.showUrl.split("/");
  let url = '';
  if (page == 0) {
    url = `https://www.tujigu.com/${urlArr[3]}/${urlArr[5]}/`;
  } else {
    url = `https://www.tujigu.com/${urlArr[3]}/${urlArr[5]}/` + parseInt(page + 1) + '.html';
  }
  const p = new Promise((resolve, reject) => {
    superagent.get(url).end((err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
  const plist = [];
  p.then((res) => {
    let $ = cheerio.load(res.text);
    let maxpage = $("#pages a").eq($("#pages a").length - 2).text();
    $('.content img').each(async (index, ele) => {
      const p = new Promise((resolve, reject) => {
        let url = $(ele).attr("src");
        let lastIndex = url.lastIndexOf("/");
        let name = url.substr(lastIndex + 1); //获取文件名称
        let writeStream = fs.createWriteStream(getPath + '/' + name);
        let readStream = request(url)
        readStream.pipe(writeStream);
        writeStream.on('finish', () => {
          resolve();
        })
      })
      plist.push(p)
    })
    Promise.all(plist).then(res => {
      let page_in = page;
      if (page_in < maxpage) {
        page_in++;
        getPage(info, page_in, getPath)
      }
    })
  }).catch((err) => {
    console.log(err);
  })
}


// 创建文件夹
function mkdir(info) {
  const writePath = path.join(__dirname, '../asset/img/' + info.name)
  var isExist = fs.existsSync(writePath);
  if (isExist) {
    return writePath
  } else {
    fs.mkdirSync(path.join(__dirname, '../asset/img/' + info.name))
    return writePath
  }
}


async function saveImg() {
  try {
    let list = await getList()
    list = list.filter((item) => {
      return item.name != ""
    });
    // 获取n个列表的详情
    // getPage(list[0], 0, mkdir(list[0]))
    for (let i = 0; i < list.length; i++) {
      // 获取n个列表的存储地址
      const getPath = mkdir(list[i]);
      getPage(list[i], i, getPath)
    }
  } catch (error) {
    console.log(error);
  }
}
saveImg()