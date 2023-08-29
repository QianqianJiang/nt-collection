const app = require('./app');

const server = app.listen(3670, function(){
    const port = server.address().port
    console.log("文章收集程序，启动成功")
})