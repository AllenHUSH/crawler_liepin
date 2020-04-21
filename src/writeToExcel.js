const XLSX = require('xlsx'),
    fs = require('fs')

let writeToExcel = (dataArr) => {
    fs.mkdir('results',()=>{});
    let wb = XLSX.utils.book_new();
    ws = XLSX.utils.json_to_sheet(dataArr);
    XLSX.utils.book_append_sheet(wb, ws, 'sheet1');

    let time = new Date()
    let year = time.getFullYear().toString()
    let month = time.getMonth().toString()
    let day = time.getDate().toString()
    XLSX.writeFile(wb, `./results/${year + month + day}.xls`); //将数据写入文件
};
module.exports = writeToExcel