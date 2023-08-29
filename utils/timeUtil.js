
exports.dateToStr = date => {
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    month = (Array(2).join(0) + parseInt(month)).slice(-2);
    var day = date.getDate();
    day = (Array(2).join(0) + parseInt(day)).slice(-2);
    var hour = date.getHours();
    hour = (Array(2).join(0) + parseInt(hour)).slice(-2);
    var minute = date.getMinutes();
    minute = (Array(2).join(0) + parseInt(minute)).slice(-2);
    var second = date.getSeconds();
    second = (Array(2).join(0) + parseInt(second)).slice(-2);
    return year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;
}

exports.strToDate = str => {
    var tempStrs = str.split(" ");
    var dateStrs = tempStrs[0].split("-");
    var year = parseInt(dateStrs[0], 10);
    var month = parseInt(dateStrs[1], 10) - 1;
    var day = parseInt(dateStrs[2], 10);
    var timeStrs = tempStrs[1].split(":");
    var hour = parseInt(timeStrs [0], 10);
    var minute = parseInt(timeStrs[1], 10);
    var second = parseInt(timeStrs[2], 10);
    var date = new Date(year, month, day, hour, minute, second);
    return date;
}

exports.currentTime = () => {
    return this.dateToStr(new Date());
}

exports.formatTime = str => {
    if(match = str.match(/(\w+)(秒|分钟|小时|天|周)(前|后)/)){
        const num = match[1];
        const unit = match[2];
        const direct = match[3];
        var time;
        if(direct === '前'){
            if(unit === '秒') {
                time = new Date(new Date().getTime()-num*1000);
            } else if(unit === '分钟') {
                time = new Date(new Date().getTime()-num*1000*60);
            } else if(unit === '小时') {
                time = new Date(new Date().getTime()-num*1000*60*60);
            } else if(unit === '天') {
                time = new Date(new Date().getTime()-num*1000*60*60*24);
            } else if(unit === '周') {
                time = new Date(new Date().getTime()-num*1000*60*60*24*7);
            }
        } else if(direct === '后'){
            if(unit === '秒') {
                time = new Date(new Date().getTime()+num*1000);
            } else if(unit === '分钟') {
                time = new Date(new Date().getTime()+num*1000*60);
            } else if(unit === '小时') {
                time = new Date(new Date().getTime()+num*1000*60*60);
            } else if(unit === '天') {
                time = new Date(new Date().getTime()+num*1000*60*60*24);
            } else if(unit === '周') {
                time = new Date(new Date().getTime()+num*1000*60*60*24*7);
            }
        }
        
        return this.dateToStr(time);
    } else if(match = str.match(/\w{4}-\w{1,2}-\w{1,2} \w{1,2}:\w{1,2}:\w{1,2}/)){
        return match[0];
    } else if(match = str.match(/\w{4}-\w{1,2}-\w{1,2}/)){
        return match[0];
    } else if(match = str.match(/\w{1,2}-\w{1,2}/)){
        let year = new Date().getFullYear();
        return year+"-"+match[0];
    } else if(match = str.match(/(\w{4})(\w{2})\/(\w{2})(\w{2}:\w{2})/)){
        return match[1]+"-"+match[2]+"-"+match[3]+" "+match[4]+":00";
    } else if(match = str.match(/昨天/)){
        return this.dateToStr(new Date(new Date().getTime()-1000*60*60*24));
    } else if(match = str.match(/前天/)){
        return this.dateToStr(new Date(new Date().getTime()-1000*60*60*24*2));
    } else {
        throw '无法识别时间：'+str;
    }
}