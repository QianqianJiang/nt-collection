const timeUtil = require('./timeUtil')

exports.info = function(msg){
    console.info('['+timeUtil.currentTime()+'] [INFO] '+msg);
}
exports.debug = function(msg){
    console.debug('['+timeUtil.currentTime()+'] [DEBUG] '+msg);
}
exports.warn = function(msg){
    console.warn('['+timeUtil.currentTime()+'] [WARN] '+msg);
}
exports.error = function(msg){
    console.error('['+timeUtil.currentTime()+'] [ERROR] '+msg);
}
