const response = require('./utils/response');
const log = require('./utils/log');
const collect = require('./collect');

exports.collect = function(params, app){

    // 判断是否为json
    var selector,policy;
    var error_params = [];
    try{
        selector = JSON.parse(params.selector);
    } catch(e){
        error_params.push("selector");
    }
    try{
        policy = JSON.parse(params.policy);
    } catch(e){
        error_params.push("policy");
    }
    if(error_params.length > 0){
        log.warn('参数错误：'+error_params);
        return response.param_error(error_params);
    }

    // 判断参数空值
    var empty_params = [];
    if(!('url' in params) || params.url === '') {
        empty_params.push('url');
    }
    if(!('article_num' in params) || params.article_num === '') {
        empty_params.push('article_num');
    }
    if(!('article_list' in selector) || selector.article_list === '') {
        empty_params.push('selector.article_list');
    }
    if(!('title_list' in selector) || selector.title_list === '') {
        empty_params.push('selector.title_list');
    }
    if(!('content' in selector) || selector.content === '') {
        empty_params.push('selector.content');
    }
    if(!('publish_time' in selector) || selector.publish_time === '') {
        empty_params.push('selector.publish_time');
    }
    if((!('page_up' in selector) || selector.page_up === '') && selector.page_up === 'BUTTON') {
        empty_params.push('selector.page_up');
    }
    if(empty_params.length > 0){
        log.warn('参数为空：'+empty_params);
        return response.param_empty(empty_params);
    }

    // 设置默认值
    if(!('article_num' in params) || params.article_num === '') {
        params.article_num = 50;
    }
    if(!('page_up' in policy) || policy.page_up === ''){
        if(!('page_up' in selector) || selector.page_up === ''){
            policy.page_up = 'SCROLL';
        } else {
            policy.page_up = 'BUTTON';
        }
    }
    if(!('get_url' in policy) || policy.get_url=== '') {
        policy.get_url = 'SELECTOR';
    }
    if(!('get_content' in policy) || policy.get_content=== '') {
        policy.get_content = 'NO';
    }

    // 文章收集逻辑
    collect(params.url,params.article_num,selector,policy)
    .then(() => {
        log.info('执行完毕');
    })
    .catch(err => {
        log.error(err.stack);
    });

    // 同步返回
    return response.success();
}
