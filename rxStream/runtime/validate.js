var _ = require('lodash');
var util = require('util');
var validator = {
	required: function(str) {
		return _.trim(str).length > 0;
	},
	isArray:function(arr){
		return util.isArray(arr);
	},
	isPlainObject:function(obj){
		return _.isPlainObject(obj);
	}
}
module.exports = validator;