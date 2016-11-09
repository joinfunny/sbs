"use strict";
/*var a = [];
for (var i = 0; i < 10; i++) {
    var c = i;
    a[i] = function () {
        console.log(c);
    }
};

a[6]();*/

//let关键字：定义块级作用域
var a = [];
for (var i = 0; i < 10; i++) {
    let c = i;
    a[i] = function () {
        console.log(c);
    }
};

a[5]();


//ES6明确规定，如果区块中存在let和const命令，这个区块对这些命令声明的变量，从一开始就形成了封闭作用域。凡是在声明之前就使用这些变量，就会报错。
var tmp=123;
if(true){
    let tmp;
    tmp='abc';
    console.log(tmp);
}