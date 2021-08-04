let cheerio = require('cheerio'); //分析dom
const superagent = require('superagent'); //请求接口
const path = require("path");
const fs = require("fs")
var request = require("request");
let writePath = ''

function getList(name, page) {
  // 以抓取地方名称创建文件夹
  writePath = path.join(__dirname, '../asset/lianjia/' + name)
  // const name = decodeURI(name) //解码
  const namein = encodeURI(name) //编码
  const url = 'https://cd.lianjia.com/ershoufang/' + (page > 1 ? 'pg' + page : '') + 'rs' + namein + '/';
  return new Promise((resolve, reject) => {
    superagent.get(url).end((err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res.text)
      }
    })
  })
}

async function info(page) {
  try {
    let text = await getList('大丰', page);
    var isExist = fs.existsSync(writePath);
    if (!isExist) {
      fs.mkdirSync(writePath);
    }
    const $ = cheerio.load(text);
    const plist = []
    $("ul.sellListContent li").each((index, item) => {
      const p = new Promise((resolve, reject) => {
        const posttiona = $(item).find('.flood').find('.positionInfo').find("a")
        const posttionStr = posttiona.eq(0).text() + posttiona.eq(1).text(); //位置信息
        const address = $(item).find(".address").find(".houseInfo").text(); //房屋信息
        const totalMoney = $(item).find(".priceInfo").find(".totalPrice span").text(); //总价
        const price = $(item).find(".priceInfo").find(".unitPrice").attr('data-price'); //单价
        resolve({
          posttionStr,
          address,
          totalMoney,
          price
        })
      })
      plist.push(p)
    })
    const pageBox = $('.house-lst-page-box').attr("page-data");
    const totalPage = (JSON.parse(pageBox)).totalPage;
    Promise.all(plist).then(res => {
      const savePath = '../asset/lianjia/' + '大丰/' + '第' + page + '页'
      var isExist = fs.existsSync(savePath);
      if (!isExist) {
        fs.mkdirSync(path.join(__dirname, savePath))
      }
      fs.writeFile(savePath + "/文档", JSON.stringify(res), (err) => {
        if (err) {
          return err
        } else {
          console.log(page + '页' + '抓取完成' + '等待3s后继续抓取');
          let timer = setTimeout(() => {
            if (page < 3) {
              info(++page)
            } else {
              console.log('所以数据抓取完成');
              clearTimeout(timer);
            }
          }, 3000)
        }
      })
    })

  } catch (error) {
    console.log(error);
  }
}

// info(1)





//链家账号 18180424837 caiyuntao199
// 获取链家我的收藏 链家登录有效期7天
let followList = []

function getFollw(page) {
  superagent.get(`https://user.lianjia.com/site/housedata/?p=${page}&filter=1`)
    .set({
      Cookie: "lianjia_uuid=9db7aa47-6bb3-49c3-be98-c11413cd1afa; select_city=510100; sajssdk_2015_cross_new_user=1; _smt_uid=6109f780.3de28ca2; _ga=GA1.2.38048646.1628043138; _gid=GA1.2.1864495304.1628043138; gr_user_id=f6521e59-cec8-4292-b478-9ba7975abc43; Hm_lvt_9152f8221cb6243a53c83b956842be8a=1628043147; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%2217b0eeecd17b71-0da11ae42f1736-35637203-1764000-17b0eeecd1816c1%22%2C%22%24device_id%22%3A%2217b0eeecd17b71-0da11ae42f1736-35637203-1764000-17b0eeecd1816c1%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_referrer%22%3A%22%22%2C%22%24latest_referrer_host%22%3A%22%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%7D%7D; lianjia_ssid=8c35d6cd-51da-04bc-f1f4-a11498dc3889; login_ucid=2000000026142729; lianjia_token=2.0013ce56006bc3d3e502637f31562124c3; lianjia_token_secure=2.0013ce56006bc3d3e502637f31562124c3; security_ticket=LJ7TCcAmKy0phymDpXwgLASGDreSowXf53YTZNwm3hNZ9VFInFVrj3KbzMm+YOVmz61zb3o7+hJM6G+a6cNhy6fzdt3hEMTLNIf6UpHh8LW28FFvlOo3xW3GZMZsRzTNs3AnMFEvYxijtkCxjDeifdITCJpmdwCJYIMJxJsAC58=; Hm_lvt_efa595b768cc9dc7d7f9823368e795f1=1628057946; gr_session_id_a1a50f141657a94e=c8bf4329-4a98-4d91-adba-7e11879e75ec; Hm_lpvt_9152f8221cb6243a53c83b956842be8a=1628058045; gr_session_id_a1a50f141657a94e_c8bf4329-4a98-4d91-adba-7e11879e75ec=true; _gat=1; _gat_past=1; _gat_global=1; _gat_new_global=1; _gat_dianpu_agent=1; Hm_lpvt_efa595b768cc9dc7d7f9823368e795f1=1628058058; srcid=eyJ0Ijoie1wiZGF0YVwiOlwiZTJhNGFlYjk1NDZhZjA5ODc1ODM4NTBkODIxMzczOWJjYWNmMjhjNzhlOTcwZTI0NDc2M2NiMzU5Y2I5MDc0ZjI4MzMyYjg1OGVkNzE0ODIxZjliMzllMmIwZDYwNWYzYzEwZWFiOTFmMWU2MmE4YzVmMGI2MGUyNmYzYjY4ZmRlZTcwYzdjNDcwYTA1MDIwYjQ0ZjVlZjQ0OTJiMzk2MTFhOWE3NjNlZDljYWYwZWNjMzZhMDhkZGJjYWRjZjA4OGY0NzBiNWMyYjFjZTljNTk2YWRiOTI3M2FhMTBlMGI1NzFiNGFlM2VjMGI3ZmQxZWU3NGY3MGZlMjk0ZjY3ZjJmNDMyN2ZlMGJmZGI1MGFlZjBiN2RmNDU2MzhkODRmNzQyOTU5OWNjNjRmYzkwYjUzZGY3NTU4MDgyMWMyZmJmOWI5OTU1ZTI0NjdhMDBiM2E1Y2JjMjU3M2VkNzU1M1wiLFwia2V5X2lkXCI6XCIxXCIsXCJzaWduXCI6XCI4NDFmYTVjM1wifSIsInIiOiJodHRwczovL3VzZXIubGlhbmppYS5jb20vc2l0ZS9mYXZvckhvdXNlLyIsIm9zIjoid2ViIiwidiI6IjAuMSJ9",
      Referer: "https://user.lianjia.com/site/favorHouse/"
    })
    .end((err, res) => {
      if (err) {
        console.log(err);
      } else {
        let resinfo = JSON.parse(res.text)
        followList = followList.concat(resinfo.data.list);
        if (page < resinfo.data.totalPage) {
          getFollw(++page)
        } else {
          const savePath = '../asset/lianjia/' + '大丰/' + '收藏'
          var isExist = fs.existsSync(savePath);
          if (!isExist) {
            fs.mkdirSync(path.join(__dirname, savePath))
          }
          fs.writeFile(savePath + "/文档", JSON.stringify(followList), (err) => {
            if (err) {
              return err
            } else {
              console.log('所以数据抓取完成');
            }
          })
        }
      }
    })
}

getFollw(1)