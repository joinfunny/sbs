var fs = require('fs');
var _data=fs.readFile('content.txt', 'utf-8', function(err, data) {
	if (err) {
		console.log(err);
	} else {
		console.log(data);
	}
})

console.log(_data);//undefined;

try{
	var data=fs.readFileSync('content1.txt','utf-8');
	console.log(data);	
}catch(err){
	console.log(err);
}


