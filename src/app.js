const
    https = require('https'),
    cheerio = require('cheerio'),
    writeToExcel = require('./writeToExcel');


class crawlData {

    constructor() {
        // 可修改的
        this.keyWord = "新媒体"; //搜索的关键字
        this.day = 1; //几日内发布的，可选1 3 7 30
        this.page = 99; //搜索页数，最大99
        // 不可修改的
        this.currentPage = 1;
        this.time = 5;
        this.baseUrl = 'https://www.liepin.com/zhaopin/?isAnalysis=&dqs=&pubTime=' + this.day + '&salary=&subIndustry=&industryType=&compscale=&key=' + this.keyWord + '&init=-1&searchType=1&headckid=d972e8aa8e1e9b4d&compkind=&fromSearchBtn=2&sortFlag=15&ckid=c271169962388d9a&degradeFlag=0&jobKind=&industries=&clean_condition=&siTag=rmq2QhgMEpRoDbxhhbxJDw%7EV6MwPcZ2ne9zYObRj7X8Rg&d_sfrom=search_prime&d_ckId=b72a40278e38614fcaf746600e0535d0&d_curPage=';
        this.result = [];
        this.init();

        console.log(`\x1B[46m间隔\x1B[7m ${this.time}秒 \x1B[27m释放一只爬虫， 最多等待\x1B[7m ${(this.page+1)*this.time}秒 \x1B[27m\x1B[49m`);
    }
    init() {
        let timer = setInterval(() => {
            if (this.currentPage > this.page) {
                clearInterval(timer);
                writeToExcel(this.keyWord, this.result);
                console.log(`\x1B[46m完成，共计获取${this.result.length}条数据\x1B[49m`);
            } else {
                this.getDataPackage(this.baseUrl + (this.currentPage + 1) + '&d_pageSize=40&d_headId=ad878683a46e56bca93e6f921e59a95&curPage=' + this.currentPage);
                console.log(`第${this.currentPage }只爬虫已出发 已获取${this.result.length}条数据`);
                this.currentPage++;
            }
        }, 1000 * this.time);
    }
    getDataPackage(url) {
        https.get(url, (response) => {
            var chunks = [];
            var size = 0;
            response.on('data', function (chunk) {
                chunks.push(chunk);
                size += chunk.length;
            });
            response.on('end', () => {
                let data = Buffer.concat(chunks, size);

                let html = data.toString();

                let $ = cheerio.load(html);
                if ($('.sojob-list').find('.job-info').length == 0) {
                    this.currentPage = this.page + 1
                    return
                }
                $('.sojob-list').find('.job-info').each(i => {
                    let map = {};
                    //  个人基本信息

                    let baseOthersInfo = $('.job-info').eq(i).find('.condition').attr('title');
                    baseOthersInfo = baseOthersInfo.split("_");

                    map.职务名称 = $('.job-info').eq(i).find('h3').attr('title').slice(2);
                    map.薪资待遇 = baseOthersInfo[0];
                    map.工作地点 = baseOthersInfo[1];
                    map.学历要求 = baseOthersInfo[2];
                    map.工作经验 = baseOthersInfo[3];
                    map.链接地址 = $('.job-info').eq(i).find('h3').find('a').attr('href');
                    map.公司名称 = $('.company-info').eq(i).find('.company-name a').text()
                    map.公司主页 = $('.company-info').eq(i).find('.company-name a').attr('href')
                    this.result.push(map);
                    map = {};

                });
            });
        });
    }
}
//  一个数据包40条，最多是99 * 40 = 3960条
new crawlData();