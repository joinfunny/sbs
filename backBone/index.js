var Person = Backbone.Model.extend({

	initialize: function() {

		console.log('hello world.');

		this.bind('change:name', function() {
			console.log(this.get('name') + ' is now the value for name .');
		});

		this.bind('error', function(model, error) {
			console.error(error);
		});
	},
	validate: function(attributes) {
		if (attributes.name == 'Joe') {

			return "Uh oh,you're name is joe!"
		}
	},

	defaults: {
		name: 'joinfunnyBdevDDDDDDDD',
		height: '3\"'
	}

})

var p = new Person({
	name: "joinfunny",
	height: '6\'2"'
});

p.set({
	name: 'Joe'
});

console.log(p.toJSON());

var Links = Backbone.Model.extend({
	data: [{
		text: "Google",
		href: "http://google.com"
	}, {
		text: "Facebook",
		href: "http://facebook.com"
	}, {
		text: "Youtube",
		href: "http://youtube.com"
	}]
});


var View = Backbone.View.extend({
	// options --> 提供给构造函数的对象
	initialize: function(options) {
		console.log(options.blankOption);//报错了。。
		console.log(this.el);
		$('body').append(this.el)
	}
});

//var view = new View({ blankOption: "empty string" });
//var view = new View({ el: $("#list") });
var view = new View({
	tagName: 'li',
	className: 'class',
	id: '',
	attributes: ''
});

var view1 = new View({
	tagName: 'div',
	className: 'class1',
	id: '',
	attributes: ''
});

var View1 = Backbone.View.extend({
	initialize: function() {
		console.log(this.el);
		//this.render();
	},
	el: '#container',
	template: $('#list-template'),
	events: {
		"click button": 'render'
	},
	render: function() {
		var data = this.model.data;
		for (var i = 0, len = data.length; i < len; i++) {
			var li = this.template
				.clone()
				.find('a')
				.attr('href', data[i].href)
				.text(data[i].text)
				.end();
			this.$el
				.find('ul#list').append(li);
		}

	}
})
var model1 = new Links();
var view2 = new View1({
	model: model1
});

var Router = Backbone.Router.extend({
	routes: {
		"foo/:bar": "paramtest",
		"*action": "func"
	},
	func: function(action) {
		console.log(action);
	},
	paramtest: function(p) {
		console.log(p);
	}
});
new Router();

Backbone.history.start();

// 创建集合!
var People = Backbone.Collection.extend({
    // 当集合被创建时调用
    initialize: function() {
        console.log("People Collection is initialized");
    },
 
    // 定义存入集合的数据模型
    model: Person
});
 
// 创建一个新的Person对象
var person = new Person({name:"Joe"});
 
// 建立一个集合，然后将Person对象加入这个集合中
var people = new People(person);
people.add([{name:"Bob"}, {name:"Jim"}]);
people.add([{name:"Bob1"}, {name:"Jim1",sex:1}]);
 
// 在控制台中，打出这个数据模型的数据
console.log(people.toJSON());


var B=_.extend({},Backbone.Events);
var C={};
B.on('logFoo',function () {
    console.log('foo');
});
 
B.on('logBar',function () {
    console.log('bar');
},C);
 
B.trigger('logFoo logBar'); //日志 后台输出foo以及bar
B.off(null,null,C); //删除包含C上下文的所有事件
B.trigger('logFoo logBar'); //日志无,因为所有包含C文本的事件被删除了


var myModel = new Backbone.Model();

console.log('myModel = new Backbone.Model();');

console.log('myModel Instance Properties:');
//$('#instance').append(_.keys(myModel));
console.log(_.keys(myModel));

console.log('myModel Prototype Properties & Methods:');
//$('#prototype').append(_.keys(Object.getPrototypeOf(myModel)));
console.log(_.keys(Object.getPrototypeOf(myModel)));

