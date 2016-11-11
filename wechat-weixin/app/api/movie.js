var mongoose = require('mongoose')
var Movie = mongoose.model('Movie')
var koa_request = require('koa-request')
var Category = mongoose.model('Category')

// index page
exports.findAll = function *() {
    var categories = yield Category
	    .find({})
	    .populate({
			path: 'movies',
			select: 'title poster',
			options: { limit: 6 }
	    })
    	.exec()
    	return categories
}

// search page
exports.searchByCategory = function *(catId) {
	var categories = yield Category
		.find({_id: catId})
		.populate({
		path: 'movies',
		select: 'title poster'
		})
		.exec()

    return categories
}

exports.searchByName = function *(q) {
	var movies = yield Movie
		.find({title: new RegExp(q + '.*', 'i')})
		.exec()

    return movies
}
// 豆瓣
exports.searchByDouban = function *(q) {
	var options = {
		url: 'https://api.douban.com/v2/movie/search?q='
	}
	
	options.url += encodeURIComponent(q)

	var response = yield koa_request(options)
	var data = JSON.parse(response.body)
	var subjects = []
	var movies = []

	if(data && data.subjects) {
		subjects = data.subjects
	}
	if(subjects.length > 0) {
		var queryArray = []
		subjects.forEach(function(item){
			  queryArray.push(function *() { 
				var movie = yield Movie.findOne({doubanId: item.id})

				if (movie) {
					movies.push(movie)
				}
				else {
					var directors = item.directors || []
					var director = directors[0] || {}

					movie = new Movie({
						director: director.name || '',
						title: item.title,
						doubanId: item.id,
						poster: item.images.large,
						year: item.year,
						genres: item.genres || []
					})
					movie = yield movie.save()
					movies.push(movie)
				}
			})
		})
		yield queryArray
	}
	return movies 
}