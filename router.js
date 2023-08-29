const bodyParser= require("body-parser");
const api = require('./api');
const log = require('./utils/log');

module.exports = function(app){
    app.use(bodyParser.urlencoded({ extended: false }));

    app.get("/health",function(req,res){
        
        res.send('ok');
    })

    app.post("/collect",function(req,res){
        
        var params = req.body;

        log.debug("收集文章-请求参数："+JSON.stringify(params));
        var result = api.collect(params, req.app);
        log.debug("收集文章-响应结果："+JSON.stringify(result));

        res.json(result);
    })
}
