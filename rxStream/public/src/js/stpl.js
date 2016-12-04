;
(function() {
	'use strict';
	
	var isArray = Array.isArray;
	var rRNG = /[\r\n]/g;
	var rSQG = /\'/g;
	
function stpl(tpl, data){
    var fn = function(d) {
        var i = -1, k = [], v = [], l;
		if(isArray(d)){
			l = d.length;
			while(++i < l){
            	k.push(i);
            	v.push(d[i]);
			}
		}
        else for (i in d) {
			if(d.hasOwnProperty(i)){
            	k.push(i);
            	v.push(d[i]);
			}
        };
        return (new Function(k, fn.$)).apply(d, v);
    };
    if(!fn.$){
        var tpls = tpl.replace(rRNG, "").split('[:'), i = -1, l = tpls.length, p;
        // log(tpls);
        fn.$ = "var $=''";
        while(++i < l){
            p = tpls[i].split(':]');
            if(i!=0){
                fn.$ += '='==p[0].charAt(0)
                  ? "+("+p[0].substr(1)+")"
                  : ";"+p[0]+"$=$"
            }
            fn.$ += "+'"+p[p.length-1].replace(rSQG,"\\'")+"'"
        }
        fn.$ += ";return $;";
        // log(fn.$);
    }
    return data ? fn(data) : fn;
}
	//
	var exports = this;

	// Expose the class either via AMD, CommonJS or the global object
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return stpl;
		});
	} else if (typeof module === 'object' && module.exports) {
		module.exports = stpl;
	} else {
		exports.stpl = stpl;
	}

	return stpl;

}.call(this));