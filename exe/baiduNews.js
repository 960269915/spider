let cheerio = require('cheerio'); //分析dom
const superagent = require('superagent'); //请求接口
const Nightmare = require('nightmare'); // 自动化测试包，处理动态页面(出来页面的内容，是动态加载的)
const nightmare = Nightmare({
  show: false
}); // show:true  显示内置模拟浏览器


let hotNews = []; // 热点新闻
let localNews = []; // 本地新闻

superagent.get('http://news.baidu.com/').end((err, res) => {
  if (err) {
    console.log(err);
  } else {
    getHot(res)
  }
})

let getHot = (res) => {
  // 返回结果在res.text
  let $ = cheerio.load(res.text);
  $('#pane-news ul li a').each((index, ele) => {
    let news = {
      title: $(ele).text(), // 获取新闻标题
      href: $(ele).attr('href') // 获取新闻网页链接
    };
    hotNews.push(news) // 存入最终结果数组
  })
}




nightmare
  .goto('http://news.baidu.com/')
  .wait("div#local_news") //div#local_news 等待当前dom节点渲染
  .evaluate(() => document.querySelector("div#local_news").innerHTML) //解析节点的值
  .then(htmlStr => {
    // 获取本地新闻数据
    getocalNews(htmlStr)
  })
  .catch(error => {
    console.log(`本地新闻抓取失败 - ${error}`);
  })

let getocalNews = (htmlStr) => {
  let $ = cheerio.load(htmlStr);
  $("#localnews-focus li a").each((index, ele) => {
    let news = {
      title: $(ele).text(), // 获取新闻标题
      href: $(ele).attr('href') // 获取新闻网页链接
    };
    localNews.push(news)
  })
}