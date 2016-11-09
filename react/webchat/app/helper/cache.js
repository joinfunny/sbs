'use strict';
/**
 * LocalStorage 缓存，带过期时间
 */
function Cache(prefix, expired) {
    // 存储前缀
    this.prefix = 'cache_prefix_'+(prefix || '');
    // 过期时间
    this.expired = expired || 30*60*1000;
    // 清理过期数据
    this.checkExpired();
    // 浏览器支持本地存储,隐身模式下不支持
    this.supported = this.support();
}

Cache.prototype.support = function() {
    var testKey = 'test', storage = window.sessionStorage;
    try {
        storage.setItem(testKey, '1');
        storage.removeItem(testKey);
        return true;
    } catch (error) {
        return false;
    }
};

Cache.prototype.getKey = function(key) {
    return [this.prefix, key].join('_');
};

Cache.prototype.set = function(key, value, expired) {
    if(!this.supported) return false;
    if(!key || !value) return false;

    var item = {
        expired: (expired || this.expired) + Date.now(),
        value: value
    };

    localStorage.setItem(this.getKey(key), JSON.stringify(item));

    return true;
};

Cache.prototype.get = function(key) {
    if(!this.supported) return false;
    if(!key) return false;

    var item = localStorage.getItem(this.getKey(key));

    try {
        item = JSON.parse(item);

        if(Date.now() > item.expired) {
            localStorage.clear(this.getKey(key));
            return false;
        }

        return item.value;
    } catch(e) {
        return false;
    }
};

Cache.prototype.clear = function(key) {
    if(!this.supported) return false;

    if(key) {
        localStorage.removeItem(this.getKey(key));
    } else {
        for(var i in localStorage) {
            if(localStorage.hasOwnProperty(i)) {
                if(i.indexOf(this.prefix) == 0) {
                    localStorage.removeItem(i);
                }
            }
        }
    }


    return true;
};

Cache.prototype.clearPage = function() {
    if(!this.supported) return false;
    var key = location.pathname + location.search;

    this.clear(key);
}

Cache.prototype.checkExpired = function() {
    if(!this.supported) return false;
    for(var i in localStorage) {
        if(localStorage.hasOwnProperty(i)) {
            if(i.indexOf(this.prefix) == 0) {
                var item = localStorage.getItem(i);
                try {
                    item = JSON.stringify(item);

                    if(item.expired < Date.now()) {
                        localStorage.clear(i);
                    }
                } catch(e) {}
            }
        }
    }
};

var instances = {};

Cache.singleton = function(prefix, expired) {
    if(!instances[prefix]) {
        instances[prefix] = new Cache(prefix, expired);
    }

    return instances[prefix];
};

Cache.singletonAjax = function() {
    return this.singleton('ajx_page_');
};

module.exports = Cache;