exports.success = function(){
    return {
        "responseCode":"000",
        "responseMsg":"请求成功，任务处理中"
    }
}
exports.error = function(msg){
    return {
        "responseCode":"999",
        "responseMsg":"错误："+msg
    }
}
exports.param_empty = function(params){
    return {
        "responseCode":"990",
        "responseMsg":"参数为空:"+params
    }
}
exports.param_error = function(params){
    return {
        "responseCode":"991",
        "responseMsg":"参数错误:"+params
    }
}