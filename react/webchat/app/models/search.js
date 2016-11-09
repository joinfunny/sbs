var app = require('../helper/base.js');
var Cache = require('../helper/cache.js');

var Search = app.BaseModel.extend({
	defaults: function() {
        return {
            type: ""
        }
    },
    clearHistory: function() {
    	this.srarchCache.clear('search_'+this.get('type'));
    },
    setHistory: function(text) {
        if(text==''){return};
		var history = this.getHistory();
		for(var i in history) {
            if(history[i] == text) {
                history.splice(i, 1);
            }
        }
		history.unshift(text);
        this.srarchCache.set('search_'+this.get('type'), history);
    },
	getHistory: function() {
        return this.srarchCache.get('search_'+this.get('type')) || [];
    },
    initialize: function() {
		this.srarchCache = new Cache('search_'+this.get('type'), 365*24*60*60*1000);
    }
});

module.exports = Search;