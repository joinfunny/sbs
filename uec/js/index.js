(function(){
	var boy = $("#j_home .boy");
	var boyOne = function(){
		boy.removeClass("boyFour");
		boy.addClass("boyOne");
		window.setTimeout(boyTwo,5000);
	};
	var boyTwo = function(){
		boy.removeClass("boyOne");
		boy.addClass("boyTwo");

		window.setTimeout(boyThr,5000);
	};
	var boyThr = function(){
		boy.removeClass("boyTwo");
		boy.addClass("boyThr");
		window.setTimeout(boyFour,5000);
	};
	var boyFour = function(){
		boy.removeClass("boyThr");
		boy.addClass("boyFour");
		window.setTimeout(boyOne,5000);
	};
	boyOne();
})();