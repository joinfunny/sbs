module.exports = function(req, res, next) {
    var cookieObj = {};
    var cookie = req.headers['cookie'] || '';
    var cookies = cookie.split(';');
    cookies.forEach((value, key) => {
        value = value.trim().split('=');
        var name = value[0] || '';
        var value = value[1] || '';
        if(name) {
            cookieObj[name] = value;
        }
    });

    req.requestCookie = cookieObj;

    next();
};