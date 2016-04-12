Person=BackBone.Model.extend({

	initialize:function(){
		console.log('hello world.');
	},

	defaults:{
		name:'joinfunny',
		height:'3\"'
	}

})

var p=new Person({name:"joinfunny",height:'6\'2"'});

console.log(p.get('name'));