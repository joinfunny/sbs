var app = require('../helper/base.js');
var Cache = require('../helper/cache.js');

var City = app.BaseModel.extend({
    setHistory: function(cityInfo) {
        var citys = this.getHistory();
        for(var i in citys) {
            if(citys[i].id == cityInfo.id) {
                citys.splice(i, 1);
            }
        }

        citys.unshift(cityInfo);
        // 保证最多6个城市
        citys = citys.slice(0, 6);

        this.historyCache.set('history', citys);
    },
    getHistory: function() {
        return this.historyCache.get('history') || [];
    },
    initialize: function() {
        this.historyCache = new Cache('history', 365*24*60*60*1000); // 缓存一年
    }
});

module.exports = City;