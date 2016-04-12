var myModule=require('./module');
var hello1 =require('./module');
console.log(myModule===hello1);//true
myModule.setName('world1');										
myModule.sayHello();//hello world1