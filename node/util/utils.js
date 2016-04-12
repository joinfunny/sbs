var util = require('util');
var bar = 123;
util.debuglog('hello from foo [%d]', bar);
/**
 * util.format(format, [...])
 * 根据第一个参数，返回一个格式化字符串，类似printf的格式化输出。
 *  %s - 字符串.
	%d - 数字 (整型和浮点型).
	%j - JSON. 如果这个参数包含循环对象的引用，将会被替换成字符串 '[Circular]'。
	%% - 单独一个百分号('%')。不会消耗一个参数。
 */

var out = util.format('%s:%s', 'foo'); // 'foo:%s'
console.log(out);
/*如果有多个参数占位符，
  额外的参数将会调用util.inspect()转换为字符串。这些字符串被连接在一起，并且以空格分隔。
*/
out = util.format('%s:%s', 'foo', 'bar', 'baz'); // 'foo:bar baz'
console.log(out);

/*如果第一个参数是一个非格式化字符串，
那么util.format()将会把所有的参数转成字符串，
以空格隔开，拼接在一块，并返回该字符串。
util.inspect()会把每个参数都转成一个字符串。*/
out = util.format(1, 2, 3); // '1 2 3'
console.log(out);

/*在控制台进行输出，并带有时间戳。*/
util.log('Timestamped message.');


/*util.inspect(object, [options])
	返回一个对象的字符串表现形式, 在代码调试的时候非常有用.
	options:{
		showHidden: - 如果设为 true，那么该对象的不可枚举的属性将会被显示出来。默认为false.
		depth: - 告诉 inspect 格式化对象的时候递归多少次。这个选项在格式化复杂对象的时候比较有用。 默认为 2。如果想无穷递归下去，则赋值为null即可。
		colors: - 如果设为true，将会以ANSI颜色代码风格进行输出. 默认是false。颜色是可定制的.
		customInspect: - 如果设为 false，那么定义在被检查对象上的inspect(depth, opts) 方法将不会被调用。 默认为true。
	}*/
//console.log(util.inspect(util, { showHidden: true, depth: null }));


util.isArray([])
  // true
util.isArray(new Array)
  // true
util.isArray({})
  // false

util.isRegExp(/some regexp/)
  // true
util.isRegExp(new RegExp('another regexp'))
  // true
util.isRegExp({})
  // false
  

util.isDate(new Date())
  // true
util.isDate(Date())
  // false (没有关键字 'new' 返回一个字符串)
util.isDate({})
  // false
  
util.isError(new Error())
  // true
util.isError(new TypeError())
  // true
util.isError({ name: 'Error', message: 'an error occurred' })
  // false



/*util.inherits(constructor,superConstructor);
类的基于原型的继承*/

function Base () {
	this.name='base';
	this.base=1991;
	this.sayHello=function  () {
		console.log('hello '+this.name);
	}
}


Base.prototype.showName=function(){
	console.log(this.name);
}

function Sub(){
	this.name='sub';
}

util.inherits(Sub,Base);

var objBase=new Base();
objBase.showName();//base
objBase.sayHello();//hello base
console.log(objBase);


var objSub=new Sub();
objSub.showName();//sub
objSub.sayHello();//报错。此方法不属于原型继承。
console.log(objSub);