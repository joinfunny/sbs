var crypto=require('crypto');
//返回一个数组，包含支持的加密算法的名字。
console.log(crypto.getCiphers());
//返回一个包含所支持的哈希算法的数组。
console.log(crypto.getHashes());